/*
 * accounts-receivable.html
 * Formulário: form[data-form-event="accounts-receivable:create"].
 * Campos enviados no evento: description, category, amount, due_date, status,
 * frequency e notes. Ouça walletflow:accounts-receivable:ready na sua rota
 * JavaScript e então envie event.detail.values ao backend.
 */
'use strict';

document.addEventListener('walletflow:form-submit', event => {
    if (event.detail.name !== 'accounts-receivable:create') return;
    document.dispatchEvent(new CustomEvent('walletflow:accounts-receivable:ready', {
        detail: event.detail
    }));
});
