const express = require('express');
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [medicos, pacientes, especialidades, citasHoy, citasPendientes, citasAtendidas, ingresosHoy] =
      await Promise.all([
        pool.query('SELECT COUNT(*) FROM Medico'),
        pool.query('SELECT COUNT(*) FROM Paciente'),
        pool.query('SELECT COUNT(*) FROM Especialidad'),
        pool.query("SELECT COUNT(*) FROM Cita WHERE DATE(Fecha_Hora) = CURRENT_DATE"),
        pool.query("SELECT COUNT(*) FROM Cita WHERE DATE(Fecha_Hora) = CURRENT_DATE AND Estado = 'Pendiente'"),
        pool.query("SELECT COUNT(*) FROM Cita WHERE DATE(Fecha_Hora) = CURRENT_DATE AND Estado = 'Atendida'"),
        pool.query(
          `SELECT COALESCE(SUM(p.Monto), 0) as total FROM Pago p
           JOIN Consulta_Medica cm ON p.ID_Consulta = cm.ID_Consulta
           WHERE DATE(p.Fecha_Pago) = CURRENT_DATE AND p.Estado_Pago = 'Completado'`,
        ),
      ]);

    res.json({
      medicos: parseInt(medicos.rows[0].count),
      pacientes: parseInt(pacientes.rows[0].count),
      especialidades: parseInt(especialidades.rows[0].count),
      citasHoy: parseInt(citasHoy.rows[0].count),
      citasPendientes: parseInt(citasPendientes.rows[0].count),
      citasAtendidas: parseInt(citasAtendidas.rows[0].count),
      ingresosHoy: parseFloat(ingresosHoy.rows[0].total),
    });
  } catch (error) {
    console.error('Error al obtener stats:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
