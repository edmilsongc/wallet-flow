/*
 * login.html
 * form[data-form-event="auth:login"] envia email e password no evento global.
 * Escute walletflow:login-ready e implemente a sua chamada de autenticação.
 */
'use strict';

document.addEventListener('walletflow:form-submit', event => {
    if (event.detail.name !== 'auth:login') return;
    document.dispatchEvent(new CustomEvent('walletflow:login-ready', { detail: event.detail }));
});
