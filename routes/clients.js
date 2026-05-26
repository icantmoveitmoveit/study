const express = require('express');
const router = express.Router();
const session = require('../session');

// Проверка доступа: только авторизованные пользователи (любая роль)
router.get('/', async (req, res, next) => {
    const sess = session.auth(req);
    if (!sess) {
        return res.status(401).send('Не авторизован');
    }
    try {
        const clients = await req.db.any('SELECT * FROM clients ORDER BY id');
        res.render('clients/list', { title: 'Клиенты', clients: clients });
    } catch (err) {
        next(err);
    }
});

module.exports = router;