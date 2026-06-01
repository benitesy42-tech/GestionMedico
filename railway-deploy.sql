-- ==============================================================
-- SGCM - Script completo para Railway (migración + seed masivo)
-- ==============================================================

--------------------------------------------
-- 1. MIGRACIÓN: nuevas columnas y tablas
--------------------------------------------

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

--------------------------------------------
-- 2. DATOS INICIALES (solo si la tabla Rol está vacía)
--------------------------------------------

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM Rol) THEN

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

  END IF;
END $$;

--------------------------------------------
-- 3. USUARIOS (solo si no existen)
--------------------------------------------

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username_Correo = 'admin@sgcm.com') THEN
    INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
    VALUES (1, 'admin@sgcm.com', '$2b$10$DW25pjba54e6kg/A67yOAu2jJT9t6H04V0vfM4uI21WVZkDiikEwK', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username_Correo = 'recepcion@sgcm.com') THEN
    INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
    VALUES (2, 'recepcion@sgcm.com', '$2b$10$ShjxAE4rXy42AJvJ.zdd4uMvfzGBAeFOnNNZVjaNu/LF.WkZ2Yjgi', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username_Correo = 'dr.paredes@sgcm.com') THEN
    INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
    VALUES (3, 'dr.paredes@sgcm.com', '$2b$10$ZhpJxcUekfpQBbmZmpt3zOwEjOnsngYXWBW9SOw6U8AQh9YOhEO6K', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username_Correo = 'dra.lopez@sgcm.com') THEN
    INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
    VALUES (3, 'dra.lopez@sgcm.com', '$2b$10$FG2IBuDZjmOmR2RhweG19O7jO5467piPQur1bbpIlmJr.FOx.0Mze', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username_Correo = 'paciente1@sgcm.com') THEN
    INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo) VALUES (4, 'paciente1@sgcm.com', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username_Correo = 'paciente2@sgcm.com') THEN
    INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo) VALUES (4, 'paciente2@sgcm.com', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username_Correo = 'paciente3@sgcm.com') THEN
    INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo) VALUES (4, 'paciente3@sgcm.com', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username_Correo = 'paciente4@sgcm.com') THEN
    INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo) VALUES (4, 'paciente4@sgcm.com', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username_Correo = 'paciente5@sgcm.com') THEN
    INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo) VALUES (4, 'paciente5@sgcm.com', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username_Correo = 'paciente6@sgcm.com') THEN
    INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo) VALUES (4, 'paciente6@sgcm.com', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username_Correo = 'paciente7@sgcm.com') THEN
    INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo) VALUES (4, 'paciente7@sgcm.com', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Usuario WHERE Username_Correo = 'paciente8@sgcm.com') THEN
    INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo) VALUES (4, 'paciente8@sgcm.com', '$2b$10$0YWwk9/MRNJ.D9Gu5Xff1.XMw0l6fsGArLXshgwdzcY9zi7bOtcVS', true);
  END IF;
END $$;

--------------------------------------------
-- 4. MÉDICOS
--------------------------------------------

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM Medico WHERE Numero_Colegiatura = 'COL-12345') THEN
    INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura)
    VALUES ((SELECT ID_Usuario FROM Usuario WHERE Username_Correo = 'dr.paredes@sgcm.com'), 1, 'Carlos', 'Paredes Molina', 'COL-12345');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Medico WHERE Numero_Colegiatura = 'COL-12346') THEN
    INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura)
    VALUES ((SELECT ID_Usuario FROM Usuario WHERE Username_Correo = 'dra.lopez@sgcm.com'), 2, 'María', 'López García', 'COL-12346');
  END IF;
END $$;

--------------------------------------------
-- 5. PACIENTES (8 pacientes variados)
--------------------------------------------

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM Paciente WHERE DNI = '1100123456') THEN
    INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
    VALUES ((SELECT ID_Usuario FROM Usuario WHERE Username_Correo = 'paciente1@sgcm.com'), '1100123456', 'Juan', 'Pérez Ramírez', '0999123456', '1990-05-15');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Paciente WHERE DNI = '1100789012') THEN
    INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
    VALUES ((SELECT ID_Usuario FROM Usuario WHERE Username_Correo = 'paciente2@sgcm.com'), '1100789012', 'Ana', 'Jiménez Torres', '0999789012', '1985-08-22');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Paciente WHERE DNI = '1100345678') THEN
    INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
    VALUES ((SELECT ID_Usuario FROM Usuario WHERE Username_Correo = 'paciente3@sgcm.com'), '1100345678', 'Pedro', 'González Ruiz', '0999345678', '1978-11-03');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Paciente WHERE DNI = '1100567890') THEN
    INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
    VALUES ((SELECT ID_Usuario FROM Usuario WHERE Username_Correo = 'paciente4@sgcm.com'), '1100567890', 'María', 'Fernández Díaz', '0999567890', '1995-02-18');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Paciente WHERE DNI = '1100987654') THEN
    INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
    VALUES ((SELECT ID_Usuario FROM Usuario WHERE Username_Correo = 'paciente5@sgcm.com'), '1100987654', 'Luis', 'Martínez Herrera', '0999987654', '1982-07-29');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Paciente WHERE DNI = '1100112233') THEN
    INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
    VALUES ((SELECT ID_Usuario FROM Usuario WHERE Username_Correo = 'paciente6@sgcm.com'), '1100112233', 'Carmen', 'Vargas López', '0999112233', '2000-01-10');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Paciente WHERE DNI = '1100445566') THEN
    INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
    VALUES ((SELECT ID_Usuario FROM Usuario WHERE Username_Correo = 'paciente7@sgcm.com'), '1100445566', 'Roberto', 'Morales Castro', '0999445566', '1992-09-14');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM Paciente WHERE DNI = '1100778899') THEN
    INSERT INTO Paciente (ID_Usuario, DNI, Nombres, Apellidos, Telefono, Fecha_Nacimiento)
    VALUES ((SELECT ID_Usuario FROM Usuario WHERE Username_Correo = 'paciente8@sgcm.com'), '1100778899', 'Laura', 'Salinas Vega', '0999778899', '1988-04-25');
  END IF;
END $$;

--------------------------------------------
-- 6. HORARIOS MÉDICOS
--------------------------------------------

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM Horario_Medico WHERE ID_Medico = 1 AND Dia_Semana = 'Lunes' AND Hora_Inicio = '08:00') THEN
    INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin) VALUES (1, 'Lunes', '08:00', '12:00');
    INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin) VALUES (1, 'Lunes', '14:00', '17:00');
    INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin) VALUES (1, 'Miércoles', '08:00', '12:00');
    INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin) VALUES (1, 'Viernes', '08:00', '12:00');
    INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin) VALUES (2, 'Martes', '08:00', '12:00');
    INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin) VALUES (2, 'Jueves', '08:00', '12:00');
    INSERT INTO Horario_Medico (ID_Medico, Dia_Semana, Hora_Inicio, Hora_Fin) VALUES (2, 'Viernes', '14:00', '18:00');
  END IF;
END $$;

--------------------------------------------
-- 7. CITAS (pasadas, hoy y futuras)
--------------------------------------------

-- Helper: obtener IDs
-- Medico 1 = Dr. Paredes (ID 1), Medico 2 = Dra. López (ID 2)
-- Paciente IDs: 1=Juan, 2=Ana, 3=Pedro, 4=María, 5=Luis, 6=Carmen, 7=Roberto, 8=Laura

-- Insertar citas solo si no hay muchas ya
DO $$ BEGIN
  IF (SELECT COUNT(*) FROM Cita) < 5 THEN

    -- Citas pasadas (Atendidas)
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (1, 1, NOW() - INTERVAL '30 days', 'Atendida');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (2, 2, NOW() - INTERVAL '28 days', 'Atendida');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (3, 1, NOW() - INTERVAL '25 days', 'Atendida');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (4, 2, NOW() - INTERVAL '21 days', 'Atendida');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (5, 1, NOW() - INTERVAL '18 days', 'Atendida');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (6, 2, NOW() - INTERVAL '14 days', 'Atendida');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (7, 1, NOW() - INTERVAL '10 days', 'Atendida');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (8, 2, NOW() - INTERVAL '7 days', 'Atendida');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (1, 1, NOW() - INTERVAL '5 days', 'Atendida');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (3, 2, NOW() - INTERVAL '3 days', 'Atendida');

    -- Citas de hoy (Pendiente / En Espera)
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (4, 1, NOW() + INTERVAL '1 hour', 'Pendiente');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (5, 2, NOW() + INTERVAL '2 hours', 'Pendiente');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (6, 1, NOW() + INTERVAL '3 hours', 'Pendiente');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (7, 2, NOW() + INTERVAL '4 hours', 'Pendiente');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (8, 1, NOW() + INTERVAL '5 hours', 'Pendiente');

    -- Citas futuras
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (2, 1, NOW() + INTERVAL '1 day', 'Pendiente');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (1, 2, NOW() + INTERVAL '2 days', 'Pendiente');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (3, 1, NOW() + INTERVAL '3 days', 'Pendiente');
    INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado) VALUES (5, 2, NOW() + INTERVAL '4 days', 'Pendiente');

  END IF;
END $$;

--------------------------------------------
-- 8. CONSULTAS MÉDICAS con SIGNOS VITALES y RECETAS
--------------------------------------------

DO $$ BEGIN
  -- Solo insertar si no hay consultas
  IF (SELECT COUNT(*) FROM Consulta_Medica) = 0 THEN

    -- Consulta 1: Juan Pérez (ID_Cita 1) - Dr. Paredes - Medicina General - hace 30 días
    INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas, Tratamiento, Observaciones, Fecha_Registro)
    VALUES (1, 'Control general de salud',
            'Fatiga leve, dolor de cabeza ocasional',
            'Paciente en buen estado general. Presión arterial ligeramente elevada. Se recomienda controlar sodio en dieta.',
            'Dieta baja en sodio, ejercicio moderado 30 min/día',
            'Paciente debe regresar en 3 meses para control. Se solicita análisis de sangre.',
            NOW() - INTERVAL '30 days');
    INSERT INTO Signos_Vitales (ID_Consulta, Presion_Arterial, Frecuencia_Cardiaca, Temperatura, Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno)
    VALUES (1, '130/85', 78, 36.6, 82.5, 175, 16, 98);
    INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion) VALUES (1, 'Enalapril 10mg', '10 mg', 'Cada 24 horas', '3 meses');

    -- Consulta 2: Ana Jiménez (ID_Cita 2) - Dra. López - Cardiología - hace 28 días
    INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas, Tratamiento, Observaciones, Fecha_Registro)
    VALUES (2, 'Dolor en el pecho',
            'Dolor punzante en el lado izquierdo del pecho, dura 2-3 minutos, ocurre al hacer esfuerzo',
            'Angina de pecho estable. ECG muestra leve isquemia en derivaciones inferiores.',
            'Reposo relativo, evitar esfuerzos intensos',
            'Se refiere a cardiólogo para prueba de esfuerzo. Evitar café y tabaco.',
            NOW() - INTERVAL '28 days');
    INSERT INTO Signos_Vitales (ID_Consulta, Presion_Arterial, Frecuencia_Cardiaca, Temperatura, Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno)
    VALUES (2, '145/95', 88, 36.8, 68.0, 162, 18, 97);
    INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion) VALUES (2, 'Aspirina 100mg', '100 mg', 'Cada 24 horas', 'Indefinido');
    INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion) VALUES (2, 'Nitroglicerina SL', '0.5 mg', 'Sublingual en caso de dolor', 'Según necesidad');

    -- Consulta 3: Pedro González (ID_Cita 3) - Dr. Paredes - hace 25 días
    INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas, Tratamiento, Observaciones, Fecha_Registro)
    VALUES (3, 'Dolor lumbar crónico',
            'Dolor en la parte baja de la espalda que empeora al estar sentado mucho tiempo',
            'Lumbalgia mecánica por mala postura. Sin signos de compresión radicular.',
            'Fisioterapia 2 veces por semana, ejercicios de fortalecimiento lumbar',
            'Usar silla ergonómica. Evitar levantar objetos pesados.',
            NOW() - INTERVAL '25 days');
    INSERT INTO Signos_Vitales (ID_Consulta, Presion_Arterial, Frecuencia_Cardiaca, Temperatura, Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno)
    VALUES (3, '120/80', 72, 36.5, 78.0, 170, 16, 99);
    INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion) VALUES (3, 'Ibuprofeno 600mg', '600 mg', 'Cada 8 horas', '7 días');
    INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion) VALUES (3, 'Relajante muscular', '50 mg', 'Cada 12 horas', '5 días');

    -- Consulta 4: María Fernández (ID_Cita 4) - Dra. López - hace 21 días
    INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas, Tratamiento, Observaciones, Fecha_Registro)
    VALUES (4, 'Palpitaciones',
            'Sensación de latidos fuertes e irregulares, mareos ocasionales',
            'Taquicardia sinusal. Holter 24h muestra ritmo sinusal con episodios de taquicardia. ECG normal.',
            'Reducir consumo de cafeína y alcohol',
            'Iniciar betabloqueante. Control en 1 mes.',
            NOW() - INTERVAL '21 days');
    INSERT INTO Signos_Vitales (ID_Consulta, Presion_Arterial, Frecuencia_Cardiaca, Temperatura, Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno)
    VALUES (4, '125/78', 95, 36.7, 64.3, 160, 17, 98);
    INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion) VALUES (4, 'Propranolol 40mg', '40 mg', 'Cada 12 horas', '1 mes');

    -- Consulta 5: Luis Martínez (ID_Cita 5) - Dr. Paredes - hace 18 días
    INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas, Tratamiento, Observaciones, Fecha_Registro)
    VALUES (5, 'Infección respiratoria',
            'Tos seca, fiebre de 38.5°C, congestión nasal, dolor de garganta',
            'Faringitis bacteriana. Amígdalas inflamadas con exudado purulento.',
            'Antibiótico por 7 días, antipirético según necesidad',
            'Reposo por 48 horas. Tomar abundantes líquidos. No automedicarse.',
            NOW() - INTERVAL '18 days');
    INSERT INTO Signos_Vitales (ID_Consulta, Presion_Arterial, Frecuencia_Cardiaca, Temperatura, Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno)
    VALUES (5, '118/75', 82, 38.5, 75.0, 168, 20, 96);
    INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion) VALUES (5, 'Amoxicilina 500mg', '500 mg', 'Cada 8 horas', '7 días');
    INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion) VALUES (5, 'Paracetamol 500mg', '500 mg', 'Cada 6 horas si fiebre', '3 días');

    -- Consulta 6: Carmen Vargas (ID_Cita 6) - Dra. López - hace 14 días
    INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas, Tratamiento, Observaciones, Fecha_Registro)
    VALUES (6, 'Chequeo cardiovascular',
            'Asintomática. Antecedentes familiares de cardiopatía.',
            'Paciente asintomática. ECG normal. Perfil lipídico pendiente. Sin hallazgos patológicos.',
            'Dieta balanceada, ejercicio aeróbico 3 veces/semana',
            'Continuar con control anual. Se solicita perfil lipídico.',
            NOW() - INTERVAL '14 days');
    INSERT INTO Signos_Vitales (ID_Consulta, Presion_Arterial, Frecuencia_Cardiaca, Temperatura, Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno)
    VALUES (6, '110/70', 68, 36.4, 58.0, 165, 15, 100);

    -- Consulta 7: Roberto Morales (ID_Cita 7) - Dr. Paredes - hace 10 días
    INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas, Tratamiento, Observaciones, Fecha_Registro)
    VALUES (7, 'Dolor de rodilla',
            'Dolor en rodilla derecha al caminar, hinchazón moderada, dificultad para flexionar',
            'Gonartrosis derecha grado II. Derrame articular leve.',
            'Antiinflamatorios, fisioterapia, evitar impacto',
            'Usar rodillera durante actividades. Evaluar infiltración si no mejora.',
            NOW() - INTERVAL '10 days');
    INSERT INTO Signos_Vitales (ID_Consulta, Presion_Arterial, Frecuencia_Cardiaca, Temperatura, Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno)
    VALUES (7, '128/82', 74, 36.6, 90.0, 180, 16, 98);
    INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion) VALUES (7, 'Naproxeno 500mg', '500 mg', 'Cada 12 horas', '10 días');
    INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion) VALUES (7, 'Omeprazol 20mg', '20 mg', 'Cada 24 horas', '10 días');

    -- Consulta 8: Laura Salinas (ID_Cita 8) - Dra. López - hace 7 días
    INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas, Tratamiento, Observaciones, Fecha_Registro)
    VALUES (8, 'Hipertensión arterial',
            'Cefalea occipital, mareos, visión borrosa ocasional',
            'Hipertensión arterial grado I. Presión elevada en tomas repetidas.',
            'Fármacos antihipertensivos, dieta DASH, reducir sodio',
            'Control en 2 semanas. Monitorear PA en casa.',
            NOW() - INTERVAL '7 days');
    INSERT INTO Signos_Vitales (ID_Consulta, Presion_Arterial, Frecuencia_Cardiaca, Temperatura, Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno)
    VALUES (8, '150/95', 80, 36.5, 72.0, 158, 17, 97);
    INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion) VALUES (8, 'Losartán 50mg', '50 mg', 'Cada 24 horas', '1 mes');
    INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion) VALUES (8, 'Hidroclorotiazida 25mg', '25 mg', 'Cada 24 horas', '1 mes');

    -- Consulta 9: Juan Pérez (ID_Cita 9) - Dr. Paredes - hace 5 días (control)
    INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas, Tratamiento, Observaciones, Fecha_Registro)
    VALUES (9, 'Control de hipertensión',
            'Paciente refiere cumplir con medicación. Sin síntomas.',
            'PA controlada (125/80). Paciente responde bien al tratamiento. Continúa igual.',
            'Mantener Enalapril, continuar con dieta',
            'Control nuevamente en 3 meses. Sigue evolución favorable.',
            NOW() - INTERVAL '5 days');
    INSERT INTO Signos_Vitales (ID_Consulta, Presion_Arterial, Frecuencia_Cardiaca, Temperatura, Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno)
    VALUES (9, '125/80', 76, 36.5, 81.0, 175, 16, 99);

    -- Consulta 10: Pedro González (ID_Cita 10) - Dra. López - hace 3 días
    INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas, Tratamiento, Observaciones, Fecha_Registro)
    VALUES (10, 'Evaluación pre-operatoria',
            'Paciente requiere cirugía de hernia inguinal. Sin síntomas cardiovasculares.',
            'Paciente apto para cirugía. Riesgo quirúrgico bajo. ECG normal.',
            'Continuar medicación habitual. Suspender antiagregantes 5 días antes.',
            'Autorizado para cirugía. Valorar por anestesiología.',
            NOW() - INTERVAL '3 days');
    INSERT INTO Signos_Vitales (ID_Consulta, Presion_Arterial, Frecuencia_Cardiaca, Temperatura, Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno)
    VALUES (10, '122/78', 70, 36.4, 79.0, 170, 16, 99);

  END IF;
END $$;
