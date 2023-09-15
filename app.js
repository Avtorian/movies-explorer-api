require('dotenv').config();
const cors = require('cors');

const { NODE_ENV, MONGO_DB_ADDRESS } = process.env;
const { errors } = require('celebrate');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users');
const moviesRouter = require('./routes/movies');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');
const NotFoundErr = require('./errors/NotFoundErr');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const { loginValidation, registerValidation } = require('./middlewares/dataValidator');

const { PORT = 3000 } = process.env;
const mongoAdress = NODE_ENV === 'production' ? MONGO_DB_ADDRESS : 'mongodb://127.0.0.1:27017/bitfilmsdb';
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(mongoAdress);
app.use(cors({ origin: 'https://avtorian.nomoreparties.co' }));

app.use(requestLogger);

app.post('/signin', loginValidation, login);

app.post('/signup', registerValidation, createUser);

app.use(auth);
app.use('/movies', moviesRouter);
app.use('/users', usersRouter);

app.use('*', (req, res, next) => {
  next(new NotFoundErr('Данная страница не найдена !'));
});
app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      // проверяем статус и выставляем сообщение в зависимости от него
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });
  next();
});

app.listen(PORT);
