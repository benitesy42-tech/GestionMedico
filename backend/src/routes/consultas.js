const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { normalizeRow, normalizeRows } = require('../utils/normalize-rows');

const router = express.Router();

router.get('/paciente/:idPaciente', authenticateToken, async(req, res) => {
    try {
        const { idPaciente } = req.params;
        const { desde, hasta } = req.query;

        const conditions = ['c.ID_Paciente = $1'];
        const params = [idPaciente];

        if (desde) {
            conditions.push(`cm.Fecha_Registro >= $${params.length + 1}`);
            params.push(desde);
        }
        if (hasta) {
            conditions.push(`cm.Fecha_Registro <= $${params.length + 1}`);
            params.push(hasta + 'T23:59:59');
        }

        const whereClause = 'WHERE ' + conditions.join(' AND ');

        const result = await pool.query(
            `SELECT cm.*, c.Fecha_Hora,
              m.Nombres || ' ' || m.Apellidos AS Medico_Nombre,
              e.Nombre_Especialidad AS Especialidad,
              p.Nombres || ' ' || p.Apellidos AS Paciente_Nombre,
              p.DNI AS Paciente_DNI,
              (SELECT json_agg(json_build_object(
                'ID_Signo', sv.ID_Signo,
                'Presion_Arterial', sv.Presion_Arterial,
                'Frecuencia_Cardiaca', sv.Frecuencia_Cardiaca,
                'Temperatura', sv.Temperatura,
                'Peso', sv.Peso,
                'Estatura', sv.Estatura,
                'Frecuencia_Respiratoria', sv.Frecuencia_Respiratoria,
                'Saturacion_Oxigeno', sv.Saturacion_Oxigeno
              )) FROM Signos_Vitales sv WHERE sv.ID_Consulta = cm.ID_Consulta) AS Signos_Vitales,
              (SELECT json_agg(json_build_object(
                'ID_Receta', rm.ID_Receta,
                'Medicamento', rm.Medicamento,
                'Dosis', rm.Dosis,
                'Frecuencia', rm.Frecuencia,
                'Duracion', rm.Duracion
              )) FROM Receta_Medicamento rm WHERE rm.ID_Consulta = cm.ID_Consulta) AS Recetas
       FROM Consulta_Medica cm
       JOIN Cita c ON cm.ID_Cita = c.ID_Cita
       JOIN Medico m ON c.ID_Medico = m.ID_Medico
       JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
       JOIN Paciente p ON c.ID_Paciente = p.ID_Paciente
       ${whereClause}
       ORDER BY cm.Fecha_Registro DESC`, params,
        );
        res.json(normalizeRows(result.rows));
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ message: 'Error al obtener historial de consultas' });
    }
});

router.post('/', authenticateToken, async(req, res) => {
    const client = await pool.connect();
    try {
        const {
            ID_Cita, Motivo, Sintomas, Diagnostico_Notas,
            Tratamiento, Observaciones,
            Signos_Vitales,
            Recetas,
        } = req.body;

        if (!Motivo || !Diagnostico_Notas) {
            return res.status(400).json({ message: 'Motivo y diagnóstico son requeridos' });
        }

        await client.query('BEGIN');

        const consultaResult = await client.query(
            `INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas, Tratamiento, Observaciones)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [ID_Cita, Motivo, Sintomas || '', Diagnostico_Notas, Tratamiento || '', Observaciones || ''],
        );
        const consulta = consultaResult.rows[0];

        if (Signos_Vitales) {
            const { Presion_Arterial, Frecuencia_Cardiaca, Temperatura, Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno } = Signos_Vitales;
            await client.query(
                `INSERT INTO Signos_Vitales (ID_Consulta, Presion_Arterial, Frecuencia_Cardiaca, Temperatura, Peso, Estatura, Frecuencia_Respiratoria, Saturacion_Oxigeno)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [consulta.id_consulta, Presion_Arterial || '', Frecuencia_Cardiaca || null, Temperatura || null, Peso || null, Estatura || null, Frecuencia_Respiratoria || null, Saturacion_Oxigeno || null],
            );
        }

        if (Recetas && Array.isArray(Recetas) && Recetas.length > 0) {
            for (const receta of Recetas) {
                await client.query(
                    `INSERT INTO Receta_Medicamento (ID_Consulta, Medicamento, Dosis, Frecuencia, Duracion)
             VALUES ($1, $2, $3, $4, $5)`,
                    [consulta.id_consulta, receta.Medicamento, receta.Dosis, receta.Frecuencia, receta.Duracion || ''],
                );
            }
        }

        await client.query('COMMIT');

        const fullResult = await pool.query(
            `SELECT cm.*, c.Fecha_Hora,
              m.Nombres || ' ' || m.Apellidos AS Medico_Nombre,
              e.Nombre_Especialidad AS Especialidad,
              p.Nombres || ' ' || p.Apellidos AS Paciente_Nombre,
              (SELECT json_agg(json_build_object(
                'ID_Signo', sv.ID_Signo, 'Presion_Arterial', sv.Presion_Arterial,
                'Frecuencia_Cardiaca', sv.Frecuencia_Cardiaca, 'Temperatura', sv.Temperatura,
                'Peso', sv.Peso, 'Estatura', sv.Estatura,
                'Frecuencia_Respiratoria', sv.Frecuencia_Respiratoria, 'Saturacion_Oxigeno', sv.Saturacion_Oxigeno
              )) FROM Signos_Vitales sv WHERE sv.ID_Consulta = cm.ID_Consulta) AS Signos_Vitales,
              (SELECT json_agg(json_build_object(
                'ID_Receta', rm.ID_Receta, 'Medicamento', rm.Medicamento,
                'Dosis', rm.Dosis, 'Frecuencia', rm.Frecuencia, 'Duracion', rm.Duracion
              )) FROM Receta_Medicamento rm WHERE rm.ID_Consulta = cm.ID_Consulta) AS Recetas
       FROM Consulta_Medica cm
       JOIN Cita c ON cm.ID_Cita = c.ID_Cita
       JOIN Medico m ON c.ID_Medico = m.ID_Medico
       JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
       JOIN Paciente p ON c.ID_Paciente = p.ID_Paciente
       WHERE cm.ID_Consulta = $1`, [consulta.id_consulta],
        );

        res.status(201).json(normalizeRow(fullResult.rows[0]));
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al registrar consulta:', error);
        res.status(500).json({ message: 'Error al registrar consulta. Verifique que la cita exista.' });
    } finally {
        client.release();
    }
});

module.exports = router;
