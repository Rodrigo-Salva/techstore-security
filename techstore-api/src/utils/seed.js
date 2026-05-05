/**
 * Seed — crea roles, usuarios de prueba y productos del lab.
 * Se ejecuta automáticamente al iniciar el contenedor Docker.
 * Es idempotente: usa findOrCreate, no falla si ya existen los datos.
 */
require('dotenv').config()
const bcrypt = require('bcryptjs')
const { authenticator } = require('otplib')
const { sequelize, Rol, Usuario, UsuarioRol, Producto } = require('../models')

// ── Datos ────────────────────────────────────────────────────────────────────

const ROLES = [
  { nombre: 'Admin',    descripcion: 'Administrador del sistema — acceso total' },
  { nombre: 'Gerente',  descripcion: 'Gerente de tienda — gestiona su tienda' },
  { nombre: 'Empleado', descripcion: 'Empleado de ventas — actualiza stock' },
  { nombre: 'Auditor',  descripcion: 'Auditor — solo lectura y reportes' },
]

// Emails exactos de los casos de prueba del laboratorio
const USUARIOS = [
  { email: 'admin@techstore.com',         password: 'Admin123!',    nombre_completo: 'Admin TechStore',    tienda_id: null, rol: 'Admin'    },
  { email: 'gerente@techstore.com',       password: 'Gerente123!',  nombre_completo: 'Gerente Lima',       tienda_id: 1,    rol: 'Gerente'  },
  { email: 'gerente_lima@techstore.com',  password: 'Gerente123!',  nombre_completo: 'Gerente Lima Store', tienda_id: 1,    rol: 'Gerente'  },
  { email: 'empleado@techstore.com',      password: 'Empleado123!', nombre_completo: 'Empleado Ventas',    tienda_id: 1,    rol: 'Empleado' },
  { email: 'auditor@techstore.com',       password: 'Auditor123!',  nombre_completo: 'Auditor General',    tienda_id: null, rol: 'Auditor'  },
]

// Productos exactos de los casos de prueba del laboratorio
const PRODUCTOS = [
  { nombre: 'Laptop HP',         descripcion: 'Laptop HP Pavilion i7',  precio: 2500, stock: 10, categoria: 'Laptops',     tienda_id: 1, es_premium: true  },
  { nombre: 'Mouse Logitech',    descripcion: 'Mouse Logitech MX Master', precio: 150, stock: 50, categoria: 'Periféricos', tienda_id: 1, es_premium: false },
  { nombre: 'Monitor Dell 27"',  descripcion: 'Monitor Dell UltraSharp', precio: 1200, stock: 8,  categoria: 'Monitores',   tienda_id: 1, es_premium: true  },
  { nombre: 'MacBook Pro M3',    descripcion: 'MacBook Pro 14" M3',      precio: 8500, stock: 5,  categoria: 'Laptops',     tienda_id: 2, es_premium: true  },
  { nombre: 'Teclado Mecánico',  descripcion: 'Teclado Mecánico RGB',    precio: 300,  stock: 30, categoria: 'Periféricos', tienda_id: 2, es_premium: false },
]

// ── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  await sequelize.authenticate()
  await sequelize.sync({ alter: true })
  console.log('\n🌱 Ejecutando seed...\n')

  // 1. Roles
  const rolesMap = {}
  for (const r of ROLES) {
    const [rol, created] = await Rol.findOrCreate({
      where: { nombre: r.nombre },
      defaults: { descripcion: r.descripcion },
    })
    rolesMap[r.nombre] = rol
    console.log(`  ${created ? '✅' : '⏭ '} Rol: ${r.nombre}`)
  }

  // 2. Usuarios
  const usuariosMap = {}
  const secrets = {}
  for (const u of USUARIOS) {
    const mfa_secret = authenticator.generateSecret()
    const hash = await bcrypt.hash(u.password, 12)
    const [usuario, created] = await Usuario.findOrCreate({
      where: { email: u.email },
      defaults: {
        nombre_completo: u.nombre_completo,
        tienda_id:       u.tienda_id,
        password:        hash,
        mfa_habilitado:  true,
        mfa_secret,
      },
    })
    usuariosMap[u.email] = usuario
    secrets[u.email] = created ? mfa_secret : usuario.mfa_secret
    console.log(`  ${created ? '✅' : '⏭ '} Usuario: ${u.email} (${u.rol})`)

    // Asignar rol si no lo tiene
    await UsuarioRol.findOrCreate({
      where: { usuario_id: usuario.id, rol_id: rolesMap[u.rol].id },
      defaults: { asignado_por: usuariosMap['admin@techstore.com']?.id || 1 },
    })
  }

  // 3. Productos
  const adminId = usuariosMap['admin@techstore.com']?.id || 1
  for (const p of PRODUCTOS) {
    const [, created] = await Producto.findOrCreate({
      where: { nombre: p.nombre, tienda_id: p.tienda_id },
      defaults: { ...p, creado_por: adminId },
    })
    console.log(`  ${created ? '✅' : '⏭ '} Producto: ${p.nombre} (tienda ${p.tienda_id}${p.es_premium ? ', premium' : ''})`)
  }

  // 4. Tabla resumen
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                      USUARIOS DE PRUEBA — TechStore Lab08                     ║
╠══════════════════════════════════════╦═══════════════╦══════════╦═════════════╣
║  Email                               ║  Password      ║  Rol     ║  Tienda     ║
╠══════════════════════════════════════╬═══════════════╬══════════╬═════════════╣
║  admin@techstore.com                 ║  Admin123!     ║  Admin   ║  —          ║
║  gerente@techstore.com               ║  Gerente123!   ║  Gerente ║  1          ║
║  gerente_lima@techstore.com          ║  Gerente123!   ║  Gerente ║  1          ║
║  empleado@techstore.com              ║  Empleado123!  ║  Empleado║  1          ║
║  auditor@techstore.com               ║  Auditor123!   ║  Auditor ║  —          ║
╚══════════════════════════════════════╩═══════════════╩══════════╩═════════════╝

  ⚠  Cada usuario tiene su propio MFA secret. Para obtenerlos:
     SELECT email, mfa_secret FROM usuarios;

  📱 Google Authenticator → + → Ingresar clave de configuración → pegar secret
  `)
}

seed()
  .then(() => { console.log('✅ Seed completado.\n'); process.exit(0) })
  .catch(err => { console.error('❌ Error en seed:', err.message); process.exit(1) })
