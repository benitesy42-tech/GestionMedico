-- ==========================================
-- SGCM - SETUP COMPLETO PARA SUPABASE
-- Idempotente 100% — solo UPSERTS
-- ==========================================

-- Tablas
CREATE TABLE IF NOT EXISTS Rol (
    ID_Rol SERIAL PRIMARY KEY, Nombre_Rol VARCHAR(50) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS Usuario (
    ID_Usuario SERIAL PRIMARY KEY, ID_Rol INT NOT NULL,
    Username_Correo VARCHAR(100) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL, Estado_Activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (ID_Rol) REFERENCES Rol(ID_Rol) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS Especialidad (
    ID_Especialidad SERIAL PRIMARY KEY, Nombre_Especialidad VARCHAR(100) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS Medico (
    ID_Medico SERIAL PRIMARY KEY, ID_Usuario INT NOT NULL UNIQUE,
    ID_Especialidad INT NOT NULL, Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL, Numero_Colegiatura VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuario(ID_Usuario) ON DELETE CASCADE,
    FOREIGN KEY (ID_Especialidad) REFERENCES Especialidad(ID_Especialidad) ON DELETE RESTRICT
);
CREATE TABLE IF NOT EXISTS Paciente (
    ID_Paciente SERIAL PRIMARY KEY, ID_Usuario INT NOT NULL UNIQUE,
    DNI VARCHAR(15) UNIQUE NOT NULL, Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL, Telefono VARCHAR(20),
    Fecha_Nacimiento DATE NOT NULL,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuario(ID_Usuario) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS Horario_Medico (
    ID_Horario SERIAL PRIMARY KEY, ID_Medico INT NOT NULL,
    Dia_Semana VARCHAR(15) NOT NULL, Hora_Inicio TIME NOT NULL,
    Hora_Fin TIME NOT NULL,
    FOREIGN KEY (ID_Medico) REFERENCES Medico(ID_Medico) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS Cita (
    ID_Cita SERIAL PRIMARY KEY, ID_Paciente INT NOT NULL,
    ID_Medico INT NOT NULL, Fecha_Hora TIMESTAMP NOT NULL,
    Estado VARCHAR(20) DEFAULT 'Pendiente'
        CHECK (Estado IN ('Pendiente','En Espera','Cancelada','Reprogramada','Atendida')),
    FOREIGN KEY (ID_Paciente) REFERENCES Paciente(ID_Paciente) ON DELETE CASCADE,
    FOREIGN KEY (ID_Medico) REFERENCES Medico(ID_Medico) ON DELETE CASCADE,
    UNIQUE (ID_Medico, Fecha_Hora)
);
CREATE TABLE IF NOT EXISTS Consulta_Medica (
    ID_Consulta SERIAL PRIMARY KEY, ID_Cita INT NOT NULL UNIQUE,
    Motivo TEXT NOT NULL, Sintomas TEXT, Diagnostico_Notas TEXT NOT NULL,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Cita) REFERENCES Cita(ID_Cita) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS Pago (
    ID_Pago SERIAL PRIMARY KEY, ID_Consulta INT NOT NULL UNIQUE,
    Monto NUMERIC(10,2) NOT NULL CHECK (Monto >= 0),
    Fecha_Pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Estado_Pago VARCHAR(20) DEFAULT 'Completado'
        CHECK (Estado_Pago IN ('Pendiente','Completado','Anulado')),
    FOREIGN KEY (ID_Consulta) REFERENCES Consulta_Medica(ID_Consulta) ON DELETE RESTRICT
);

-- UPSERTS: Roles
INSERT INTO Rol (Nombre_Rol) VALUES ('Administrador') ON CONFLICT (nombre_rol) DO UPDATE SET nombre_rol = EXCLUDED.nombre_rol;
INSERT INTO Rol (Nombre_Rol) VALUES ('Recepcionista') ON CONFLICT (nombre_rol) DO UPDATE SET nombre_rol = EXCLUDED.nombre_rol;
INSERT INTO Rol (Nombre_Rol) VALUES ('Medico') ON CONFLICT (nombre_rol) DO UPDATE SET nombre_rol = EXCLUDED.nombre_rol;
INSERT INTO Rol (Nombre_Rol) VALUES ('Paciente') ON CONFLICT (nombre_rol) DO UPDATE SET nombre_rol = EXCLUDED.nombre_rol;

-- UPSERTS: Especialidades
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Medicina General') ON CONFLICT (nombre_especialidad) DO UPDATE SET nombre_especialidad = EXCLUDED.nombre_especialidad;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Cardiología') ON CONFLICT (nombre_especialidad) DO UPDATE SET nombre_especialidad = EXCLUDED.nombre_especialidad;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Pediatría') ON CONFLICT (nombre_especialidad) DO UPDATE SET nombre_especialidad = EXCLUDED.nombre_especialidad;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Ginecología') ON CONFLICT (nombre_especialidad) DO UPDATE SET nombre_especialidad = EXCLUDED.nombre_especialidad;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Dermatología') ON CONFLICT (nombre_especialidad) DO UPDATE SET nombre_especialidad = EXCLUDED.nombre_especialidad;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Traumatología') ON CONFLICT (nombre_especialidad) DO UPDATE SET nombre_especialidad = EXCLUDED.nombre_especialidad;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Oftalmología') ON CONFLICT (nombre_especialidad) DO UPDATE SET nombre_especialidad = EXCLUDED.nombre_especialidad;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Neurología') ON CONFLICT (nombre_especialidad) DO UPDATE SET nombre_especialidad = EXCLUDED.nombre_especialidad;

-- UPSERTS: Usuarios (se identifican por username_correo)
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (1, 'admin@sgcm.com', '$2b$10$DW25pjba54e6kg/A67yOAu2jJT9t6H04V0vfM4uI21WVZkDiikEwK', true)
ON CONFLICT (username_correo) DO UPDATE SET password_hash = EXCLUDED.password_hash, estado_activo = true;

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (2, 'recepcion@sgcm.com', '$2b$10$ShjxAE4rXy42AJvJ.zdd4uMvfzGBAeFOnNNZVjaNu/LF.WkZ2Yjgi', true)
ON CONFLICT (username_correo) DO UPDATE SET password_hash = EXCLUDED.password_hash, estado_activo = true;

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (3, 'dr.paredes@sgcm.com', '$2b$10$ZhpJxcUekfpQBbmZmpt3zOwEjOnsngYXWBW9SOw6U8AQh9YOhEO6K', true)
ON CONFLICT (username_correo) DO UPDATE SET password_hash = EXCLUDED.password_hash, estado_activo = true;

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (3, 'dra.lopez@sgcm.com', '$2b$10$FG2IBuDZjmOmR2RhweG19O7jO5467piPQur1bbpIlmJr.FOx.0Mze', true)
ON CONFLICT (username_correo) DO UPDATE SET password_hash = EXCLUDED.password_hash, estado_activo = true;

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (4, '1100123456', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true)
ON CONFLICT (username_correo) DO UPDATE SET password_hash = EXCLUDED.password_hash, estado_activo = true;

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (4, '1100789012', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true)
ON CONFLICT (username_correo) DO UPDATE SET password_hash = EXCLUDED.password_hash, estado_activo = true;

-- UPSERTS: Médicos
INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura)
VALUES (3, 1, 'Carlos', 'Paredes Molina', 'COL-12345')
ON CONFLICT (id_usuario) DO UPDATE SET nombres = EXCLUDED.nombres, apellidos = EXCLUDED.apellidos;

INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura)
VALUES (4, 2, 'María', 'López García', 'COL-12346')
ON CONFLICT (id_usuario) DO UPDATE SET nombres = EXCLUDED.nombres, apellidos = EXCLUDED.apellidos;

-- UPSERTS: Pacientes
INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
VALUES (5, '1100123456', 'Juan', 'Pérez Ramírez', '0999123456', '1990-05-15')
ON CONFLICT (id_usuario) DO UPDATE SET nombres = EXCLUDED.nombres, apellidos = EXCLUDED.apellidos;

INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
VALUES (6, '1100789012', 'Ana', 'Jiménez Torres', '0999789012', '1985-08-22')
ON CONFLICT (id_usuario) DO UPDATE SET nombres = EXCLUDED.nombres, apellidos = EXCLUDED.apellidos;

-- UPSERTS: Horarios (sin PK única natural, usamos ON CONFLICT con la PK)
INSERT INTO Horario_Medico (ID_Horario, ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
SELECT nextval('horario_medico_id_horario_seq'), 1, 'Lunes', '08:00', '12:00'
WHERE NOT EXISTS (SELECT 1 FROM Horario_Medico WHERE ID_Medico = 1 AND Dia_Semana = 'Lunes' AND Hora_Inicio = '08:00');

INSERT INTO Horario_Medico (ID_Horario, ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
SELECT nextval('horario_medico_id_horario_seq'), 1, 'Lunes', '14:00', '17:00'
WHERE NOT EXISTS (SELECT 1 FROM Horario_Medico WHERE ID_Medico = 1 AND Dia_Semana = 'Lunes' AND Hora_Inicio = '14:00');

INSERT INTO Horario_Medico (ID_Horario, ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
SELECT nextval('horario_medico_id_horario_seq'), 1, 'Miércoles', '08:00', '12:00'
WHERE NOT EXISTS (SELECT 1 FROM Horario_Medico WHERE ID_Medico = 1 AND Dia_Semana = 'Miércoles' AND Hora_Inicio = '08:00');

INSERT INTO Horario_Medico (ID_Horario, ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
SELECT nextval('horario_medico_id_horario_seq'), 1, 'Viernes', '08:00', '12:00'
WHERE NOT EXISTS (SELECT 1 FROM Horario_Medico WHERE ID_Medico = 1 AND Dia_Semana = 'Viernes' AND Hora_Inicio = '08:00');

INSERT INTO Horario_Medico (ID_Horario, ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
SELECT nextval('horario_medico_id_horario_seq'), 2, 'Martes', '08:00', '12:00'
WHERE NOT EXISTS (SELECT 1 FROM Horario_Medico WHERE ID_Medico = 2 AND Dia_Semana = 'Martes' AND Hora_Inicio = '08:00');

INSERT INTO Horario_Medico (ID_Horario, ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
SELECT nextval('horario_medico_id_horario_seq'), 2, 'Jueves', '08:00', '12:00'
WHERE NOT EXISTS (SELECT 1 FROM Horario_Medico WHERE ID_Medico = 2 AND Dia_Semana = 'Jueves' AND Hora_Inicio = '08:00');

INSERT INTO Horario_Medico (ID_Horario, ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin)
SELECT nextval('horario_medico_id_horario_seq'), 2, 'Viernes', '14:00', '18:00'
WHERE NOT EXISTS (SELECT 1 FROM Horario_Medico WHERE ID_Medico = 2 AND Dia_Semana = 'Viernes' AND Hora_Inicio = '14:00');

-- UPSERTS: Citas
INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES (1, 1, NOW() + INTERVAL '1 hour', 'Pendiente')
ON CONFLICT (id_medico, fecha_hora) DO NOTHING;

INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES (2, 2, NOW() + INTERVAL '2 hours', 'Pendiente')
ON CONFLICT (id_medico, fecha_hora) DO NOTHING;

INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES (1, 1, NOW() + INTERVAL '1 day', 'Pendiente')
ON CONFLICT (id_medico, fecha_hora) DO NOTHING;
