const express = require('express');
const router = express.Router();
const session = require('../session');

router.get('/', async (req, res, next) => {
    const sess = session.auth(req);
    // Только администратор (id_role = 1)
    if (!sess || sess.user.id_role !== 1) {
        return res.status(403).send('Доступ запрещён');
    }
    try {
        const users = await req.db.any(`
            SELECT users.id, users.login, users.fio, roles.label AS role_name
            FROM users
            JOIN roles ON users.id_role = roles.id
            ORDER BY users.id
        `);
        res.render('users/list', { title: 'Пользователи', users: users });
    } catch (err) {
        next(err);
    }
});

module.exports = router;