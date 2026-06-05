-- Tabla de conversaciones (chat entre dos usuarios)
CREATE TABLE IF NOT EXISTS Conversacion (
    ID_Conversacion SERIAL PRIMARY KEY,
    ID_Usuario_1 INTEGER NOT NULL REFERENCES Usuario(ID_Usuario),
    ID_Usuario_2 INTEGER NOT NULL REFERENCES Usuario(ID_Usuario),
    Creado_En TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (ID_Usuario_1 < ID_Usuario_2),
    UNIQUE(ID_Usuario_1, ID_Usuario_2)
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS Mensaje (
    ID_Mensaje SERIAL PRIMARY KEY,
    ID_Conversacion INTEGER NOT NULL REFERENCES Conversacion(ID_Conversacion) ON DELETE CASCADE,
    Remitente_ID INTEGER REFERENCES Usuario(ID_Usuario),
    Contenido TEXT NOT NULL,
    Tipo VARCHAR(10) DEFAULT 'texto' CHECK (Tipo IN ('texto', 'sistema')),
    Leido BOOLEAN DEFAULT FALSE,
    Creado_En TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_mensaje_conversacion ON Mensaje(ID_Conversacion, Creado_En DESC);
CREATE INDEX IF NOT EXISTS idx_mensaje_no_leido ON Mensaje(ID_Conversacion, Remitente_ID, Leido);
