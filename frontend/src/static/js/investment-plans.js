/*
 * investment-plans.html
 * O formulário de modal possui data-form-event="investment-plans:create".
 * O objeto detail.values contém name, target_amount, contribution_amount,
 * start_date e notes; envie-o para a rota de planos que preferir.
 */
'use strict';

document.addEventListener('walletflow:form-submit', event => {
    if (event.detail.name !== 'investment-plans:create') return;
    document.dispatchEvent(new CustomEvent('walletflow:investment-plan:ready', {
        detail: event.detail
    }));
});
