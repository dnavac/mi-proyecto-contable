import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  // Decirle a Jest dónde está la app de Next.js
  dir: './',
})
 
// Configuración del entorno de pruebas
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
}
 
export default createJestConfig(config)