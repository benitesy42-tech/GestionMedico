module.exports = (req, res) => {
  res.json({ status: 'ok', method: req.method, path: req.url });
};
