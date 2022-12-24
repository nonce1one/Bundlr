const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'hello!' });
});

app.use('/mint', require('./routes/mintRoute'));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
