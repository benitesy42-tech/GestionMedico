const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { normalizeRow, normalizeRows } = require('../utils/normalize-rows');

const router = express.Router();

router.get('/', authenticateToken, async(req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Especialidad ORDER BY Nombre_Especialidad');
        res.json(normalizeRows(result.rows));
    } catch (error) {
        console.error('Error al obtener especialidades:', error);
        res.status(500).json({ message: 'Error al obtener especialidades' });
    }
});

router.post('/', authenticateToken, async(req, res) => {
    try {
        const { Nombre_Especialidad } = req.body;
        const result = await pool.query(
            'INSERT INTO Especialidad (Nombre_Especialidad) VALUES ($1) RETURNING *', [Nombre_Especialidad],
        );
        res.status(201).json(normalizeRow(result.rows[0]));
    } catch (error) {
        console.error('Error al crear especialidad:', error);
        res.status(500).json({ message: 'Error al crear especialidad. Verifique que no esté duplicada.' });
    }
});

router.put('/:id', authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;
        const { Nombre_Especialidad } = req.body;
        const result = await pool.query(
            'UPDATE Especialidad SET Nombre_Especialidad = $1 WHERE ID_Especialidad = $2 RETURNING *', [Nombre_Especialidad, id],
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Especialidad no encontrada' });
        }
        res.json(normalizeRow(result.rows[0]));
    } catch (error) {
        console.error('Error al actualizar especialidad:', error);
        res.status(500).json({ message: 'Error al actualizar especialidad' });
    }
});

router.delete('/:id', authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM Especialidad WHERE ID_Especialidad = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Especialidad no encontrada' });
        }
        res.json({ message: 'Especialidad eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar especialidad:', error);
        res.status(500).json({ message: 'No se puede eliminar la especialidad porque tiene médicos asociados.' });
    }
});

module.exports = router;