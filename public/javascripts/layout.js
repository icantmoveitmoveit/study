$(document).ready(function() {
    // Показать окно входа
    $('#Login').click(function(e) {
        e.preventDefault();
        $('#login_popup').show();
    });
    // Закрыть окно
    $('#login_popup_close').click(function() {
        $('#login_popup').hide();
    });
    // Отправить логин/пароль
    $('#submit_login').click(function() {
        const login = $('#inpLogin').val();
        const pass = $('#inpPassword').val();
        $.ajax({
            type: 'POST',
            url: '/api/auth/login',
            data: { login: login, password: pass },
            dataType: 'json',
            success: function(data) {
                if (data.msg === '') {
                    location.reload();
                } else {
                    alert(data.msg);
                }
            },
            error: function() {
                alert('Ошибка соединения с сервером');
            }
        });
    });
    // Выход
    $('#Logout').click(function(e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: '/api/auth/logout',
            success: function() {
                location.reload();
            }
        });
    });
});