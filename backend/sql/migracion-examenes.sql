-- Migración: Tablas para el módulo de exámenes de laboratorio

DROP TABLE IF EXISTS Log_Acceso_Sensible CASCADE;
DROP TABLE IF EXISTS Valor_Examen CASCADE;
DROP TABLE IF EXISTS Rango_Referencia CASCADE;
DROP TABLE IF EXISTS Examen CASCADE;

CREATE TABLE Examen (
    ID_Examen SERIAL PRIMARY KEY,
    ID_Paciente INT NOT NULL,
    ID_Consulta INT,
    Archivo_Nombre VARCHAR(255) NOT NULL,
    Archivo_Ruta VARCHAR(500) NOT NULL,
    Archivo_Tipo VARCHAR(50) NOT NULL,
    Archivo_Tamanio INT NOT NULL,
    Texto_OCR TEXT,
    Resumen_Medico TEXT,
    Resumen_Paciente TEXT,
    Laboratorio VARCHAR(200),
    Fecha_Toma DATE,
    Fecha_Subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Tipo_Examen VARCHAR(50) NOT NULL,
    Etiquetas TEXT[] DEFAULT '{}',
    Es_Sensible BOOLEAN DEFAULT FALSE,
    Estado_Alerta VARCHAR(20) DEFAULT 'normal'
        CHECK (Estado_Alerta IN ('normal', 'borderline', 'critico')),
    Subido_Por INT NOT NULL,
    Tiene_Valores BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (ID_Paciente) REFERENCES Paciente(ID_Paciente) ON DELETE CASCADE,
    FOREIGN KEY (ID_Consulta) REFERENCES Consulta_Medica(ID_Consulta) ON DELETE SET NULL,
    FOREIGN KEY (Subido_Por) REFERENCES Usuario(ID_Usuario) ON DELETE RESTRICT
);

CREATE TABLE Valor_Examen (
    ID_Valor SERIAL PRIMARY KEY,
    ID_Examen INT NOT NULL,
    Nombre_Valor VARCHAR(100) NOT NULL,
    Valor_Numerico NUMERIC(12, 4),
    Valor_Texto VARCHAR(500),
    Unidad VARCHAR(50),
    Rango_Minimo NUMERIC(12, 4),
    Rango_Maximo NUMERIC(12, 4),
    Estado VARCHAR(20) DEFAULT 'normal'
        CHECK (Estado IN ('normal', 'alterado', 'critico')),
    FOREIGN KEY (ID_Examen) REFERENCES Examen(ID_Examen) ON DELETE CASCADE
);

CREATE TABLE Log_Acceso_Sensible (
    ID_Log SERIAL PRIMARY KEY,
    ID_Examen INT NOT NULL,
    ID_Usuario INT NOT NULL,
    Fecha_Acceso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IP VARCHAR(45),
    FOREIGN KEY (ID_Examen) REFERENCES Examen(ID_Examen) ON DELETE CASCADE,
    FOREIGN KEY (ID_Usuario) REFERENCES Usuario(ID_Usuario) ON DELETE RESTRICT
);

CREATE TABLE Rango_Referencia (
    ID_Rango SERIAL PRIMARY KEY,
    Nombre_Valor VARCHAR(100) NOT NULL,
    Unidad VARCHAR(50),
    Rango_Minimo NUMERIC(12, 4) NOT NULL,
    Rango_Maximo NUMERIC(12, 4) NOT NULL,
    Limite_Critico_Inferior NUMERIC(12, 4),
    Limite_Critico_Superior NUMERIC(12, 4),
    Activo BOOLEAN DEFAULT TRUE
);

-- Rangos de referencia por defecto
INSERT INTO Rango_Referencia (Nombre_Valor, Unidad, Rango_Minimo, Rango_Maximo, Limite_Critico_Inferior, Limite_Critico_Superior) VALUES
('Glucosa', 'mg/dL', 70, 100, 54, 200),
('Hemoglobina', 'g/dL', 13.5, 17.5, 8, 20),
('Hematocrito', '%', 38.3, 48.6, 20, 60),
('Leucocitos', '/mm³', 4500, 11000, 2000, 20000),
('Plaquetas', '/mm³', 150000, 450000, 50000, 700000),
('Colesterol Total', 'mg/dL', 125, 200, null, 300),
('Colesterol HDL', 'mg/dL', 40, 60, null, null),
('Colesterol LDL', 'mg/dL', 0, 100, null, 190),
('Triglicéridos', 'mg/dL', 0, 150, null, 400),
('Creatinina', 'mg/dL', 0.6, 1.2, null, 3),
('Urea', 'mg/dL', 10, 50, null, 100),
('Ácido Úrico', 'mg/dL', 3.5, 7.2, null, 10),
('TSH', 'mIU/L', 0.4, 4.5, null, 10),
('T4 Libre', 'ng/dL', 0.8, 1.8, null, null),
('ALT', 'U/L', 7, 56, null, 150),
('AST', 'U/L', 10, 40, null, 150),
('GGT', 'U/L', 9, 48, null, 100),
('Bilirrubina Total', 'mg/dL', 0.1, 1.2, null, 5),
('Proteína C Reactiva', 'mg/L', 0, 5, null, 20),
('Potasio', 'mEq/L', 3.5, 5.1, 2.5, 6.5),
('Sodio', 'mEq/L', 136, 145, 120, 155),
('Calcio', 'mg/dL', 8.5, 10.5, 7, 12),
('Ácido Láctico', 'mmol/L', 0.5, 2.2, null, null),
('Vitamina D', 'ng/mL', 20, 50, null, null);
