# Consultas SQL del Sistema

## auth.js

```sql
-- Login - verifica credenciales
SELECT u.*, r.Nombre_Rol FROM Usuario u
JOIN Rol r ON u.ID_Rol = r.ID_Rol
WHERE u.Username_Correo = $1 AND u.Estado_Activo = true

-- Login - obtener nombre del médico
SELECT ID_Medico, Nombres, Apellidos FROM Medico WHERE ID_Usuario = $1

-- Login - obtener nombre del paciente
SELECT Nombres, Apellidos FROM Paciente WHERE ID_Usuario = $1
```

## citas.js

```sql
-- GET /citas - listar todas
SELECT c.ID_Cita, c.ID_Paciente, c.ID_Medico, c.Fecha_Hora, c.Estado,
  p.Nombres || ' ' || p.Apellidos AS "Paciente_Nombre",
  m.Nombres || ' ' || m.Apellidos AS "Medico_Nombre",
  e.Nombre_Especialidad AS "Especialidad"
FROM Cita c
JOIN Paciente p ON c.ID_Paciente = p.ID_Paciente
JOIN Medico m ON c.ID_Medico = m.ID_Medico
JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
ORDER BY c.Fecha_Hora DESC

-- GET /citas/fecha/:fecha - citas por fecha
SELECT c.ID_Cita, c.ID_Paciente, c.ID_Medico, c.Fecha_Hora, c.Estado,
  p.Nombres || ' ' || p.Apellidos AS "Paciente_Nombre",
  m.Nombres || ' ' || m.Apellidos AS "Medico_Nombre",
  e.Nombre_Especialidad AS "Especialidad",
  cm.ID_Consulta
FROM Cita c
JOIN Paciente p ON c.ID_Paciente = p.ID_Paciente
JOIN Medico m ON c.ID_Medico = m.ID_Medico
JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
LEFT JOIN Consulta_Medica cm ON c.ID_Cita = cm.ID_Cita
WHERE DATE(c.Fecha_Hora) = $1
ORDER BY c.Fecha_Hora

-- GET /citas/hoy - citas de hoy
SELECT c.ID_Cita, c.ID_Paciente, c.ID_Medico, c.Fecha_Hora, c.Estado,
  p.Nombres || ' ' || p.Apellidos AS "Paciente_Nombre",
  m.Nombres || ' ' || m.Apellidos AS "Medico_Nombre",
  e.Nombre_Especialidad AS "Especialidad"
FROM Cita c
JOIN Paciente p ON c.ID_Paciente = p.ID_Paciente
JOIN Medico m ON c.ID_Medico = m.ID_Medico
JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
WHERE DATE(c.Fecha_Hora) = CURRENT_DATE
ORDER BY c.Fecha_Hora

-- GET /citas/medico/:idMedico - citas de un médico
SELECT c.*, p.Nombres || ' ' || p.Apellidos AS "Paciente_Nombre",
  e.Nombre_Especialidad AS "Especialidad"
FROM Cita c
JOIN Paciente p ON c.ID_Paciente = p.ID_Paciente
JOIN Medico m ON c.ID_Medico = m.ID_Medico
JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
WHERE c.ID_Medico = $1
ORDER BY c.Fecha_Hora DESC

-- GET /citas/paciente/:idPaciente - citas de un paciente
SELECT c.*, m.Nombres || ' ' || m.Apellidos AS "Medico_Nombre",
  e.Nombre_Especialidad AS "Especialidad"
FROM Cita c
JOIN Medico m ON c.ID_Medico = m.ID_Medico
JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
WHERE c.ID_Paciente = $1
ORDER BY c.Fecha_Hora DESC

-- POST /citas - verificar conflicto de horario (ventana 30 min)
SELECT * FROM Cita
WHERE ID_Medico = $1
  AND Fecha_Hora >= $2
  AND Fecha_Hora < ($2::timestamp + INTERVAL '30 minutes')
  AND Estado NOT IN ('Cancelada')

-- POST /citas - calcular siguiente slot
SELECT to_char(($1::timestamp + INTERVAL '30 minutes')::timestamp, 'YYYY-MM-DD"T"HH24:MI') as nueva

-- POST /citas - crear cita
INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES ($1, $2, $3, 'Pendiente') RETURNING *

-- PUT /citas/:id - actualizar estado
UPDATE Cita SET Estado = $1 WHERE ID_Cita = $2 RETURNING *

-- DELETE /citas/:id - cancelar cita
UPDATE Cita SET Estado = 'Cancelada' WHERE ID_Cita = $1 RETURNING *
```

## consultas.js

```sql
-- GET /consultas/paciente/:idPaciente - historial clínico completo
SELECT cm.*, c.Fecha_Hora,
  m.Nombres || ' ' || m.Apellidos AS Medico_Nombre,
  e.Nombre_Especialidad AS Especialidad,
  p.Nombres || ' ' || p.Apellidos AS Paciente_Nombre,
  p.DNI AS Paciente_DNI,
  (SELECT json_agg(json_build_object(
    'ID_Signo', sv.ID_Signo,
    'Presion_Arterial', sv.Presion_Arterial,
    'Frecuencia_Cardiaca', sv.Frecuencia_Cardiaca,
    'Temperatura', sv.Temperatura,
    'Peso', sv.Peso,
    'Estatura', sv.Estatura,
    'Frecuencia_Respiratoria', sv.Frecuencia_Respiratoria,
    'Saturacion_Oxigeno', sv.Saturacion_Oxigeno
  )) FROM Signos_Vitales sv WHERE sv.ID_Consulta = cm.ID_Consulta
  ) AS Signos_Vitales,
  (SELECT json_agg(json_build_object(
    'ID_Receta', rm.ID_Receta,
    'Medicamento', rm.Medicamento,
    'Dosis', rm.Dosis,
    'Frecuencia', rm.Frecuencia,
    'Duracion', rm.Duracion
  )) FROM Receta_Medicamento rm WHERE rm.ID_Consulta = cm.ID_Consulta
  ) AS Recetas
FROM Consulta_Medica cm
JOIN Cita c ON cm.ID_Cita = c.ID_Cita
JOIN Medico m ON c.ID_Medico = m.ID_Medico
JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
JOIN Paciente p ON c.ID_Paciente = p.ID_Paciente
${whereClause}
ORDER BY cm.Fecha_Registro DESC

-- POST /consultas - crear consulta
INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas, Tratamiento, Observaciones)
VALUES ($1, $2, $3, $4, $5, $6) RETURNING *

-- POST /consultas - insertar signos vitales
INSERT INTO Signos_Vitales (ID_Consulta, Presion_Arterial, Frecuencia_Cardiaca, Temperatura,
  Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)

-- POST /consultas - insertar receta
INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion)
VALUES ($1, $2, $3, $4, $5)

-- POST /consultas - obtener consulta creada con signos y recetas
SELECT cm.*, c.Fecha_Hora,
  m.Nombres || ' ' || m.Apellidos AS Medico_Nombre,
  e.Nombre_Especialidad AS Especialidad,
  p.Nombres || ' ' || p.Apellidos AS Paciente_Nombre,
  (SELECT json_agg(json_build_object(
    'ID_Signo', sv.ID_Signo,
    'Presion_Arterial', sv.Presion_Arterial,
    'Frecuencia_Cardiaca', sv.Frecuencia_Cardiaca,
    'Temperatura', sv.Temperatura,
    'Peso', sv.Peso,
    'Estatura', sv.Estatura,
    'Frecuencia_Respiratoria', sv.Frecuencia_Respiratoria,
    'Saturacion_Oxigeno', sv.Saturacion_Oxigeno
  )) FROM Signos_Vitales sv WHERE sv.ID_Consulta = cm.ID_Consulta
  ) AS Signos_Vitales,
  (SELECT json_agg(json_build_object(
    'ID_Receta', rm.ID_Receta,
    'Medicamento', rm.Medicamento,
    'Dosis', rm.Dosis,
    'Frecuencia', rm.Frecuencia,
    'Duracion', rm.Duracion
  )) FROM Receta_Medicamento rm WHERE rm.ID_Consulta = cm.ID_Consulta
  ) AS Recetas
FROM Consulta_Medica cm
JOIN Cita c ON cm.ID_Cita = c.ID_Cita
JOIN Medico m ON c.ID_Medico = m.ID_Medico
JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
JOIN Paciente p ON c.ID_Paciente = p.ID_Paciente
WHERE cm.ID_Consulta = $1
```

## dashboard.js

```sql
-- Conteo de médicos
SELECT COUNT(*) FROM Medico

-- Conteo de pacientes
SELECT COUNT(*) FROM Paciente

-- Conteo de especialidades
SELECT COUNT(*) FROM Especialidad

-- Citas del día (con fecha variable)
SELECT COUNT(*) FROM Cita WHERE DATE(Fecha_Hora) = $1
SELECT COUNT(*) FROM Cita WHERE DATE(Fecha_Hora) = CURRENT_DATE

-- Citas pendientes
SELECT COUNT(*) FROM Cita WHERE DATE(Fecha_Hora) = $1 AND Estado = 'Pendiente'
SELECT COUNT(*) FROM Cita WHERE DATE(Fecha_Hora) = CURRENT_DATE AND Estado = 'Pendiente'

-- Citas atendidas
SELECT COUNT(*) FROM Cita WHERE DATE(Fecha_Hora) = $1 AND Estado = 'Atendida'
SELECT COUNT(*) FROM Cita WHERE DATE(Fecha_Hora) = CURRENT_DATE AND Estado = 'Atendida'

-- Ingresos del día
SELECT COALESCE(SUM(p.Monto), 0) as total
FROM Pago p
JOIN Consulta_Medica cm ON p.ID_Consulta = cm.ID_Consulta
WHERE DATE(p.Fecha_Pago) = $1 AND p.Estado_Pago = 'Completado'

SELECT COALESCE(SUM(p.Monto), 0) as total
FROM Pago p
JOIN Consulta_Medica cm ON p.ID_Consulta = cm.ID_Consulta
WHERE DATE(p.Fecha_Pago) = CURRENT_DATE AND p.Estado_Pago = 'Completado'
```

## especialidades.js

```sql
-- GET /especialidades - listar
SELECT * FROM Especialidad ORDER BY Nombre_Especialidad

-- POST /especialidades - crear
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ($1) RETURNING *

-- PUT /especialidades/:id - actualizar
UPDATE Especialidad SET Nombre_Especialidad = $1 WHERE ID_Especialidad = $2 RETURNING *

-- DELETE /especialidades/:id - eliminar
DELETE FROM Especialidad WHERE ID_Especialidad = $1 RETURNING *
```

## medicos.js

```sql
-- GET /medicos - listar
SELECT m.ID_Medico, m.ID_Usuario, m.ID_Especialidad, m.Nombres, m.Apellidos,
  m.Numero_Colegiatura, e.Nombre_Especialidad
FROM Medico m
JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
ORDER BY m.Apellidos

-- GET /medicos/:id - obtener uno
SELECT m.*, e.Nombre_Especialidad
FROM Medico m
JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
WHERE m.ID_Medico = $1

-- POST /medicos - buscar usuario inactivo existente
SELECT ID_Usuario FROM Usuario WHERE Username_Correo = $1 AND Estado_Activo = false

-- POST /medicos - reactivar usuario
UPDATE Usuario SET Password_Hash = $1, Estado_Activo = true WHERE ID_Usuario = $2

-- POST /medicos - crear usuario nuevo
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES ((SELECT ID_Rol FROM Rol WHERE Nombre_Rol = 'Médico'), $1, $2, true)
RETURNING ID_Usuario

-- POST /medicos - crear médico
INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura)
VALUES ($1, $2, $3, $4, $5) RETURNING *

-- PUT /medicos/:id - actualizar
UPDATE Medico
SET ID_Especialidad = $1, Nombres = $2, Apellidos = $3, Numero_Colegiatura = $4
WHERE ID_Medico = $5 RETURNING *

-- DELETE /medicos/:id - obtener usuario asociado
SELECT ID_Usuario FROM Medico WHERE ID_Medico = $1

-- DELETE /medicos/:id - eliminar médico
DELETE FROM Medico WHERE ID_Medico = $1

-- DELETE /medicos/:id - desactivar usuario
UPDATE Usuario SET Estado_Activo = false WHERE ID_Usuario = $1
```

## pacientes.js

```sql
-- GET /pacientes - listar
SELECT * FROM Paciente ORDER BY Apellidos

-- GET /pacientes/buscar/:term - buscar
SELECT * FROM Paciente
WHERE DNI ILIKE $1 OR Nombres ILIKE $1 OR Apellidos ILIKE $1 OR ID_Paciente::text ILIKE $1
ORDER BY Apellidos LIMIT 20

-- GET /pacientes/:id - obtener uno
SELECT * FROM Paciente WHERE ID_Paciente = $1

-- POST /pacientes - crear usuario
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES ((SELECT ID_Rol FROM Rol WHERE Nombre_Rol = 'Paciente'), $1, $2, true)
RETURNING ID_Usuario

-- POST /pacientes - crear paciente
INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
VALUES ($1, $2, $3, $4, $5, $6) RETURNING *

-- PUT /pacientes/:id - actualizar
UPDATE Paciente
SET DNI = $1, Nombres = $2, Apellidos = $3, Telefono = $4, Fecha_Nacimiento = $5
WHERE ID_Paciente = $6 RETURNING *

-- DELETE /pacientes/:id - obtener usuario asociado
SELECT ID_Usuario FROM Paciente WHERE ID_Paciente = $1

-- DELETE /pacientes/:id - eliminar paciente
DELETE FROM Paciente WHERE ID_Paciente = $1

-- DELETE /pacientes/:id - desactivar usuario
UPDATE Usuario SET Estado_Activo = false WHERE ID_Usuario = $1
```

## pagos.js

```sql
-- GET /pagos - listar
SELECT p.*, cm.ID_Cita
FROM Pago p
JOIN Consulta_Medica cm ON p.ID_Consulta = cm.ID_Consulta
ORDER BY p.Fecha_Pago DESC

-- GET /pagos/reporte - reporte por rango de fechas
SELECT p.*, cm.ID_Cita
FROM Pago p
JOIN Consulta_Medica cm ON p.ID_Consulta = cm.ID_Consulta
WHERE DATE(p.Fecha_Pago) >= $1 AND DATE(p.Fecha_Pago) <= $2
ORDER BY p.Fecha_Pago DESC

-- POST /pagos - registrar pago
INSERT INTO Pago (ID_Consulta, Monto, Estado_Pago)
VALUES ($1, $2, 'Completado') RETURNING *

-- PUT /pagos/:id - actualizar estado
UPDATE Pago SET Estado_Pago = $1 WHERE ID_Pago = $2 RETURNING *
```
