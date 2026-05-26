const express = require('express');
const router = express.Router();
const session = require('../../session');

// GET /api/users – возвращает JSON со списком пользователей (только для админа)
router.get('/', async (req, res, next) => {
    const sess = session.auth(req);
    if (!sess || sess.user.id_role !== 1) {
        return res.status(403).json({ msg: 'Доступ запрещён' });
    }
    try {
        const users = await req.db.any(`
            SELECT 
                users.id,
                users.login,
                users.fio,
                roles.label AS role_label
            FROM users
            JOIN roles ON users.id_role = roles.id
            ORDER BY users.id
        `);
        res.json({ users });
    } catch (err) {
        next(err);
    }
});

module.exports = router;