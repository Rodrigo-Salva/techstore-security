# 🏪 TechStore API — Lab S08 Seguridad en la Nube

Sistema de Gestión de Inventario con autenticación MFA, RBAC y ABAC.
**Autor:** Jaime Farfán Madariaga | **Curso:** Desarrollo de Soluciones en la Nube

---

## 🚀 Instalación y Configuración

### 1. Requisitos previos
- Node.js v18+
- PostgreSQL 14+
- Google Authenticator (app móvil)

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
# Edita .env con tus credenciales de PostgreSQL
```

### 4. Crear base de datos
```sql
CREATE DATABASE techstore_db;
```

### 5. Iniciar servidor (crea tablas automáticamente)
```bash
npm run dev
```

### 6. Poblar con datos de prueba
```bash
npm run seed
```

---

## 🔐 Flujo de Autenticación (MFA - TOTP)

### Paso 1: Registrar usuario
```http
POST /auth/register
{
  "email": "nuevo@techstore.com",
  "password": "MiPass123!",
  "nombre_completo": "Juan Pérez",
  "tienda_id": 1
}
```
**Respuesta:** QR en base64 → abre Google Authenticator → escanea

### Paso 2: Login (obtiene token parcial)
```http
POST /auth/login
{
  "email": "nuevo@techstore.com",
  "password": "MiPass123!"
}
```
**Respuesta:** `token_parcial`

### Paso 3: Verificar MFA (obtiene token completo)
```http
POST /auth/mfa/verify
{
  "token_parcial": "<token del paso 2>",
  "codigo_mfa": "123456"
}
```
**Respuesta:** `token` completo → usar en Authorization: Bearer {token}

---

## 👥 Roles y Permisos (RBAC)

| Endpoint          | Admin | Gerente | Empleado | Auditor |
|-------------------|-------|---------|----------|---------|
| GET /roles        | ✅    | ✅      | ✅       | ✅      |
| POST /roles       | ✅    | ❌      | ❌       | ❌      |
| PUT /roles/:id    | ✅    | ❌      | ❌       | ❌      |
| DELETE /roles/:id | ✅    | ❌      | ❌       | ❌      |
| GET /usuarios     | ✅    | ❌      | ❌       | ❌      |
| POST /usuarios/:id/roles | ✅ | ❌  | ❌       | ❌      |

---

## 📦 Permisos de Productos (ABAC)

| Acción  | Admin          | Gerente                      | Empleado                    | Auditor     |
|---------|----------------|------------------------------|-----------------------------|-------------|
| SELECT  | Todos          | Solo su tienda               | Solo su tienda              | Todos (R/O) |
| INSERT  | Cualquier tienda| Solo su tienda              | Solo no-premium, su tienda  | ❌          |
| UPDATE  | Todo           | Todo en su tienda, sin categ.| Solo stock, su tienda       | ❌          |
| DELETE  | Cualquier prod.| No-premium, su tienda        | ❌                          | ❌          |

---

## 📡 Endpoints Completos

```
# Auth
POST   /auth/register
POST   /auth/login
POST   /auth/mfa/verify
GET    /auth/me

# Roles
GET    /roles
POST   /roles
PUT    /roles/:id
DELETE /roles/:id

# Usuarios
GET    /usuarios
GET    /usuarios/:id
PUT    /usuarios/:id
DELETE /usuarios/:id
POST   /usuarios/:id/roles
DELETE /usuarios/:id/roles/:rol_id

# Productos
GET    /productos
GET    /productos/:id
POST   /productos
PUT    /productos/:id
DELETE /productos/:id
GET    /productos/audit-logs
```

---

## 🧪 Casos de Prueba del Lab

### Escenario 1: Login con MFA ✅
1. POST /auth/login → obtén token_parcial
2. POST /auth/mfa/verify con código Google Authenticator → acceso concedido

### Escenario 2: RBAC - Empleado intenta crear rol ❌
```http
POST /roles
Authorization: Bearer {token_empleado}
{ "nombre": "Admin", "descripcion": "test" }
→ 403: "Acceso denegado. Se requiere: Admin"
```

### Escenario 3: ABAC - Gerente Lima modifica producto de Lima ✅
```http
PUT /productos/1
Authorization: Bearer {token_gerente_lima}
{ "precio": 2800 }
→ 200: producto actualizado
```

### Escenario 4: ABAC - Empleado intenta eliminar producto ❌
```http
DELETE /productos/2
Authorization: Bearer {token_empleado}
→ 403: "Empleado no tiene permiso para DELETE"
```

---

## 🗂️ Estructura del Proyecto

```
src/
├── app.js                      ← Entrada principal
├── config/
│   └── database.js             ← Conexión PostgreSQL
├── models/
│   ├── index.js                ← Relaciones Sequelize
│   ├── Rol.js
│   ├── Usuario.js
│   ├── UsuarioRol.js
│   ├── Producto.js
│   └── AuditLog.js
├── middlewares/
│   ├── auth.middleware.js      ← Verificación JWT
│   ├── rbac.middleware.js      ← Control por roles
│   └── abac.middleware.js      ← Control por atributos
├── controllers/
│   ├── auth.controller.js
│   ├── roles.controller.js
│   ├── usuarios.controller.js
│   └── productos.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── roles.routes.js
│   ├── usuarios.routes.js
│   └── productos.routes.js
└── utils/
    ├── mfa.utils.js            ← TOTP con otplib
    ├── policy-engine.js        ← Motor ABAC
    └── seed.js                 ← Datos de prueba
```

---

## 🔒 Seguridad Implementada

- ✅ Hash de contraseñas con bcrypt (salt rounds: 12)
- ✅ JWT con expiración configurable
- ✅ MFA TOTP con Google Authenticator (otplib)
- ✅ Bloqueo de cuenta tras 5 intentos fallidos (15 min)
- ✅ Rate limiting en endpoints de login
- ✅ RBAC con middleware por rol
- ✅ ABAC con motor de políticas por atributos
- ✅ Audit log de todas las acciones ABAC
- ✅ Validación de contraseña segura (mayúscula + número + especial)
