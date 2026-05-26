const request = require('supertest');
const app = require('./app');

describe('API Endpoints Tests', () => {
    let agent;

    beforeAll(() => {
        agent = request.agent(app);
    });

    // 1. Тест публичного маршрута (главная страница)
    test('GET / should return 200', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Главная страница');
    });

    // 2. Неудачный логин
    test('POST /api/auth/login with wrong credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ login: 'wrong', password: 'wrong' });
        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toBe('Неверный логин/пароль');
    });

    // 3. Успешный логин администратора
    test('POST /api/auth/login with admin credentials', async () => {
        const res = await agent
            .post('/api/auth/login')
            .send({ login: 'admin', password: 'test' });
        expect(res.statusCode).toBe(200);
        expect(res.body.msg).toBe('');
        // cookie должна установиться автоматически через agent
    });

    // 4. Доступ к /users (только для администратора)
    test('GET /users should return 200 for admin', async () => {
        const res = await agent.get('/users');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Пользователи');
    });

    // 5. Доступ к /clients (для любой авторизованной роли)
    test('GET /clients should return 200', async () => {
        const res = await agent.get('/clients');
        expect(res.statusCode).toBe(200);
        expect(res.text).toContain('Клиенты');
    });

    // 6. Выход из системы
    test('POST /api/auth/logout should clear session', async () => {
        const res = await agent.post('/api/auth/logout');
        expect(res.statusCode).toBe(200);
    });

    // 7. После выхода доступ к /users должен быть запрещён (401 или 403)
    test('GET /users after logout should return 403 (unauthorized)', async () => {
        const res = await request(app).get('/users');
        expect(res.statusCode).toBe(403);
    });

    // 8. API /api/users (JSON) – должен вернуть список пользователей (только для админа)
    test('GET /api/users should return JSON with users', async () => {
        // Сначала залогинимся снова через agent
        await agent.post('/api/auth/login').send({ login: 'admin', password: 'test' });
        const res = await agent.get('/api/users');
        expect(res.statusCode).toBe(200);
        expect(res.type).toMatch(/json/);
        expect(res.body).toHaveProperty('users');
        expect(Array.isArray(res.body.users)).toBe(true);
        expect(res.body.users.length).toBeGreaterThan(0);
        expect(res.body.users[0]).toHaveProperty('login');
        expect(res.body.users[0]).toHaveProperty('role_label');
    });

    // 9. Проверка, что employee не может получить /users
    test('GET /users with employee role should be forbidden', async () => {
        // Создаём новый агент для сотрудника
        const employeeAgent = request.agent(app);
        await employeeAgent.post('/api/auth/login').send({ login: 'employee', password: 'test' });
        const res = await employeeAgent.get('/users');
        expect(res.statusCode).toBe(403);
    });

    // 10. Проверка наличия тестового клиента в таблице clients
    test('GET /clients should contain "Тестовый клиент"', async () => {
        const adminAgent = request.agent(app);
        await adminAgent.post('/api/auth/login').send({ login: 'admin', password: 'test' });
        const res = await adminAgent.get('/clients');
        expect(res.text).toContain('Тестовый клиент');
    });
});