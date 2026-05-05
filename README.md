# TechStore — Lab 08: Seguridad en la Nube

Aplicación web fullstack que demuestra **Autenticación JWT + MFA**, **RBAC** y **ABAC** sobre una tienda de tecnología.

---

## Requisitos previos

| Herramienta | Versión mínima |
|-------------|---------------|
| Docker Desktop | 4.x |
| Docker Compose | incluido en Docker Desktop |

> No necesitas Node.js, npm ni PostgreSQL instalados localmente. Todo corre dentro de Docker.

---

## Levantar el proyecto

### 1. Clonar o descomprimir el proyecto

```bash
# Si es un ZIP, descomprimir y entrar a la carpeta
cd Lab08
```

### 2. Configurar las variables de entorno

```bash
# Copiar la plantilla
cp .env.example .env
```

Abrir el archivo `.env` y completar cada variable:

```env
# Base de datos — puedes dejar estos valores tal cual para pruebas locales
POSTGRES_DB=techstore_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=elige_una_contraseña        # cualquier texto, ej: MiPass123

# JWT — clave secreta para firmar los tokens, ponle algo largo y aleatorio
JWT_SECRET=cambia_esto_por_algo_largo_abc123  # mínimo 32 caracteres
JWT_EXPIRES_IN=8h                             # dejar así

# Email para recibir el código MFA por correo
# Necesitas una cuenta Gmail con "Contraseña de aplicación" habilitada:
#   1. Ir a myaccount.google.com → Seguridad → Verificación en 2 pasos (activar)
#   2. Luego: Seguridad → Contraseñas de aplicación → Generar
#   3. Copiar los 16 caracteres generados en EMAIL_PASS
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_correo@gmail.com                # tu cuenta Gmail
EMAIL_PASS=abcd efgh ijkl mnop               # los 16 caracteres sin espacios
```

> **Importante:** el archivo `.env` **nunca se sube al repositorio** (está en `.gitignore`).  
> Si no tienes cuenta Gmail o no quieres configurar email, igual puedes usar la app —  
> el código MFA de Google Authenticator (TOTP) siempre funciona aunque el email falle.

### 3. Construir y levantar los contenedores

```bash
docker compose up --build
```

La primera vez tarda ~2 minutos mientras descarga las imágenes y compila el frontend.  
Cuando veas `🌱 Seed completado` y `Server running on port 3000`, la app está lista.

### 4. Abrir en el navegador

```
http://localhost:8083
```

---

## Usuarios de prueba

| Email | Contraseña | Rol | Tienda |
|-------|-----------|-----|--------|
| admin@techstore.com | Admin123! | Admin | — |
| gerente@techstore.com | Gerente123! | Gerente | 1 |
| gerente_lima@techstore.com | Gerente123! | Gerente | 1 |
| empleado@techstore.com | Empleado123! | Empleado | 1 |
| auditor@techstore.com | Auditor123! | Auditor | — |

---

## Configurar Google Authenticator (MFA)

El login requiere un código de 6 dígitos de Google Authenticator.

1. Instalar **Google Authenticator** en tu celular (Android / iOS)
2. Obtener el secret MFA del usuario que quieras usar:

```bash
# Con los contenedores corriendo:
docker exec -it techstore-db psql -U postgres -d techstore_db \
  -c "SELECT email, mfa_secret FROM usuarios;"
```

3. En Google Authenticator: **+** → **Ingresar clave de configuración**
4. Pegar el secret del usuario → Guardar
5. Cada 30 segundos se genera un código nuevo de 6 dígitos

> Puedes agregar los 5 usuarios o solo el que vayas a usar en cada escenario.

---

## Escenarios del laboratorio

### Escenario 1 — Autenticación con MFA

1. Ir a `http://localhost:8083/login`
2. Ingresar `empleado@techstore.com` / `Empleado123!`
3. Ingresar el código de 6 dígitos de Google Authenticator
4. **Resultado esperado:** Acceso concedido, redirige al Dashboard

**Prueba de bloqueo:**
- Ingresar 5 veces una contraseña incorrecta
- **Resultado:** Cuenta bloqueada 1 minuto

---

### Escenario 2 — RBAC: Empleado intenta crear un rol

1. Iniciar sesión como `empleado@techstore.com`
2. Hacer clic en **Roles** en la barra de navegación
3. Intentar crear un nuevo rol (llenar el formulario y hacer clic en **Crear rol**)
4. **Resultado esperado:** `Acceso denegado (403) — No tienes permisos de Administrador`

---

### Escenario 3 — ABAC: Gerente modifica precio de producto

1. Iniciar sesión como `gerente_lima@techstore.com`
2. Ir a **Productos**
3. Hacer clic en **Editar** sobre **Laptop HP** (Tienda 1, Premium)
4. Cambiar el **Precio** y hacer clic en **Actualizar**
5. **Resultado esperado:** Producto actualizado correctamente

> El Gerente NO ve el campo "Categoría" (ABAC lo restringe).

---

### Escenario 4 — ABAC: Empleado intenta eliminar producto

1. Iniciar sesión como `empleado@techstore.com`
2. Ir a **Productos**
3. Hacer clic en **Eliminar** sobre cualquier producto
4. Confirmar en el modal
5. **Resultado esperado:** `Empleados no pueden eliminar productos`

---

## Ver logs de auditoría

1. Iniciar sesión como `admin@techstore.com` o `auditor@techstore.com`
2. Hacer clic en **Auditoría** en la barra de navegación
3. Se muestran todas las operaciones con resultado `permitido` / `denegado`

---

## Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Detener todos los contenedores
docker compose down

# Detener y eliminar la base de datos (reset completo)
docker compose down -v

# Reiniciar solo el backend
docker compose restart api

# Desbloquear un usuario manualmente
docker exec -it techstore-db psql -U postgres -d techstore_db \
  -c "UPDATE usuarios SET bloqueado_hasta = NULL, intentos_fallidos = 0;"
```

---

## Estructura del proyecto

```
Lab08/
├── docker-compose.yml        # Orquestación de servicios
├── .env                      # Credenciales (NO subir al repo)
├── .env.example              # Plantilla pública de variables
├── techstore-api/            # Backend Node.js + Express
│   ├── src/
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── middlewares/      # JWT, RBAC, ABAC
│   │   ├── models/           # Sequelize (PostgreSQL)
│   │   ├── routes/           # Endpoints REST
│   │   └── utils/            # seed.js, policy-engine.js, mfa.utils.js
│   └── Dockerfile
└── techstore-frontend/       # Frontend Vue 3 + Pinia
    ├── src/
    │   ├── views/            # Páginas (Login, MFA, Productos, Roles...)
    │   ├── components/       # Navbar, ModalConfirm
    │   ├── stores/           # Pinia (auth.store.js)
    │   ├── router/           # Vue Router con guards de roles
    │   └── services/         # Axios + interceptores JWT
    ├── nginx.conf            # Proxy /api/ → backend
    └── Dockerfile
```

---

## API REST (referencia rápida)

| Método | Endpoint | Roles permitidos |
|--------|----------|-----------------|
| POST | `/auth/login` | Público |
| POST | `/auth/mfa/verify` | Público |
| POST | `/auth/register` | Público |
| GET | `/auth/me` | Autenticado |
| GET | `/productos` | Todos |
| POST | `/productos` | Admin, Gerente, Empleado |
| PUT | `/productos/:id` | Admin, Gerente, Empleado (ABAC) |
| DELETE | `/productos/:id` | Admin, Gerente (ABAC) |
| GET | `/roles` | Todos |
| POST/PUT/DELETE | `/roles` | Admin |
| GET | `/audit-logs` | Admin, Auditor |
