const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { normalizeRow } = require('../utils/normalize-rows');

const router = express.Router();

// GET /api/chat/usuarios — lista de usuarios disponibles para chatear (sin pacientes)
router.get('/usuarios', authenticateToken, async (req, res) => {
  try {
    const currentId = req.user.id;
    const result = await pool.query(
      `SELECT u.ID_Usuario, u.Username_Correo, r.Nombre_Rol,
              COALESCE(m.Nombres, '') AS Nombres,
              COALESCE(m.Apellidos, '') AS Apellidos
       FROM Usuario u
       JOIN Rol r ON u.ID_Rol = r.ID_Rol
       LEFT JOIN Medico m ON u.ID_Usuario = m.ID_Usuario
       WHERE u.Estado_Activo = true AND u.ID_Usuario != $1
         AND r.Nombre_Rol IN ('Administrador', 'Recepcionista', 'Médico')
       ORDER BY r.Nombre_Rol, COALESCE(m.Apellidos, u.Username_Correo)`,
      [currentId],
    );

    const usuarios = result.rows.map((u) => {
      const nombre = `${u.nombres || ''} ${u.apellidos || ''}`.trim() || u.username_correo;
      return {
        id: u.id_usuario,
        nombre,
        rol: u.nombre_rol,
        inicial: (nombre || '?')[0].toUpperCase(),
      };
    });

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios chat:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// GET /api/chat/conversaciones — lista del usuario autenticado
router.get('/conversaciones', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT c.ID_Conversacion, c.ID_Usuario_1, c.ID_Usuario_2, c.Creado_En,
              CASE WHEN c.ID_Usuario_1 = $1 THEN c.ID_Usuario_2 ELSE c.ID_Usuario_1 END AS ID_Otro_Usuario,
              (SELECT Contenido FROM Mensaje WHERE ID_Conversacion = c.ID_Conversacion ORDER BY Creado_En DESC LIMIT 1) AS Ultimo_Mensaje,
              (SELECT Creado_En FROM Mensaje WHERE ID_Conversacion = c.ID_Conversacion ORDER BY Creado_En DESC LIMIT 1) AS Ultimo_Mensaje_Hora,
              (SELECT COUNT(*) FROM Mensaje WHERE ID_Conversacion = c.ID_Conversacion AND Remitente_ID != $1 AND Leido = false) AS No_Leidos,
              (SELECT COALESCE(NULLIF(m.Nombres || ' ' || m.Apellidos, ' '), u.Username_Correo)
               FROM Usuario u
               LEFT JOIN Medico m ON u.ID_Usuario = m.ID_Usuario
               WHERE u.ID_Usuario = CASE WHEN c.ID_Usuario_1 = $1 THEN c.ID_Usuario_2 ELSE c.ID_Usuario_1 END
              ) AS Otro_Nombre,
              (SELECT r.Nombre_Rol
               FROM Usuario u
               JOIN Rol r ON u.ID_Rol = r.ID_Rol
               WHERE u.ID_Usuario = CASE WHEN c.ID_Usuario_1 = $1 THEN c.ID_Usuario_2 ELSE c.ID_Usuario_1 END
              ) AS Otro_Rol
       FROM Conversacion c
       WHERE c.ID_Usuario_1 = $1 OR c.ID_Usuario_2 = $1
       ORDER BY "Ultimo_Mensaje_Hora" DESC NULLS LAST`,
      [userId],
    );

    const convs = result.rows.map((r) => {
      const nombre = r.otro_nombre || 'Usuario';
      return {
        id: r.id_conversacion,
        usuario_1_id: r.id_usuario_1,
        usuario_2_id: r.id_usuario_2,
        otro_usuario: {
          id: r.id_otro_usuario,
          nombre,
          rol: r.otro_rol || '',
          inicial: nombre[0].toUpperCase(),
        },
        ultimo_mensaje: r.ultimo_mensaje || '',
        ultimo_mensaje_hora: r.ultimo_mensaje_hora || null,
        no_leidos: Number(r.no_leidos) || 0,
      };
    });

    res.json(convs);
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    res.status(500).json({ message: 'Error al obtener conversaciones' });
  }
});

// POST /api/chat/conversaciones — crear nueva conversación
router.post('/conversaciones', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { usuario_id } = req.body;

    if (!usuario_id || usuario_id === userId) {
      return res.status(400).json({ message: 'ID de usuario inválido' });
    }

    const id1 = Math.min(userId, usuario_id);
    const id2 = Math.max(userId, usuario_id);

    let result = await pool.query(
      'SELECT * FROM Conversacion WHERE ID_Usuario_1 = $1 AND ID_Usuario_2 = $2',
      [id1, id2],
    );

    if (result.rows.length > 0) {
      return res.json(normalizeRow(result.rows[0]));
    }

    result = await pool.query(
      'INSERT INTO Conversacion (ID_Usuario_1, ID_Usuario_2) VALUES ($1, $2) RETURNING *',
      [id1, id2],
    );

    const conv = normalizeRow(result.rows[0]);
    const io = req.app.get('io');
    if (io) {
      for (const uid of [id1, id2]) {
        io.to(`user_${uid}`).emit('conversacion:nueva', conv);
      }
    }

    res.status(201).json(conv);
  } catch (error) {
    console.error('Error al crear conversación:', error);
    res.status(500).json({ message: 'Error al crear conversación' });
  }
});

// GET /api/chat/conversaciones/:id/mensajes — historial
router.get('/conversaciones/:id/mensajes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const convId = req.params.id;

    const check = await pool.query(
      'SELECT * FROM Conversacion WHERE ID_Conversacion = $1 AND (ID_Usuario_1 = $2 OR ID_Usuario_2 = $2)',
      [convId, userId],
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ message: 'Conversación no encontrada' });
    }

    const result = await pool.query(
      `SELECT m.*, u.Username_Correo,
              COALESCE(med.Nombres, '') AS Nombres,
              COALESCE(med.Apellidos, '') AS Apellidos
       FROM Mensaje m
       LEFT JOIN Usuario u ON m.Remitente_ID = u.ID_Usuario
       LEFT JOIN Medico med ON u.ID_Usuario = med.ID_Usuario
       WHERE m.ID_Conversacion = $1
       ORDER BY m.Creado_En ASC
       LIMIT 50`,
      [convId],
    );

    const mensajes = result.rows.map((m) => ({
      id: m.id_mensaje,
      conversacion_id: m.id_conversacion,
      remitente_id: m.remitente_id,
      contenido: m.contenido,
      tipo: m.tipo || 'texto',
      leido: m.leido,
      creado_en: m.creado_en,
      remitente_nombre: m.remitente_id
        ? `${m.nombres || ''} ${m.apellidos || ''}`.trim() || m.username_correo
        : null,
    }));

    res.json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ message: 'Error al obtener mensajes' });
  }
});

module.exports = router;
