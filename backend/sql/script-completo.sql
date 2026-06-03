DROP TABLE IF EXISTS Pago CASCADE;
DROP TABLE IF EXISTS Receta_Medicamento CASCADE;
DROP TABLE IF EXISTS Signos_Vitales CASCADE;
DROP TABLE IF EXISTS Consulta_Medica CASCADE;
DROP TABLE IF EXISTS Cita CASCADE;
DROP TABLE IF EXISTS Horario_Medico CASCADE;
DROP TABLE IF EXISTS Paciente CASCADE;
DROP TABLE IF EXISTS Medico CASCADE;
DROP TABLE IF EXISTS Especialidad CASCADE;
DROP TABLE IF EXISTS Usuario CASCADE;
DROP TABLE IF EXISTS Rol CASCADE;

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
    Tratamiento TEXT,
    Observaciones TEXT,
    Fecha_Registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ID_Cita) REFERENCES Cita(ID_Cita) ON DELETE CASCADE
);

CREATE TABLE Signos_Vitales (
    ID_Signo SERIAL PRIMARY KEY,
    ID_Consulta INT NOT NULL UNIQUE,
    Presion_Arterial VARCHAR(20),
    Frecuencia_Cardiaca INT,
    Temperatura DECIMAL(4,1),
    Peso DECIMAL(5,1),
    Estatura DECIMAL(4,1),
    Frecuencia_Respiratoria INT,
    Saturacion_Oxigeno INT,
    FOREIGN KEY (ID_Consulta) REFERENCES Consulta_Medica(ID_Consulta) ON DELETE CASCADE
);

CREATE TABLE Receta_Medicamento (
    ID_Receta SERIAL PRIMARY KEY,
    ID_Consulta INT NOT NULL,
    Medicamento VARCHAR(200) NOT NULL,
    Dosis VARCHAR(100) NOT NULL,
    Frecuencia VARCHAR(100) NOT NULL,
    Duracion VARCHAR(100),
    FOREIGN KEY (ID_Consulta) REFERENCES Consulta_Medica(ID_Consulta) ON DELETE CASCADE
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

INSERT INTO Rol (Nombre_Rol) VALUES ('Administrador');
INSERT INTO Rol (Nombre_Rol) VALUES ('Recepcionista');
INSERT INTO Rol (Nombre_Rol) VALUES ('Médico');
INSERT INTO Rol (Nombre_Rol) VALUES ('Paciente');

INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Medicina General');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Cardiología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Pediatría');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Ginecología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Dermatología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Traumatología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Oftalmología');
INSERT INTO Especialidad (Nombre_Especialidad) VALUES ('Neurología');

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (1, 'admin@sgcm.com', '$2b$10$DW25pjba54e6kg/A67yOAu2jJT9t6H04V0vfM4uI21WVZkDiikEwK', true);

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (2, 'recepcion@sgcm.com', '$2b$10$ShjxAE4rXy42AJvJ.zdd4uMvfzGBAeFOnNNZVjaNu/LF.WkZ2Yjgi', true);

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (3, 'dr.paredes@sgcm.com', '$2b$10$ZhpJxcUekfpQBbmZmpt3zOwEjOnsngYXWBW9SOw6U8AQh9YOhEO6K', true);

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (3, 'dra.lopez@sgcm.com', '$2b$10$FG2IBuDZjmOmR2RhweG19O7jO5467piPQur1bbpIlmJr.FOx.0Mze', true);

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (4, '1100123456', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);

INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
VALUES (4, '1100789012', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);

INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura)
VALUES (3, 1, 'Carlos', 'Paredes Molina', 'COL-12345');

INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura)
VALUES (4, 2, 'María', 'López García', 'COL-12346');

INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
VALUES (5, '1100123456', 'Juan', 'Pérez Ramírez', '0999123456', '1990-05-15');

INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
VALUES (6, '1100789012', 'Ana', 'Jiménez Torres', '0999789012', '1985-08-22');

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

INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES (1, 1, NOW() + INTERVAL '1 hour', 'Pendiente');

INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES (2, 2, NOW() + INTERVAL '2 hours', 'Pendiente');

INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
VALUES (1, 1, NOW() + INTERVAL '1 day', 'Pendiente');
