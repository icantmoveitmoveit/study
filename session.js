const md5 = require('md5');
const crypto = require('crypto');

exports.sessions = {};

exports.login = async function(req, login, pass) {
    try {
        // Ищем пользователя по логину
        const user = await req.db.oneOrNone('SELECT * FROM users WHERE login = $1', login);
        if (user && user.pass === md5(pass)) {
            const secret = 'my_secret_key_for_lab2';
            const hash = crypto.createHmac('sha256', secret).update(login).digest('hex');
            const cookie = login + '--' + hash;
            // Сохраняем сессию
            exports.sessions[login] = {
                active: 1,
                timestamp: Date.now(),
                user: user
            };
            return cookie;
        }
        return null;
    } catch (err) {
        console.error('Login error:', err);
        return null;
    }
};

exports.auth = function(req) {
    const cookie = req.cookies['app_user'];
    if (!cookie) return null;
    const parts = cookie.split('--');
    if (parts.length !== 2) return null;
    const login = parts[0];
    const session = exports.sessions[login];
    if (!session || !session.active) return null;
    const now = Date.now();
    if ((now - session.timestamp) > 43200 * 1000) { // 12 часов
        delete exports.sessions[login];
        return null;
    }
    // обновляем время активности
    session.timestamp = now;
    return session;
};

exports.logout = function(login) {
    if (exports.sessions[login]) {
        delete exports.sessions[login];
    }
};