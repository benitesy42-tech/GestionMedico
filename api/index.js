let app;
try {
  app = require('../backend/src/app');
} catch (err) {
  console.error('Error al cargar la app:', err);
  app = (req, res) => {
    res.status(500).json({ error: err.message, stack: err.stack });
  };
}

module.exports = app;
