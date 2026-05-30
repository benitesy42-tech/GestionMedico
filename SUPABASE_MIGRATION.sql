-- ==========================================
-- SGCM - MIGRACIÓN A SUPABASE
-- Ejecutar este script en el SQL Editor de Supabase
-- ==========================================

-- 1. Crear tablas
CREATE TABLE Rol (
    ID_Rol SERIAL PRIMARY KEY,
    Nombre_Rol VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Usuario (
    ID_Usuario SERIAL PRIMARY KEY,
    ID_Rol INT NOT NULL,
    Username_Correo VARCHAR(100) NOT NULL UNIQUE,
    Password_Hash VARCHAR(255) NOT NULL,
    Estado_Activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (ID_Rol) REFERENCES Rol(ID_Rol) ON DELETE RESTRICT
);

CREATE TABLE Especialidad (
    ID_Especialidad SERIAL PRIMARY KEY,
    Nombre_Especialidad VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Medico (
    ID_Medico SERIAL PRIMARY KEY,
    ID_Usuario INT NOT NULL UNIQUE,
    ID_Especialidad INT NOT NULL,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Numero_Colegiatura VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuario(ID_Usuario) ON DELETE CASCADE,
    FOREIGN KEY (ID_Especialidad) REFERENCES Especialidad(ID_Especialidad) ON DELETE RESTRICT
);

CREATE TABLE Paciente (
    ID_Paciente SERIAL PRIMARY KEY,
    ID_Usuario INT NOT NULL UNIQUE,
    DNI VARCHAR(15) UNIQUE NOT NULL,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Telefono VARCHAR(20),
    Fecha_Nacimiento DATE NOT NULL,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuario(ID_Usuario) ON DELETE CASCADE
);

CREATE TABLE Horario_Medico (
    ID_Horario SERIAL PRIMARY KEY,
    ID_Medico INT NOT NULL,
    Dia_Semana VARCHAR(15) NOT NULL,
    Hora_Inicio TIME NOT NULL,
    Hora_Fin TIME NOT NULL,
    FOREIGN KEY (ID_Medico) REFERENCES Medico(ID_Medico) ON DELETE CASCADE
);

CREATE TABLE Cita (
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

CREATE TABLE Consulta_Medica (
    ID_Consulta SERIAL PRIMARY KEY,
    ID_Cita INT NOT NULL UNIQUE,
    Motivo TEXT NOT NULL,
    Sintomas TEXT,
    Diagnostico_Notas TEXT NOT NULL,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Cita) REFERENCES Cita(ID_Cita) ON DELETE CASCADE
);

CREATE TABLE Pago (
    ID_Pago SERIAL PRIMARY KEY,
    ID_Consulta INT NOT NULL UNIQUE,
    Monto NUMERIC(10, 2) NOT NULL CHECK (Monto >= 0),
    Fecha_Pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Estado_Pago VARCHAR(20) DEFAULT 'Completado'
        CHECK (Estado_Pago IN ('Pendiente', 'Completado', 'Anulado')),
    FOREIGN KEY (ID_Consulta) REFERENCES Consulta_Medica(ID_Consulta) ON DELETE RESTRICT
);

-- 2. Insertar roles
INSERT INTO Rol (Nombre_Rol) VALUES ('Administrador');
INSERT INTO Rol (Nombre_Rol) VALUES ('Recepcionista');
INSERT INTO Rol (Nombre_Rol) VALUES ('Médico');
INSERT INTO Rol (Nombre_Rol) VALUES ('Paciente');

-- 3. Insertar especialidades
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Medicina General');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Cardiología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Pediatría');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Ginecología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Dermatología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Traumatología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Oftalmología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Neurología');

-- 4. Usuarios (hash bcrypt de contraseñas de prueba)
-- Administrador: admin123
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (1, 'admin@sgcm.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6bm1FZwOJK3v0pMl0YqPPu', true);

-- Recepcionista: recepcion123
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (2, 'recepcion@sgcm.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6bm1FZwOJK3v0pMl0YqPPu', true);

-- Médico 1: dr.paredes / medico123
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (3, 'dr.paredes@sgcm.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6bm1FZwOJK3v0pMl0YqPPu', true);

-- Médico 2: dra.lopez / medico123
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (3, 'dra.lopez@sgcm.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6bm1FZwOJK3v0pMl0YqPPu', true);

-- Pacientes de prueba
INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (4, '1100123456@paciente.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6bm1FZwOJK3v0pMl0YqPPu', true);

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (4, '1100789012@paciente.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkf9Rn6bm1FZwOJK3v0pMl0YqPPu', true);

-- 5. Médicos
INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura)
VALUES (3, 1, 'Carlos', 'Paredes Molina', 'COL-12345');

INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura)
VALUES (4, 2, 'María', 'López García', 'COL-12346');

-- 6. Pacientes
INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
VALUES (5, '1100123456', 'Juan', 'Pérez Ramírez', '0999123456', '1990-05-15');

INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
VALUES (6, '1100789012', 'Ana', 'Jiménez Torres', '0999789012', '1985-08-22');
