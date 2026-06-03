const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { normalizeRow, normalizeRows } = require('../utils/normalize-rows');

const router = express.Router();

router.get('/', authenticateToken, async(req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.ID_Cita, c.ID_Paciente, c.ID_Medico, c.Fecha_Hora, c.Estado,
              p.Nombres || ' ' || p.Apellidos AS "Paciente_Nombre",
              m.Nombres || ' ' || m.Apellidos AS "Medico_Nombre",
              e.Nombre_Especialidad AS "Especialidad"
       FROM Cita c
       JOIN Paciente p ON c.ID_Paciente = p.ID_Paciente
       JOIN Medico m ON c.ID_Medico = m.ID_Medico
       JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
       ORDER BY c.Fecha_Hora DESC`,
        );
        res.json(normalizeRows(result.rows));
    } catch (error) {
        console.error('Error al obtener citas:', error);
        res.status(500).json({ message: 'Error al obtener citas' });
    }
});

router.get('/fecha/:fecha', authenticateToken, async(req, res) => {
    try {
        const { fecha } = req.params;
        const result = await pool.query(
            `SELECT c.ID_Cita, c.ID_Paciente, c.ID_Medico, c.Fecha_Hora, c.Estado,
              p.Nombres || ' ' || p.Apellidos AS "Paciente_Nombre",
              m.Nombres || ' ' || m.Apellidos AS "Medico_Nombre",
              e.Nombre_Especialidad AS "Especialidad",
              cm.ID_Consulta
       FROM Cita c
       JOIN Paciente p ON c.ID_Paciente = p.ID_Paciente
       JOIN Medico m ON c.ID_Medico = m.ID_Medico
       JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
       LEFT JOIN Consulta_Medica cm ON c.ID_Cita = cm.ID_Cita
       WHERE DATE(c.Fecha_Hora) = $1
       ORDER BY c.Fecha_Hora`, [fecha],
        );
        res.json(normalizeRows(result.rows));
    } catch (error) {
        console.error('Error al obtener citas por fecha:', error);
        res.status(500).json({ message: 'Error al obtener citas por fecha' });
    }
});

router.get('/hoy', authenticateToken, async(req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.ID_Cita, c.ID_Paciente, c.ID_Medico, c.Fecha_Hora, c.Estado,
              p.Nombres || ' ' || p.Apellidos AS "Paciente_Nombre",
              m.Nombres || ' ' || m.Apellidos AS "Medico_Nombre",
              e.Nombre_Especialidad AS "Especialidad"
       FROM Cita c
       JOIN Paciente p ON c.ID_Paciente = p.ID_Paciente
       JOIN Medico m ON c.ID_Medico = m.ID_Medico
       JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
       WHERE DATE(c.Fecha_Hora) = CURRENT_DATE
       ORDER BY c.Fecha_Hora`,
        );
        res.json(normalizeRows(result.rows));
    } catch (error) {
        console.error('Error al obtener citas de hoy:', error);
        res.status(500).json({ message: 'Error al obtener citas de hoy' });
    }
});

router.get('/medico/:idMedico', authenticateToken, async(req, res) => {
    try {
        const { idMedico } = req.params;
        const result = await pool.query(
            `SELECT c.*, p.Nombres || ' ' || p.Apellidos AS "Paciente_Nombre",
              e.Nombre_Especialidad AS "Especialidad"
       FROM Cita c
       JOIN Paciente p ON c.ID_Paciente = p.ID_Paciente
       JOIN Medico m ON c.ID_Medico = m.ID_Medico
       JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
       WHERE c.ID_Medico = $1
       ORDER BY c.Fecha_Hora DESC`, [idMedico],
        );
        res.json(normalizeRows(result.rows));
    } catch (error) {
        console.error('Error al obtener citas del médico:', error);
        res.status(500).json({ message: 'Error al obtener citas del médico' });
    }
});

router.get('/paciente/:idPaciente', authenticateToken, async(req, res) => {
    try {
        const { idPaciente } = req.params;
        const result = await pool.query(
            `SELECT c.*, m.Nombres || ' ' || m.Apellidos AS "Medico_Nombre",
              e.Nombre_Especialidad AS "Especialidad"
       FROM Cita c
       JOIN Medico m ON c.ID_Medico = m.ID_Medico
       JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
       WHERE c.ID_Paciente = $1
       ORDER BY c.Fecha_Hora DESC`, [idPaciente],
        );
        res.json(normalizeRows(result.rows));
    } catch (error) {
        console.error('Error al obtener citas del paciente:', error);
        res.status(500).json({ message: 'Error al obtener citas del paciente' });
    }
});

router.post('/', authenticateToken, async(req, res) => {
    try {
        let { ID_Paciente, ID_Medico, Fecha_Hora } = req.body;

        let ajustado = false;
        let intentos = 10;
        while (intentos-- > 0) {
            const conflicto = await pool.query(
                `SELECT * FROM Cita WHERE ID_Medico = $1 AND Fecha_Hora >= $2 AND Fecha_Hora < ($2::timestamp + INTERVAL '30 minutes') AND Estado NOT IN ('Cancelada')`, [ID_Medico, Fecha_Hora],
            );
            if (conflicto.rows.length === 0) break;

            const masTarde = await pool.query(
                `SELECT to_char(($1::timestamp + INTERVAL '30 minutes')::timestamp, 'YYYY-MM-DD"T"HH24:MI') as nueva`, [Fecha_Hora],
            );
            Fecha_Hora = masTarde.rows[0].nueva;
            ajustado = true;
        }

        if (intentos < 0) {
            return res.status(409).json({ message: 'Horario muy congestionado, intente con otro día' });
        }

        const result = await pool.query(
            `INSERT INTO Cita (ID_Paciente, ID_Medico, Fecha_Hora, Estado)
       VALUES ($1, $2, $3, 'Pendiente') RETURNING *`, [ID_Paciente, ID_Medico, Fecha_Hora],
        );

        res.status(201).json({
            ...normalizeRow(result.rows[0]),
            Ajustado: ajustado,
        });
    } catch (error) {
        console.error('Error al crear cita:', error);
        res.status(500).json({ message: 'Error al crear cita. Verifique que el horario esté disponible.' });
    }
});

router.put('/:id', authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;
        const { Estado } = req.body;

        const estadosValidos = ['Pendiente', 'En Espera', 'Cancelada', 'Reprogramada', 'Atendida'];
        if (!estadosValidos.includes(Estado)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }

        const result = await pool.query(
            'UPDATE Cita SET Estado = $1 WHERE ID_Cita = $2 RETURNING *', [Estado, id],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        res.json(normalizeRow(result.rows[0]));
    } catch (error) {
        console.error('Error al actualizar cita:', error);
        res.status(500).json({ message: 'Error al actualizar cita' });
    }
});

router.delete('/:id', authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE Cita SET Estado = 'Cancelada' WHERE ID_Cita = $1 RETURNING *", [id],
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Cita no encontrada' });
        }
        res.json({ message: 'Cita cancelada exitosamente' });
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        res.status(500).json({ message: 'Error al cancelar cita' });
    }
});

module.exports = router;