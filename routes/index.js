const express = require('express');
const router = express.Router();
const session = require('../session');

router.get('/', (req, res) => {
    const sess = session.auth(req);
    const user = sess ? sess.user : null;
    let can_view_users = false;
    let can_view_clients = false;

    if (user) {
        if (user.id_role === 1) { // admin
            can_view_users = true;
            can_view_clients = true;
        } else if (user.id_role === 2) { // manager
            can_view_clients = true;
        } else if (user.id_role === 3) { // employee
            can_view_clients = true;
        }
    }

    res.render('index', {
        title: 'Главная страница',
        user: user,
        can_view_users: can_view_users,
        can_view_clients: can_view_clients
    });
});

module.exports = router;