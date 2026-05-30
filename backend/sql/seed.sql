-- ==========================================
-- SCRIPT DE INICIALIZACIÓN - SGCM
-- Ejecutar después de crear las tablas
-- ==========================================

-- 1. Roles
INSERT INTO Rol (Nombre_Rol) VALUES ('Administrador');
INSERT INTO Rol (Nombre_Rol) VALUES ('Recepcionista');
INSERT INTO Rol (Nombre_Rol) VALUES ('Médico');
INSERT INTO Rol (Nombre_Rol) VALUES ('Paciente');

-- 2. Especialidades médicas
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Medicina General');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Cardiología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Pediatría');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Ginecología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Dermatología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Traumatología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Oftalmología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Neurología');

-- 3. Usuarios con contraseñas (bcrypt hash de "123456")
-- Hash generado para '123456': $2a$10$... (se puede generar con bcrypt)
-- NOTA: Reemplazar los hash con los generados al ejecutar la app
-- O usar el endpoint de registro desde la app

-- Usuario Administrador
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (1, 'admin@sgcm.com', '$2b$10$DW25pjba54e6kg/A67yOAu2jJT9t6H04V0vfM4uI21WVZkDiikEwK', true);
-- Password: admin123

-- Usuario Recepcionista
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (2, 'recepcion@sgcm.com', '$2b$10$ShjxAE4rXy42AJvJ.zdd4uMvfzGBAeFOnNNZVjaNu/LF.WkZ2Yjgi', true);
-- Password: recepcion123

-- Usuario Médico 1
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (3, 'dr.paredes@sgcm.com', '$2b$10$ZhpJxcUekfpQBbmZmpt3zOwEjOnsngYXWBW9SOw6U8AQh9YOhEO6K', true);
-- Password: medico123

-- Usuario Médico 2
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (3, 'dra.lopez@sgcm.com', '$2b$10$FG2IBuDZjmOmR2RhweG19O7jO5467piPQur1bbpIlmJr.FOx.0Mze', true);
-- Password: medico123

-- Usuario Paciente 1
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (4, '1100123456', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);
-- Password: paciente123

-- Usuario Paciente 2
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (4, '1100789012', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);
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
VALUES (6, '1100789012', 'Ana', 'Jiménez Torres', '0999789012', '1985-08-22');

-- 6. Horarios Médicos (disponibilidad de ejemplo)
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

-- 7. Citas de ejemplo (para hoy)
INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES (1, 1, NOW() + INTERVAL '1 hour', 'Pendiente');

INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES (2, 2, NOW() + INTERVAL '2 hours', 'Pendiente');

INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES (1, 1, NOW() + INTERVAL '1 day', 'Pendiente');
