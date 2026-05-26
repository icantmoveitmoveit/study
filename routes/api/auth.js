const express = require('express');
const router = express.Router();
const session = require('../../session');

router.post('/login', async (req, res) => {
    const { login, password } = req.body;
    if (!login || !password) {
        return res.json({ msg: 'Введите логин и пароль' });
    }
    const cookie = await session.login(req, login, password);
    if (cookie) {
        res.cookie('app_user', cookie, { maxAge: 43200 * 1000, httpOnly: true, path: '/' });
        res.json({ msg: '' });
    } else {
        res.json({ msg: 'Неверный логин/пароль' });
    }
});

router.post('/logout', (req, res) => {
    const sess = session.auth(req);
    if (sess) {
        res.clearCookie('app_user', { path: '/' });
        session.logout(sess.user.login);
    }
    res.json({ msg: '' });
});

module.exports = router;