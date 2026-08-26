/*
 * statements.html
 * O formulário data-form-event="statements:generate" fornece start_date,
 * end_date, transaction_type e category. Ao conectar sua API, renderize a
 * resposta na seção Resultado sem inserir dados de exemplo no front-end.
 */
'use strict';

document.addEventListener('walletflow:form-submit', event => {
    if (event.detail.name !== 'statements:generate') return;
    document.dispatchEvent(new CustomEvent('walletflow:statements-requested', {
        detail: event.detail
    }));
});
