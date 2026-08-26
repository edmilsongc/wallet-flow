/*
 * dashboard.html
 * IDs/data attributes para preencher com a API:
 * [data-dashboard="balance"], receivable, payable e result -> indicadores;
 * [data-dashboard-chart] -> contêineres de gráfico.
 * Este arquivo só informa a troca de período; não busca dados.
 */
'use strict';

document.addEventListener('walletflow:tab-change', event => {
    document.dispatchEvent(new CustomEvent('walletflow:dashboard-period-change', {
        detail: { period: event.detail.value }
    }));
});
