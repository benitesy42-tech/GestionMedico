const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { normalizeRow, normalizeRows } = require('../utils/normalize-rows');

const router = express.Router();

router.get('/paciente/:idPaciente', authenticateToken, async(req, res) => {
    try {
        const { idPaciente } = req.params;
        const result = await pool.query(
            `SELECT cm.*, c.Fecha_Hora, m.Nombres || ' ' || m.Apellidos AS Medico,
              e.Nombre_Especialidad AS Especialidad
       FROM Consulta_Medica cm
       JOIN Cita c ON cm.ID_Cita = c.ID_Cita
       JOIN Medico m ON c.ID_Medico = m.ID_Medico
       JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
       WHERE c.ID_Paciente = $1
       ORDER BY cm.Fecha_Registro DESC`, [idPaciente],
        );
        res.json(normalizeRows(result.rows));
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({ message: 'Error al obtener historial de consultas' });
    }
});

router.post('/', authenticateToken, async(req, res) => {
    try {
        const { ID_Cita, Motivo, Sintomas, Diagnostico_Notas } = req.body;

        if (!Motivo || !Diagnostico_Notas) {
            return res.status(400).json({ message: 'Motivo y diagnóstico son requeridos' });
        }

        const result = await pool.query(
            `INSERT INTO Consulta_Medica (ID_Cita, Motivo, Sintomas, Diagnostico_Notas)
       VALUES ($1, $2, $3, $4) RETURNING *`, [ID_Cita, Motivo, Sintomas || '', Diagnostico_Notas],
        );

        res.status(201).json(normalizeRow(result.rows[0]));
    } catch (error) {
        console.error('Error al registrar consulta:', error);
        res.status(500).json({ message: 'Error al registrar consulta. Verifique que la cita exista.' });
    }
});

module.exports = router;