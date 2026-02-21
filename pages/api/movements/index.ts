import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { auth } from "../../../lib/auth";
import { date } from "better-auth";

/**
 * @swagger
 * /api/movements:
 *   get:
 *     summary: Obtener todos los movimientos
 *     description: Retorna la lista de ingresos y egresos ordenados de más reciente a más antiguo. Requiere haber iniciado sesión.
 *     tags:
 *       - Movimientos
 *     responses:
 *       200:
 *         description: Lista de movimientos obtenida exitosamente.
 *       401:
 *         description: No autorizado. Debes iniciar sesión.
 *       500:
 *         description: Error al obtener los movimientos.
 *   post:
 *     summary: Crear un nuevo movimiento
 *     description: Registra un nuevo ingreso o egreso en la base de datos. Solo accesible para administradores (ADMIN).
 *     tags:
 *       - Movimientos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               concept:
 *                 type: string
 *                 example: "Pago de servicios"
 *               amount:
 *                 type: number
 *                 example: 150000
 *               type:
 *                 type: string
 *                 example: "EXPENSE"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-02-20"
 *     responses:
 *       201:
 *         description: Movimiento creado exitosamente.
 *       400:
 *         description: Faltan datos obligatorios o el monto es inválido.
 *       403:
 *         description: Acceso denegado. Solo administradores.
 *       500:
 *         description: Error al crear el movimiento.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //Verificar que el usuario haya iniciado sesión
  const session = await auth.api.getSession({ headers: req.headers as HeadersInit});
  console.log("Sesión actual:", session);
  
  if (!session) {
    return res.status(401).json({ error: "No autorizado. Debes iniciar sesión." });
  }

  //Obtener todos los movimientos
  if (req.method === "GET") {
    try {
      const movements = await prisma.movement.findMany({
        orderBy: { date: 'desc' }, // Primero los más recientes 
        include: { user: { select: { name: true } } } // Traer también el nombre del usuario que lo creó
      });
      return res.status(200).json(movements);
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener los movimientos" });
    }
  }

  // Crear un nuevo movimiento
  if (req.method === "POST") {
    //Se valida que solo los ADMIN pueden crear movimientos
    if (session.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Acceso denegado. Solo los administradores pueden crear movimientos." });
    }

    try {
      const { concept, amount, type, date } = req.body;

      // Validar que manden los datos correctos
      if (!concept || !amount || !type || !date) {
        return res.status(400).json({ error: "Faltan datos obligatorios (concept, amount, type)" });
      }
      
      const numericAmount = parseFloat(amount);

      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ error: "El monto debe ser un número válido mayor a cero" });
      }
      // Guardar en la base de datos
      const newMovement = await prisma.movement.create({
        data: {
          concept,
          amount: numericAmount,
          type,
          date: new Date(date),
          userId: session.user.id, // Se vincula automáticamente al usuario logueado
        },
      });

      return res.status(201).json(newMovement);
    } catch (error) {
      return res.status(500).json({ error: "Error al crear el movimiento" });
    }
  }

  // Si envían otro método
  return res.status(405).json({ error: "Método no permitido" });
}