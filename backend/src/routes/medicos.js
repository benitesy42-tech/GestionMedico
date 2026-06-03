const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { normalizeRow, normalizeRows } = require('../utils/normalize-rows');

const router = express.Router();

router.get('/', authenticateToken, async(req, res) => {
    try {
        const result = await pool.query(
            `SELECT m.ID_Medico, m.ID_Usuario, m.ID_Especialidad, m.Nombres, m.Apellidos,
              m.Numero_Colegiatura, e.Nombre_Especialidad
       FROM Medico m
       JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
       ORDER BY m.Apellidos`,
        );
        res.json(normalizeRows(result.rows));
    } catch (error) {
        console.error('Error al obtener médicos:', error);
        res.status(500).json({ message: 'Error al obtener médicos' });
    }
});

router.get('/:id', authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            `SELECT m.*, e.Nombre_Especialidad
       FROM Medico m
       JOIN Especialidad e ON m.ID_Especialidad = e.ID_Especialidad
       WHERE m.ID_Medico = $1`, [id],
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Médico no encontrado' });
        }
        res.json(normalizeRow(result.rows[0]));
    } catch (error) {
        console.error('Error al obtener médico:', error);
        res.status(500).json({ message: 'Error al obtener médico' });
    }
});

router.post('/', authenticateToken, async(req, res) => {
    const client = await pool.connect();
    try {
        const { ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura, Username_Correo, Password } = req.body;

        await client.query('BEGIN');

        const hashedPassword = await bcrypt.hash(Password, 10);

        const existingUser = await client.query(
            `SELECT ID_Usuario FROM Usuario WHERE Username_Correo = $1 AND Estado_Activo = false`,
            [Username_Correo],
        );

        let idUsuario;
        if (existingUser.rows.length > 0) {
            idUsuario = existingUser.rows[0].id_usuario;
            await client.query(
                `UPDATE Usuario SET Password_Hash = $1, Estado_Activo = true WHERE ID_Usuario = $2`,
                [hashedPassword, idUsuario],
            );
        } else {
            const userResult = await client.query(
                `INSERT INTO Usuario (ID_Rol, Username_Correo, Password_Hash, Estado_Activo)
           VALUES ((SELECT ID_Rol FROM Rol WHERE Nombre_Rol = 'Médico'), $1, $2, true)
           RETURNING ID_Usuario`, [Username_Correo, hashedPassword],
            );
            idUsuario = userResult.rows[0].id_usuario;
        }

        const medicoResult = await client.query(
            `INSERT INTO Medico (ID_Usuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`, [idUsuario, ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura],
        );

        await client.query('COMMIT');

        res.status(201).json(normalizeRow(medicoResult.rows[0]));
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al crear médico:', error);
        res.status(500).json({ message: 'Error al crear médico. Verifica que el usuario o colegiatura no estén duplicados.' });
    } finally {
        client.release();
    }
});

router.put('/:id', authenticateToken, async(req, res) => {
    try {
        const { id } = req.params;
        const { ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura } = req.body;

        const result = await pool.query(
            `UPDATE Medico SET ID_Especialidad = $1, Nombres = $2, Apellidos = $3, Numero_Colegiatura = $4
       WHERE ID_Medico = $5 RETURNING *`, [ID_Especialidad, Nombres, Apellidos, Numero_Colegiatura, id],
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Médico no encontrado' });
        }
        res.json(normalizeRow(result.rows[0]));
    } catch (error) {
        console.error('Error al actualizar médico:', error);
        res.status(500).json({ message: 'Error al actualizar médico' });
    }
});

router.delete('/:id', authenticateToken, async(req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;

        const medico = await client.query('SELECT ID_Usuario FROM Medico WHERE ID_Medico = $1', [id]);
        if (medico.rows.length === 0) {
            return res.status(404).json({ message: 'Médico no encontrado' });
        }

        await client.query('BEGIN');
        await client.query('DELETE FROM Medico WHERE ID_Medico = $1', [id]);
        await client.query('UPDATE Usuario SET Estado_Activo = false WHERE ID_Usuario = $1', [
            medico.rows[0].id_usuario,
        ]);
        await client.query('COMMIT');

        res.json({ message: 'Médico eliminado exitosamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al eliminar médico:', error);
        res.status(500).json({ message: 'Error al eliminar médico' });
    } finally {
        client.release();
    }
});

module.exports = router;