const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { normalizeRow, normalizeRows } = require('../utils/normalize-rows');

const router = express.Router();

router.get('/', authenticateToken, async(req, res) => {
    try {
        const result = await pool.query(
            `SELECT p.*, cm.ID_Cita
       FROM Pago p
       JOIN Consulta_Medica cm ON p.ID_Consulta = cm.ID_Consulta
       ORDER BY p.Fecha_Pago DESC`,
        );
        res.json(normalizeRows(result.rows));
    } catch (error) {
        console.error('Error al obtener pagos:', error);
        res.status(500).json({ message: 'Error al obtener pagos' });
    }
});

router.get('/reporte', authenticateToken, async(req, res) => {
    try {
        const { inicio, fin } = req.query;
        const result = await pool.query(
            `SELECT p.*, cm.ID_Cita
       FROM Pago p
       JOIN Consulta_Medica cm ON p.ID_Consulta = cm.ID_Consulta
       WHERE DATE(p.Fecha_Pago) >= $1 AND DATE(p.Fecha_Pago) <= $2
       ORDER BY p.Fecha_Pago DESC`, [inicio, fin],
        );
        res.json(normalizeRows(result.rows));
    } catch (error) {
        console.error('Error al generar reporte:', error);
        res.status(500).json({ message: 'Error al generar reporte de pagos' });
    }
});

router.post('/', authenticateToken, async(req, res) => {
    try {
        const { ID_Consulta, Monto } = req.body;

        if (!ID_Consulta || Monto === undefined || Monto < 0) {
            return res.status(400).json({ message: 'ID de consulta y monto válido son requeridos' });
        }

        const result = await pool.query(
            `INSERT INTO Pago (ID_Consulta, Monto, Estado_Pago)
       VALUES ($1, $2, 'Completado') RETURNING *`, [ID_Consulta, Monto],
        );

        res.status(201).json(normalizeRow(result.rows[0]));
    } catch (error) {
        console.error('Error al registrar pago:', error);
        res.status(500).json({ message: 'Error al registrar pago. Verifique que la consulta exista.' });
    }
});

router.put('/:id', authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;
        const { Estado_Pago } = req.body;

        const result = await pool.query(
            'UPDATE Pago SET Estado_Pago = $1 WHERE ID_Pago = $2 RETURNING *', [Estado_Pago, id],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }
        res.json(normalizeRow(result.rows[0]));
    } catch (error) {
        console.error('Error al actualizar pago:', error);
        res.status(500).json({ message: 'Error al actualizar pago' });
    }
});

module.exports = router;