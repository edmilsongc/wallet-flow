/*
 * accounts-payable.html
 * Formulário: form[data-form-event="accounts-payable:create"].
 * Campos para a API: description, supplier, category, amount, due_date,
 * payment_method e notes. O evento abaixo não chama fetch; ele separa a
 * responsabilidade de envio para a integração que você irá criar.
 */
'use strict';

document.addEventListener('walletflow:form-submit', event => {
    if (event.detail.name !== 'accounts-payable:create') return;
    document.dispatchEvent(new CustomEvent('walletflow:accounts-payable:ready', {
        detail: event.detail
    }));
});
