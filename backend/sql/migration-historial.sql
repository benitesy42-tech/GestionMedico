-- Migration para Historial Clínico
-- Agrega columnas a Consulta_Medica y crea tablas de signos vitales y recetas

ALTER TABLE Consulta_Medica ADD COLUMN IF NOT EXISTS Tratamiento TEXT;
ALTER TABLE Consulta_Medica ADD COLUMN IF NOT EXISTS Observaciones TEXT;

CREATE TABLE IF NOT EXISTS Signos_Vitales (
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

CREATE TABLE IF NOT EXISTS Receta_Medicamento (
    ID_Receta SERIAL PRIMARY KEY,
    ID_Consulta INT NOT NULL,
    Medicamento VARCHAR(200) NOT NULL,
    Dosis VARCHAR(100) NOT NULL,
    Frecuencia VARCHAR(100) NOT NULL,
    Duracion VARCHAR(100),
    FOREIGN KEY (ID_Consulta) REFERENCES Consulta_Medica(ID_Consulta) ON DELETE CASCADE
);
