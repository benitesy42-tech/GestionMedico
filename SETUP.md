# Guía de Instalación — SGCM (Sistema de Gestión de Consultas Médicas)

## Requisitos

- **Node.js** ≥ 20
- **PostgreSQL** 15, 16, 17 o 18
- **Git**

## Paso 1: Clonar el repositorio

```bash
git clone https://github.com/benitesy42-tech/GestionMedico.git
cd GestionMedico
```

## Paso 2: Configurar PostgreSQL

Abre **pgAdmin** o la terminal de PostgreSQL y crea la base de datos:

```sql
CREATE DATABASE sgcm;
```

Luego ejecuta los scripts SQL en orden:

```
C:\Program Files\PostgreSQL\18\bin\psql -U postgres -d sgcm -f backend\sql\schema.sql
C:\Program Files\PostgreSQL\18\bin\psql -U postgres -d sgcm -f backend\sql\seed.sql
```

> Ajusta la ruta de `psql` según tu versión de PostgreSQL (cambia `18` por tu versión).

## Paso 3: Configurar el Backend

Crea el archivo `backend\.env` (copiando el ejemplo):

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sgcm
DB_USER=postgres
DB_PASSWORD=TU_CONTRASEÑA
JWT_SECRET=sgcm_jwt_secret_key_2026
```

Reemplaza `TU_CONTRASEÑA` con la contraseña de tu usuario `postgres` de PostgreSQL.

## Paso 4: Instalar dependencias

```bash
cd backend
npm install
cd ..
npm install
```

## Paso 5: Iniciar el proyecto

Abre **dos terminales**:

**Terminal 1 — Backend (puerto 3000):**
```bash
cd backend
node src/index.js
```

**Terminal 2 — Frontend (puerto 4200):**
```bash
npm start
```

## Paso 6: Usar el sistema

Abre `http://localhost:4200` en el navegador.

### Credenciales de prueba

| Rol            | Usuario              | Contraseña     |
|----------------|----------------------|----------------|
| Administrador  | admin@sgcm.com       | admin123       |
| Recepcionista  | recepcion@sgcm.com   | recepcion123   |
| Médico         | dr.paredes@sgcm.com  | medico123      |
| Médico         | dra.lopez@sgcm.com   | medico123      |
| Paciente       | 1100123456           | paciente123    |
| Paciente       | 1100789012           | paciente123    |

## Solución de problemas

### "ECONNREFUSED" al iniciar sesión
→ El backend no está corriendo. Asegúrate de tener la Terminal 1 abierta con `node src/index.js`.

### "Error: connect ECONNREFUSED ::1:5432"
→ PostgreSQL no está corriendo. Abre pgAdmin o inicia el servicio de PostgreSQL.

### "password authentication failed"
→ La contraseña en `backend\.env` no coincide con la de PostgreSQL. Verifica `DB_PASSWORD`.

## Estructura del proyecto

```
GestionMedico/
├── api/                    # (solo para Vercel, ignorar en local)
├── backend/
│   ├── src/
│   │   ├── routes/         # Rutas de la API (auth, pacientes, etc.)
│   │   ├── app.js          # Configuración de Express
│   │   ├── db.js           # Conexión a PostgreSQL
│   │   └── index.js        # Punto de entrada del backend
│   ├── sql/
│   │   ├── schema.sql      # Creación de tablas
│   │   └── seed.sql        # Datos de prueba
│   └── .env                # Configuración local
├── src/                    # Código del frontend (Angular)
├── package.json
└── README.md
```
