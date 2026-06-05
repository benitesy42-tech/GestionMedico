const pool = require('../db');

async function emitirNotificacionSistema(io, usuario1Id, usuario2Id, contenido, toastSoloUsuarioId = null) {
  try {
    const id1 = Math.min(usuario1Id, usuario2Id);
    const id2 = Math.max(usuario1Id, usuario2Id);

    let result = await pool.query(
      'SELECT ID_Conversacion FROM Conversacion WHERE ID_Usuario_1 = $1 AND ID_Usuario_2 = $2',
      [id1, id2],
    );

    let conversacionId;
    if (result.rows.length > 0) {
      conversacionId = result.rows[0].id_conversacion;
    } else {
      result = await pool.query(
        'INSERT INTO Conversacion (ID_Usuario_1, ID_Usuario_2) VALUES ($1, $2) RETURNING ID_Conversacion',
        [id1, id2],
      );
      conversacionId = result.rows[0].id_conversacion;

      for (const uid of [id1, id2]) {
        io.to(`user_${uid}`).emit('conversacion:nueva', { id: conversacionId });
      }
    }

    const msg = await pool.query(
      `INSERT INTO Mensaje (ID_Conversacion, Remitente_ID, Contenido, Tipo)
       VALUES ($1, NULL, $2, 'sistema') RETURNING *`,
      [conversacionId, contenido],
    );

    const payload = {
      id: msg.rows[0].id_mensaje,
      conversacion_id: msg.rows[0].id_conversacion,
      remitente_id: null,
      contenido: msg.rows[0].contenido,
      tipo: 'sistema',
      leido: false,
      creado_en: msg.rows[0].creado_en,
      para_usuario_id: toastSoloUsuarioId,
    };

    // Emit to conversation room (for real-time chat history)
    io.to(`conv_${conversacionId}`).emit('mensaje:nuevo', payload);
    // Emit to both users' personal rooms (for unread badge + conditional toast)
    io.to(`user_${id1}`).emit('mensaje:nuevo', payload);
    io.to(`user_${id2}`).emit('mensaje:nuevo', payload);

    console.log(`[ChatNotify] Notificación enviada: conv=${conversacionId}, users=${id1},${id2}, contenido="${contenido.substring(0, 50)}", toastPara=${toastSoloUsuarioId}`);
  } catch (err) {
    console.error('Error al emitir notificación del sistema:', err);
  }
}

module.exports = { emitirNotificacionSistema };
