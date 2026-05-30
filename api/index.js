const app = require('../backend/src/app');

module.exports = async (req, res) => {
  try {
    await app(req, res);
  } catch (err) {
    console.error('Vercel API Error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};
