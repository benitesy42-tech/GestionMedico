const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { normalizeRow, normalizeRows } = require('../utils/normalize-rows');
const { emitirNotificacionSistema } = require('../utils/chat-notify');

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

        const citaCreada = result.rows[0];

        const io = req.app.get('io');
        if (io) {
            (async () => {
                try {
                    const paci = await pool.query('SELECT Nombres, Apellidos FROM Paciente WHERE ID_Paciente = $1', [ID_Paciente]);
                    const paciNombre = paci.rows.length > 0 ? `${paci.rows[0].nombres} ${paci.rows[0].apellidos}` : 'Paciente';

                    const medi = await pool.query('SELECT ID_Usuario FROM Medico WHERE ID_Medico = $1', [ID_Medico]);
                    const medUserId = medi.rows[0]?.id_usuario;

                    const recep = await pool.query(
                        `SELECT u.ID_Usuario FROM Usuario u JOIN Rol r ON u.ID_Rol = r.ID_Rol WHERE r.Nombre_Rol = 'Recepcionista' LIMIT 1`,
                    );
                    const recepUserId = recep.rows[0]?.id_usuario;

                    if (medUserId && recepUserId) {
                        const fechaFormateada = new Date(Fecha_Hora).toLocaleString('es-MX', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                        });
                        await emitirNotificacionSistema(
                            io, recepUserId, medUserId,
                            `Nueva cita agendada: ${paciNombre} — ${fechaFormateada}`,
                            medUserId,
                        );
                    }
                } catch (e) {
                    console.error('Error en notificación de cita:', e);
                }
            })();
        }

        res.status(201).json({
            ...normalizeRow(citaCreada),
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

        const io = req.app.get('io');
        if (io && (Estado === 'Cancelada' || Estado === 'Reprogramada')) {
            (async () => {
                try {
                    const cita = result.rows[0];
                    const paci = await pool.query('SELECT Nombres, Apellidos FROM Paciente WHERE ID_Paciente = $1', [cita.id_paciente]);
                    const paciNombre = paci.rows.length > 0 ? `${paci.rows[0].nombres} ${paci.rows[0].apellidos}` : 'Paciente';

                    const medi = await pool.query('SELECT ID_Usuario FROM Medico WHERE ID_Medico = $1', [cita.id_medico]);
                    const medUserId = medi.rows[0]?.id_usuario;

                    const recep = await pool.query(
                        `SELECT u.ID_Usuario FROM Usuario u JOIN Rol r ON u.ID_Rol = r.ID_Rol WHERE r.Nombre_Rol = 'Recepcionista' LIMIT 1`,
                    );
                    const recepUserId = recep.rows[0]?.id_usuario;

                    if (medUserId && recepUserId) {
                        const fechaFormateada = new Date(cita.fecha_hora).toLocaleString('es-MX', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                        });
                        const accion = Estado === 'Cancelada' ? 'cancelada' : 'reprogramada';
                        await emitirNotificacionSistema(
                            io, recepUserId, medUserId,
                            `Cita ${accion}: ${paciNombre} — ${fechaFormateada}`,
                            medUserId,
                        );
                    }
                } catch (e) {
                    console.error('Error en notificación de cita:', e);
                }
            })();
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

        const io = req.app.get('io');
        if (io) {
            (async () => {
                try {
                    const cita = result.rows[0];
                    const paci = await pool.query('SELECT Nombres, Apellidos FROM Paciente WHERE ID_Paciente = $1', [cita.id_paciente]);
                    const paciNombre = paci.rows.length > 0 ? `${paci.rows[0].nombres} ${paci.rows[0].apellidos}` : 'Paciente';
                    const medi = await pool.query('SELECT ID_Usuario FROM Medico WHERE ID_Medico = $1', [cita.id_medico]);
                    const medUserId = medi.rows[0]?.id_usuario;
                    const recep = await pool.query(
                        `SELECT u.ID_Usuario FROM Usuario u JOIN Rol r ON u.ID_Rol = r.ID_Rol WHERE r.Nombre_Rol = 'Recepcionista' LIMIT 1`,
                    );
                    const recepUserId = recep.rows[0]?.id_usuario;
                    if (medUserId && recepUserId) {
                        const fechaFormateada = new Date(cita.fecha_hora).toLocaleString('es-MX', {
                            day: '2-digit', month: '2-digit', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                        });
                        await emitirNotificacionSistema(io, recepUserId, medUserId, `Cita cancelada: ${paciNombre} — ${fechaFormateada}`, medUserId);
                    }
                } catch (e) { console.error('Error en notificación:', e); }
            })();
        }

        res.json({ message: 'Cita cancelada exitosamente' });
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        res.status(500).json({ message: 'Error al cancelar cita' });
    }
});

module.exports = router;