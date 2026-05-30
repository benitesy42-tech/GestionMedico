-- ==========================================
-- SGCM - SETUP COMPLETO PARA SUPABASE
-- Crea tablas + inserta datos de prueba
-- Idempotente: se puede ejecutar mil veces
-- ==========================================

-- ========== TABLAS (solo si no existen) ==========
CREATE TABLE IF NOT EXISTS Rol (
    ID_Rol SERIAL PRIMARY KEY,
    Nombre_Rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Usuario (
    ID_Usuario SERIAL PRIMARY KEY,
    ID_Rol INT NOT NULL,
    Username_Correo VARCHAR(100) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Estado_Activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (ID_Rol) REFERENCES Rol(ID_Rol) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Especialidad (
    ID_Especialidad SERIAL PRIMARY KEY,
    Nombre_Especialidad VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS Medico (
    ID_Medico SERIAL PRIMARY KEY,
    ID_Usuario INT NOT NULL UNIQUE,
    ID_Especialidad INT NOT NULL,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Numero_Colegiatura VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuario(ID_Usuario) ON DELETE CASCADE,
    FOREIGN KEY (ID_Especialidad) REFERENCES Especialidad(ID_Especialidad) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS Paciente (
    ID_Paciente SERIAL PRIMARY KEY,
    ID_Usuario INT NOT NULL UNIQUE,
    DNI VARCHAR(15) UNIQUE NOT NULL,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20),
    Fecha_Nacimiento DATE NOT NULL,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuario(ID_Usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Horario_Medico (
    ID_Horario SERIAL PRIMARY KEY,
    ID_Medico INT NOT NULL,
    Dia_Semana VARCHAR(15) NOT NULL,
    Hora_Inicio TIME NOT NULL,
    Hora_Fin TIME NOT NULL,
    FOREIGN KEY (ID_Medico) REFERENCES Medico(ID_Medico) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Cita (
    ID_Cita SERIAL PRIMARY KEY,
    ID_Paciente INT NOT NULL,
    ID_Medico INT NOT NULL,
    Fecha_Hora TIMESTAMP NOT NULL,
    Estado VARCHAR(20) DEFAULT 'Pendiente'
        CHECK (Estado IN ('Pendiente', 'En Espera', 'Cancelada', 'Reprogramada', 'Atendida')),
    FOREIGN KEY (ID_Paciente) REFERENCES Paciente(ID_Paciente) ON DELETE CASCADE,
    FOREIGN KEY (ID_Medico) REFERENCES Medico(ID_Medico) ON DELETE CASCADE,
    UNIQUE (ID_Medico, Fecha_Hora)
);

CREATE TABLE IF NOT EXISTS Consulta_Medica (
    ID_Consulta SERIAL PRIMARY KEY,
    ID_Cita INT NOT NULL UNIQUE,
    Motivo TEXT NOT NULL,
    Sintomas TEXT,
    Diagnostico_Notas TEXT NOT NULL,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Cita) REFERENCES Cita(ID_Cita) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Pago (
    ID_Pago SERIAL PRIMARY KEY,
    ID_Consulta INT NOT NULL UNIQUE,
    Monto NUMERIC(10, 2) NOT NULL CHECK (Monto >= 0),
    Fecha_Pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Estado_Pago VARCHAR(20) DEFAULT 'Completado'
        CHECK (Estado_Pago IN ('Pendiente', 'Completado', 'Anulado')),
    FOREIGN KEY (ID_Consulta) REFERENCES Consulta_Medica(ID_Consulta) ON DELETE RESTRICT
);

-- ========== DATOS DE PRUEBA ==========

-- Limpiar datos existentes
DELETE FROM Pago;
DELETE FROM Consulta_Medica;
DELETE FROM Cita;
DELETE FROM Horario_Medico;
DELETE FROM Medico;
DELETE FROM Paciente;
DELETE FROM Usuario;
DELETE FROM Especialidad;
DELETE FROM Rol;

-- Resetear secuencias
ALTER SEQUENCE IF EXISTS rol_id_rol_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS especialidad_id_especialidad_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS usuario_id_usuario_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS medico_id_medico_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS paciente_id_paciente_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS horario_medico_id_horario_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS cita_id_cita_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS consulta_medica_id_consulta_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS pago_id_pago_seq RESTART WITH 1;

-- 1. Roles
INSERT INTO Rol (Nombre_Rol) VALUES ('Administrador') ON CONFLICT DO NOTHING;
INSERT INTO Rol (Nombre_Rol) VALUES ('Recepcionista') ON CONFLICT DO NOTHING;
INSERT INTO Rol (Nombre_Rol) VALUES ('Medico') ON CONFLICT DO NOTHING;
INSERT INTO Rol (Nombre_Rol) VALUES ('Paciente') ON CONFLICT DO NOTHING;

-- 2. Especialidades
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Medicina General') ON CONFLICT DO NOTHING;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Cardiología') ON CONFLICT DO NOTHING;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Pediatría') ON CONFLICT DO NOTHING;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Ginecología') ON CONFLICT DO NOTHING;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Dermatología') ON CONFLICT DO NOTHING;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Traumatología') ON CONFLICT DO NOTHING;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Oftalmología') ON CONFLICT DO NOTHING;
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Neurología') ON CONFLICT DO NOTHING;

-- 3. Usuarios
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo) VALUES
(1, 'admin@sgcm.com', '$2b$10$DW25pjba54e6kg/A67yOAu2jJT9t6H04V0vfM4uI21WVZkDiikEwK', true),
(2, 'recepcion@sgcm.com', '$2b$10$ShjxAE4rXy42AJvJ.zdd4uMvfzGBAeFOnNNZVjaNu/LF.WkZ2Yjgi', true),
(3, 'dr.paredes@sgcm.com', '$2b$10$ZhpJxcUekfpQBbmZmpt3zOwEjOnsngYXWBW9SOw6U8AQh9YOhEO6K', true),
(3, 'dra.lopez@sgcm.com', '$2b$10$FG2IBuDZjmOmR2RhweG19O7jO5467piPQur1bbpIlmJr.FOx.0Mze', true),
(4, '1100123456', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true),
(4, '1100789012', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true)
ON CONFLICT (username_correo) DO UPDATE SET password_hash = EXCLUDED.password_hash, estado_activo = true;
-- Los pacientes usan su DNI como username y password "paciente123"

-- 4. Médicos
INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura) VALUES
(3, 1, 'Carlos', 'Paredes Molina', 'COL-12345'),
(4, 2, 'María', 'López García', 'COL-12346')
ON CONFLICT (id_usuario) DO NOTHING;

-- 5. Pacientes (relación 1 a 1 con Usuario)
INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento) VALUES
(5, '1100123456', 'Juan', 'Pérez Ramírez', '0999123456', '1990-05-15'),
(6, '1100789012', 'Ana', 'Jiménez Torres', '0999789012', '1985-08-22')
ON CONFLICT (id_usuario) DO NOTHING;

-- 6. Horarios
INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin) VALUES
(1, 'Lunes', '08:00', '12:00'),
(1, 'Lunes', '14:00', '17:00'),
(1, 'Miércoles', '08:00', '12:00'),
(1, 'Viernes', '08:00', '12:00'),
(2, 'Martes', '08:00', '12:00'),
(2, 'Jueves', '08:00', '12:00'),
(2, 'Viernes', '14:00', '18:00');

-- 7. Citas de ejemplo
INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES
(1, 1, NOW() + INTERVAL '1 hour', 'Pendiente'),
(2, 2, NOW() + INTERVAL '2 hours', 'Pendiente'),
(1, 1, NOW() + INTERVAL '1 day', 'Pendiente');
