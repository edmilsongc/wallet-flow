/*
 * register.html
 * form[data-form-event="auth:register"] fornece name, email, password e
 * password_confirmation. Escute walletflow:register-ready para sua rota.
 */
'use strict';

document.addEventListener('walletflow:form-submit', event => {
    if (event.detail.name !== 'auth:register') return;
    document.dispatchEvent(new CustomEvent('walletflow:register-ready', { detail: event.detail }));
});
