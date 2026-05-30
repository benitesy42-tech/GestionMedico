# 🚀 Guía de Migración a Supabase

## Paso 1: Crear Proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta (o usa GitHub)
2. Haz clic en "New project"
3. Llena los datos:
   - **Project name**: sgcm
   - **Database password**: Crea una contraseña fuerte
   - **Region**: Selecciona la más cercana (ej: South America - São Paulo)
4. Espera 1-2 minutos a que se cree el proyecto

## Paso 2: Obtener Credenciales

En tu proyecto Supabase:
1. Ve a **Settings → Database**
2. Copia la **Connection string** (está abajo como "URI")
3. El formato es: `postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres`

## Paso 3: Actualizar `.env` en el Backend

En `backend/.env`, reemplaza con:

```env
PORT=3000
JWT_SECRET=sgcm_jwt_secret_key_2026
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres
```

**Nota:** Solo debes usar `DATABASE_URL` O los parámetros individuales (DB_HOST, etc), no ambos.

## Paso 4: Ejecutar Migraciones SQL

1. En Supabase, ve a **SQL Editor**
2. Haz clic en "+ New query"
3. Abre el archivo `SUPABASE_MIGRATION.sql` (en la raíz del proyecto)
4. Copia TODO el contenido
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en **▶ Run** (botón azul)
7. Espera a que se ejecute (debe decir "Success")

## Paso 5: Reiniciar el Backend

```bash
cd backend
npm run dev
```

El backend debe conectarse automáticamente a Supabase.

## Paso 6: Verificar Conexión

En PowerShell, ejecuta:

```powershell
$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' `
  -Method POST `
  -Body (@{Username_Correo='admin@sgcm.com'; Password='admin123'} | ConvertTo-Json) `
  -ContentType 'application/json'

$headers = @{ Authorization = "Bearer $($login.token)" }

$pacientes = Invoke-RestMethod -Uri 'http://localhost:3000/api/pacientes' `
  -Headers $headers

Write-Host "✅ Conexión OK. Pacientes encontrados:" $pacientes.Count
```

## 📝 Notas Importantes

- **SSL Required**: Supabase fuerza SSL, por eso agregué `ssl: { rejectUnauthorized: false }` en db.js
- **Backups Automáticos**: Supabase hace backups cada 24h automáticamente
- **Contraseñas de Prueba**: Las contraseñas son bcrypt hash de:
  - `admin123` (admin)
  - `recepcion123` (recepcionista)
  - `medico123` (médicos)

## 🔑 Opciones de Acceso a Supabase

Además de PostgreSQL directo, puedes usar:

- **Supabase Auth**: Para autenticación social (Google, GitHub, etc)
- **Supabase Realtime**: Para actualizaciones en tiempo real
- **Supabase Storage**: Para archivos (fotos, documentos)

Pero por ahora con la conexión PostgreSQL es suficiente.

## ⚠️ Troubleshooting

| Error | Solución |
|-------|----------|
| "Connection refused" | Verifica que DATABASE_URL esté correcta en .env |
| "SSL certificate problem" | Es normal, lo maneja el código con `rejectUnauthorized: false` |
| "No database selected" | Asegúrate de que la BD es `postgres` en la URL |
| "Role postgres does not exist" | Usa el usuario `postgres` que viene por defecto en Supabase |

