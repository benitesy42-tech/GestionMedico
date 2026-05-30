const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sgcm_jwt_secret_key_2026';

router.post('/login', async (req, res) => {
  try {
    const { Username_Correo, Password } = req.body;

    if (!Username_Correo || !Password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    const result = await pool.query(
      'SELECT u.*, r.Nombre_Rol FROM Usuario u JOIN Rol r ON u.ID_Rol = r.ID_Rol WHERE u.Username_Correo = $1 AND u.Estado_Activo = true',
      [Username_Correo],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const usuario = result.rows[0];
    const passwordMatch = await bcrypt.compare(Password, usuario.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: usuario.id_usuario,
        rol: usuario.nombre_rol,
        username: usuario.username_correo,
      },
      JWT_SECRET,
      { expiresIn: '10h' },
    );

    let nombreCompleto = '';

    if (usuario.nombre_rol === 'Médico' || usuario.nombre_rol === 'Medico') {
      const medico = await pool.query(
        'SELECT Nombres, Apellidos FROM Medico WHERE ID_Usuario = $1',
        [usuario.id_usuario],
      );
      if (medico.rows.length > 0) {
        nombreCompleto = `${medico.rows[0].nombres} ${medico.rows[0].apellidos}`;
      }
    } else if (usuario.nombre_rol === 'Paciente') {
      const paciente = await pool.query(
        'SELECT Nombres, Apellidos FROM Paciente WHERE ID_Usuario = $1',
        [usuario.id_usuario],
      );
      if (paciente.rows.length > 0) {
        nombreCompleto = `${paciente.rows[0].nombres} ${paciente.rows[0].apellidos}`;
      }
    }

    if (!nombreCompleto) {
      nombreCompleto = usuario.username_correo;
    }

    res.json({
      token,
      usuario: {
        ID_Usuario: usuario.id_usuario,
        ID_Rol: usuario.id_rol,
        Username_Correo: usuario.username_correo,
        Estado_Activo: usuario.estado_activo,
      },
      nombreCompleto,
      rol: usuario.nombre_rol,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
