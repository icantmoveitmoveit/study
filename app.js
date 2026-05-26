const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const pgp = require('pg-promise')();

// Подключение к БД
const db = pgp('postgres://postgres:mysecretpassword@localhost:5432/lab2_db');

const session = require('./session');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const clientsRouter = require('./routes/clients');

const apiRouter = require('./routes/api');
const authApi = require('./routes/api/auth');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware для передачи db в запросы
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Маршруты
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/clients', clientsRouter);
app.use('/api', apiRouter);
apiRouter.use('/auth', authApi);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;