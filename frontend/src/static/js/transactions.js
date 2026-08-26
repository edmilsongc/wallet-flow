/*
 * transactions.html
 * O formulário data-form-event="transactions:filter" entrega query e type.
 * Escute walletflow:transactions-filter para chamar sua rota e preencher a
 * tabela de histórico posteriormente.
 */
'use strict';

document.addEventListener('walletflow:form-submit', event => {
    if (event.detail.name !== 'transactions:filter') return;
    document.dispatchEvent(new CustomEvent('walletflow:transactions-filter', {
        detail: event.detail
    }));
});
