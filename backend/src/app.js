const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const authRoutes = require('./routes/auth');
const medicosRoutes = require('./routes/medicos');
const pacientesRoutes = require('./routes/pacientes');
const especialidadesRoutes = require('./routes/especialidades');
const citasRoutes = require('./routes/citas');
const consultasRoutes = require('./routes/consultas');
const pagosRoutes = require('./routes/pagos');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SGCM API funcionando' });
});

app.use('/api/auth', authRoutes);
app.use('/api/medicos', medicosRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/consultas', consultasRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Servir archivos estáticos del frontend (en producción con Vercel)
const distPath = path.join(__dirname, '..', '..', 'dist', 'ProyectoGestionMedico', 'browser');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback: cualquier ruta que no sea API sirve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

module.exports = app;
