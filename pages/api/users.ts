import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuarios
 *     description: Retorna la lista de todos los usuarios registrados en el sistema. Solo accesible para ADMIN.
 *     tags:
 *       - Usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente.
 *       403:
 *         description: Acceso denegado. No eres Administrador.
 *       500:
 *         description: Error al obtener usuarios.
 *   put:
 *     summary: Actualizar usuario
 *     description: Modifica el rol y el nombre de un usuario específico. Solo accesible para ADMIN.
 *     tags:
 *       - Usuarios
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "clk123abc..."
 *               newRole:
 *                 type: string
 *                 example: "ADMIN"
 *               newName:
 *                 type: string
 *                 example: "Carlos Pérez"
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *       400:
 *         description: Faltan datos obligatorios.
 *       403:
 *         description: Acceso denegado. No eres Administrador.
 *       500:
 *         description: Error al actualizar el usuario.
 */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  //Verificar sesión,que el usuario sea ADMIN
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session || session.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Acceso denegado. Solo administradores pueden ver esto." });
  }
  //Listar usuarios
  if (req.method === "GET") {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, phone: true, role: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener usuarios" });
    }
  }

  // Actualizar el rol de un usuario
  if (req.method === "PUT") {
    try {
      const { userId, newRole,newName } = req.body;

      if (!userId || !newRole|| !newName) {
        return res.status(400).json({ error: "Faltan datos obligatorios (userId, newRole)" });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole, name: newName },
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({ error: "Error al actualizar el usuario" });
    }
  }

  return res.status(405).json({ error: "Método no permitido" });
}
    