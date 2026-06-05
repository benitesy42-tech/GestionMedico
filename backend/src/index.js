const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const pool = require('./db');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Token requerido'));
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return next(new Error('Token inválido'));
    socket.userId = user.id;
    socket.userRole = user.rol;
    next();
  });
});

io.on('connection', (socket) => {
  const userId = socket.userId;
  socket.join(`user_${userId}`);

  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId).add(socket.id);

  if (onlineUsers.get(userId).size === 1) {
    io.emit('usuario:estado', { usuario_id: userId, en_linea: true });
  }

  socket.on('mensaje:enviar', async (data) => {
    try {
      const { conversacion_id, contenido } = data;
      if (!conversacion_id || !contenido?.trim()) return;

      const check = await pool.query(
        'SELECT * FROM Conversacion WHERE ID_Conversacion = $1 AND (ID_Usuario_1 = $2 OR ID_Usuario_2 = $2)',
        [conversacion_id, userId],
      );
      if (check.rows.length === 0) {
        socket.emit('error', { message: 'No tienes acceso a esta conversación' });
        return;
      }

      const result = await pool.query(
        `INSERT INTO Mensaje (ID_Conversacion, Remitente_ID, Contenido, Tipo)
         VALUES ($1, $2, $3, 'texto') RETURNING *`,
        [conversacion_id, userId, contenido.trim()],
      );

      const msg = result.rows[0];
      const payload = {
        id: msg.id_mensaje,
        conversacion_id: msg.id_conversacion,
        remitente_id: msg.remitente_id,
        contenido: msg.contenido,
        tipo: msg.tipo || 'texto',
        leido: msg.leido,
        creado_en: msg.creado_en,
      };

      io.to(`conv_${conversacion_id}`).emit('mensaje:nuevo', payload);
    } catch (err) {
      console.error('Error al enviar mensaje:', err);
      socket.emit('error', { message: 'Error al enviar mensaje' });
    }
  });

  socket.on('conversacion:abrir', async (data) => {
    try {
      const { conversacion_id } = data;
      if (!conversacion_id) return;

      socket.join(`conv_${conversacion_id}`);

      await pool.query(
        `UPDATE Mensaje SET Leido = true
         WHERE ID_Conversacion = $1 AND Remitente_ID != $2 AND Leido = false`,
        [conversacion_id, userId],
      );

      io.to(`conv_${conversacion_id}`).emit('mensaje:leido', {
        conversacion_id,
        leido_por: userId,
      });
    } catch (err) {
      console.error('Error al abrir conversación:', err);
    }
  });

  socket.on('conversacion:salir', (data) => {
    if (data?.conversacion_id) {
      socket.leave(`conv_${data.conversacion_id}`);
    }
  });

  socket.on('disconnect', () => {
    if (onlineUsers.has(userId)) {
      onlineUsers.get(userId).delete(socket.id);
      if (onlineUsers.get(userId).size === 0) {
        onlineUsers.delete(userId);
        io.emit('usuario:estado', { usuario_id: userId, en_linea: false });
      }
    }
  });
});

app.set('io', io);

server.listen(PORT, () => {
  console.log(`SGCM API corriendo en http://localhost:${PORT}`);
});
