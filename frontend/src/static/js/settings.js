/*
 * settings.html
 * Formulários: settings:profile, settings:preferences e settings:export-dashboard.
 * A exportação usa botões data-export-format e entrega format (xlsx/pdf) e os
 * campos start_date, end_date e scope em walletflow:export-dashboard.
 * Não há download nem chamada de rota nesta camada visual.
 */
'use strict';

document.addEventListener('walletflow:form-submit', event => {
    if (!event.detail.name.startsWith('settings:')) return;
    document.dispatchEvent(new CustomEvent('walletflow:settings-form-ready', {
        detail: event.detail
    }));
});

document.addEventListener('walletflow:export-dashboard', event => {
    document.dispatchEvent(new CustomEvent('walletflow:settings-export-ready', {
        detail: event.detail
    }));
});
