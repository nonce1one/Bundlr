const express = require('express');

const PORT = process.env.PORT || 3001;

const app = express();

app.use('/bundlr', require('../routes/api/bundlr'));

app.get('*', (req, res) => {
  res.json({ message: 'hello from the server again!' });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
