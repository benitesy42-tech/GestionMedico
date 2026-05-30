-- ==========================================
-- SGCM - DATOS DE PRUEBA PARA SUPABASE
-- Ejecutar en SQL Editor de Supabase
-- ==========================================

-- Limpiar todo con TRUNCATE CASCADE (maneja FKs automáticamente)
TRUNCATE TABLE Cita, Horario_Medico, Medico, Paciente, Usuario,
             Especialidad, Rol CASCADE;

-- Resetear secuencias
ALTER SEQUENCE rol_id_rol_seq RESTART WITH 1;
ALTER SEQUENCE especialidad_id_especialidad_seq RESTART WITH 1;
ALTER SEQUENCE usuario_id_usuario_seq RESTART WITH 1;
ALTER SEQUENCE medico_id_medico_seq RESTART WITH 1;
ALTER SEQUENCE paciente_id_paciente_seq RESTART WITH 1;
ALTER SEQUENCE horario_medico_id_horario_seq RESTART WITH 1;
ALTER SEQUENCE cita_id_cita_seq RESTART WITH 1;

-- 1. Roles
INSERT INTO Rol (Nombre_Rol) VALUES ('Administrador');
INSERT INTO Rol (Nombre_Rol) VALUES ('Recepcionista');
INSERT INTO Rol (Nombre_Rol) VALUES ('Medico');
INSERT INTO Rol (Nombre_Rol) VALUES ('Paciente');

-- 2. Especialidades
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Medicina General');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Cardiología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Pediatría');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Ginecología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Dermatología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Traumatología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Oftalmología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Neurología');

-- 3. Usuarios (cada uno con hash bcrypt único)
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (1, 'admin@sgcm.com', '$2b$10$DW25pjba54e6kg/A67yOAu2jJT9t6H04V0vfM4uI21WVZkDiikEwK', true);
-- Password: admin123

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (2, 'recepcion@sgcm.com', '$2b$10$ShjxAE4rXy42AJvJ.zdd4uMvfzGBAeFOnNNZVjaNu/LF.WkZ2Yjgi', true);
-- Password: recepcion123

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (3, 'dr.paredes@sgcm.com', '$2b$10$ZhpJxcUekfpQBbmZmpt3zOwEjOnsngYXWBW9SOw6U8AQh9YOhEO6K', true);
-- Password: medico123

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (3, 'dra.lopez@sgcm.com', '$2b$10$FG2IBuDZjmOmR2RhweG19O7jO5467piPQur1bbpIlmJr.FOx.0Mze', true);
-- Password: medico123

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (4, '1100123456', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);
-- Password: paciente123

-- 4. Médicos
INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura)
VALUES (3, 1, 'Carlos', 'Paredes Molina', 'COL-12345');

INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura)
VALUES (4, 2, 'María', 'López García', 'COL-12346');

-- 5. Pacientes
INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
VALUES (5, '1100123456', 'Juan', 'Pérez Ramírez', '0999123456', '1990-05-15');

INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
VALUES (5, '1100789012', 'Ana', 'Jiménez Torres', '0999789012', '1985-08-22');

-- 6. Horarios
INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
VALUES (1, 'Lunes', '08:00', '12:00');

INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
VALUES (1, 'Lunes', '14:00', '17:00');

INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
VALUES (1, 'Miércoles', '08:00', '12:00');

INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
VALUES (1, 'Viernes', '08:00', '12:00');

INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
VALUES (2, 'Martes', '08:00', '12:00');

INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
VALUES (2, 'Jueves', '08:00', '12:00');

INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
VALUES (2, 'Viernes', '14:00', '18:00');

-- 7. Citas de ejemplo
INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES (1, 1, NOW() + INTERVAL '1 hour', 'Pendiente');

INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES (2, 2, NOW() + INTERVAL '2 hours', 'Pendiente');

INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES (1, 1, NOW() + INTERVAL '1 day', 'Pendiente');
