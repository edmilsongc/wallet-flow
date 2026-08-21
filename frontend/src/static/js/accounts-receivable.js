/* ===================================================
   contas-receber.js  —  Rende Mais
   Back-end: Flask  |  Endpoints esperados:
     GET    /api/contas-receber          → lista todas
     POST   /api/contas-receber          → cria nova
     PUT    /api/contas-receber/<id>     → edita
     DELETE /api/contas-receber/<id>     → remove
     PATCH  /api/contas-receber/<id>/receber → marca como recebida
   =================================================== */

'use strict';

/* ---------- CONSTANTES ---------- */
const API_BASE = '/api/contas-receber';
const PER_PAGE = 8;
const CHART_CORES = ['#3b82f6', '#059669', '#d97706', '#a855f7', '#ec4899', '#14b8a6'];

const CATEGORIA_ICON = {
    'Salário': { bg: '#dcfce7', color: '#059669', emoji: '🏢' },
    'Freelance': { bg: '#f3e8ff', color: '#a855f7', emoji: '💼' },
    'Aluguel Recebido': { bg: '#dbeafe', color: '#2563eb', emoji: '🏠' },
    'Dividendos': { bg: '#fef3c7', color: '#d97706', emoji: '📈' },
    'Vendas': { bg: '#fce7f3', color: '#db2777', emoji: '🛍️' },
    'Reembolso': { bg: '#d1fae5', color: '#059669', emoji: '↩️' },
    'Outros': { bg: '#f1f5f9', color: '#64748b', emoji: '📄' },
};

/* ---------- ESTADO ---------- */
let contas = [];          // dados brutos
let filtrados = [];          // após filtros
let paginaAtual = 1;
let filtroStatus = 'todos';
let filtroMes = '';
let filtroTexto = '';
let editandoId = null;
let barChart = null;
let donutChart = null;
let periodoChart = 6;

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    setarData();
    carregarContas();
    bindEventos();
});

/* ---------- DATA NO TOPBAR ---------- */
function setarData() {
    const el = document.getElementById('topbar-date');
    if (!el) return;
    const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    el.textContent = new Date().toLocaleDateString('pt-BR', opts)
        .replace(/^\w/, c => c.toUpperCase());
}

/* ============================================================
   API — CRUD
   ============================================================ */

async function carregarContas() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        contas = await res.json();
    } catch (e) {
        console.warn('Falha ao buscar API, usando dados de exemplo.', e);
        contas = dadosExemplo();
    }
    renderizarTudo();
}

async function criarConta(payload) {
    try {
        const res = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const nova = await res.json();
        contas.unshift(nova);
    } catch (e) {
        // fallback local
        payload.id = gerarId();
        contas.unshift(payload);
    }
    renderizarTudo();
    toast('Conta adicionada com sucesso!', 'success');
}

async function editarConta(id, payload) {
    try {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const atualizada = await res.json();
        contas = contas.map(c => c.id === id ? atualizada : c);
    } catch (e) {
        contas = contas.map(c => c.id === id ? { ...c, ...payload } : c);
    }
    renderizarTudo();
    toast('Conta atualizada!', 'success');
}

async function excluirConta(id) {
    if (!confirm('Confirmar exclusão desta conta?')) return;
    try {
        await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    } catch (e) { /* offline */ }
    contas = contas.filter(c => c.id !== id);
    renderizarTudo();
    toast('Conta excluída.', 'warning');
}

async function marcarRecebida(id) {
    try {
        const res = await fetch(`${API_BASE}/${id}/receber`, { method: 'PATCH' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const atualizada = await res.json();
        contas = contas.map(c => c.id === id ? atualizada : c);
    } catch (e) {
        contas = contas.map(c => c.id === id ? { ...c, status: 'recebido' } : c);
    }
    renderizarTudo();
    toast('Marcada como recebida!', 'success');
}

/* ============================================================
   RENDERIZAÇÃO PRINCIPAL
   ============================================================ */
function renderizarTudo() {
    aplicarFiltros();
    atualizarMetrics();
    renderizarTabela();
    renderizarPaginacao();
    renderizarBarChart();
    renderizarDonutChart();
}

/* ---------- FILTROS ---------- */
function aplicarFiltros() {
    filtrados = contas.filter(c => {
        const matchStatus = filtroStatus === 'todos' || c.status === filtroStatus;
        const matchMes = !filtroMes || (c.vencimento && c.vencimento.slice(5, 7) === filtroMes);
        const matchTexto = !filtroTexto ||
            c.descricao.toLowerCase().includes(filtroTexto.toLowerCase()) ||
            c.categoria.toLowerCase().includes(filtroTexto.toLowerCase());
        return matchStatus && matchMes && matchTexto;
    });

    // ordenar: atrasados primeiro, depois por vencimento
    filtrados.sort((a, b) => {
        const prioridade = { atrasado: 0, pendente: 1, recebido: 2 };
        if (prioridade[a.status] !== prioridade[b.status])
            return prioridade[a.status] - prioridade[b.status];
        return new Date(a.vencimento) - new Date(b.vencimento);
    });

    paginaAtual = 1;
}

/* ---------- MÉTRICAS ---------- */
function atualizarMetrics() {
    const hoje = new Date();
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');

    const total = contas.reduce((s, c) => s + parseFloat(c.valor || 0), 0);
    const recebidas = contas.filter(c => c.status === 'recebido' && c.vencimento?.slice(5, 7) === mesAtual);
    const pendentes = contas.filter(c => c.status === 'pendente');
    const atrasadas = contas.filter(c => c.status === 'atrasado');

    const somaRecebido = recebidas.reduce((s, c) => s + parseFloat(c.valor || 0), 0);
    const somaPendente = pendentes.reduce((s, c) => s + parseFloat(c.valor || 0), 0);
    const somaAtrasado = atrasadas.reduce((s, c) => s + parseFloat(c.valor || 0), 0);

    setText('metric-total', formatBRL(total));
    setText('metric-recebido', formatBRL(somaRecebido));
    setText('metric-pendente', formatBRL(somaPendente));
    setText('metric-atraso', formatBRL(somaAtrasado));

    setText('metric-total-badge', `${contas.length} conta${contas.length !== 1 ? 's' : ''}`);
    setText('metric-recebido-badge', `${recebidas.length} recebida${recebidas.length !== 1 ? 's' : ''}`);
    setText('metric-pendente-badge', `${pendentes.length} pendente${pendentes.length !== 1 ? 's' : ''}`);
    setText('metric-atraso-badge', `${atrasadas.length} em atraso`);
}

/* ---------- TABELA ---------- */
function renderizarTabela() {
    const tbody = document.getElementById('contas-tbody');
    const empty = document.getElementById('empty-state');
    const countEl = document.getElementById('table-count');
    const subEl = document.getElementById('table-sub');

    const inicio = (paginaAtual - 1) * PER_PAGE;
    const pagina = filtrados.slice(inicio, inicio + PER_PAGE);

    countEl.textContent = `${filtrados.length} registro${filtrados.length !== 1 ? 's' : ''}`;
    subEl.textContent = filtroStatus === 'todos'
        ? 'Todas as contas a receber'
        : `Contas com status: ${filtroStatus}`;

    if (filtrados.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = pagina.map(c => {
        const icon = CATEGORIA_ICON[c.categoria] || CATEGORIA_ICON['Outros'];
        const venc = formatarDataBR(c.vencimento);
        const atras = c.status === 'atrasado';
        const pend = c.status === 'pendente';

        return `
        <tr data-id="${c.id}">
            <td>
                <div style="display:flex;align-items:center">
                    <div class="tx-icon" style="background:${icon.bg};color:${icon.color}">${icon.emoji}</div>
                    <div>
                        <div class="tx-name">${escHtml(c.descricao)}</div>
                        <div class="tx-date">${escHtml(c.categoria)}${c.recorrencia && c.recorrencia !== 'nenhuma' ? ' · ' + ucfirst(c.recorrencia) : ''}</div>
                    </div>
                </div>
            </td>
            <td><span style="font-size:12px;color:var(--muted)">${escHtml(c.categoria)}</span></td>
            <td>
                <span style="font-size:13px;font-weight:600;color:${atras ? '#dc2626' : 'var(--text)'}">
                    ${venc}
                    ${atras ? '<i class="fa-solid fa-circle-exclamation" style="font-size:11px;margin-left:4px;color:#dc2626" title="Vencida"></i>' : ''}
                </span>
            </td>
            <td><span class="status-badge ${c.status}">${ucfirst(c.status)}</span></td>
            <td><span class="tx-amount">+ ${formatBRL(c.valor)}</span></td>
            <td>
                <div class="actions-cell">
                    ${pend || atras ? `<button class="action-btn success" title="Marcar recebida" onclick="marcarRecebida('${c.id}')"><i class="fa-solid fa-check"></i></button>` : ''}
                    <button class="action-btn" title="Editar" onclick="abrirModalEditar('${c.id}')"><i class="fa-solid fa-pen"></i></button>
                    <button class="action-btn danger" title="Excluir" onclick="excluirConta('${c.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

/* ---------- PAGINAÇÃO ---------- */
function renderizarPaginacao() {
    const el = document.getElementById('pagination');
    const total = Math.ceil(filtrados.length / PER_PAGE);
    if (total <= 1) { el.innerHTML = ''; return; }

    let html = `<button class="page-btn" ${paginaAtual === 1 ? 'disabled' : ''} onclick="mudarPagina(${paginaAtual - 1})"><i class="fa-solid fa-chevron-left" style="font-size:10px"></i></button>`;
    for (let i = 1; i <= total; i++) {
        html += `<button class="page-btn ${i === paginaAtual ? 'active' : ''}" onclick="mudarPagina(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" ${paginaAtual === total ? 'disabled' : ''} onclick="mudarPagina(${paginaAtual + 1})"><i class="fa-solid fa-chevron-right" style="font-size:10px"></i></button>`;
    el.innerHTML = html;
}

function mudarPagina(p) {
    paginaAtual = p;
    renderizarTabela();
    renderizarPaginacao();
}

/* ============================================================
   GRÁFICOS
   ============================================================ */

/* --- Bar Chart: Recebido vs Previsto por mês --- */
function renderizarBarChart() {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;

    const meses = obterUltimosMeses(periodoChart);
    const recebido = meses.map(m => somarPorMesStatus(m, 'recebido'));
    const previsto = meses.map(m =>
        somarPorMesStatus(m, 'pendente') + somarPorMesStatus(m, 'atrasado') + somarPorMesStatus(m, 'recebido')
    );

    const labels = meses.map(m => {
        const [ano, mes] = m.split('-');
        return new Date(ano, mes - 1).toLocaleDateString('pt-BR', { month: 'short' });
    });

    if (barChart) barChart.destroy();

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Recebido',
                    data: recebido,
                    backgroundColor: '#dcfce7',
                    borderColor: '#059669',
                    borderWidth: 1.5,
                    borderRadius: 6,
                    borderSkipped: false,
                },
                {
                    label: 'Previsto',
                    data: previsto,
                    backgroundColor: '#dbeafe',
                    borderColor: '#3b82f6',
                    borderWidth: 1.5,
                    borderRadius: 6,
                    borderSkipped: false,
                    type: 'line',
                    fill: false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: '#3b82f6',
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: {
                    labels: {
                        color: '#64748b',
                        font: { family: 'DM Sans', size: 12 },
                        usePointStyle: true,
                        pointStyleWidth: 8,
                        boxHeight: 8,
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    padding: 12,
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: R$ ${ctx.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 } }
                },
                y: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'DM Sans', size: 11 },
                        callback: v => 'R$ ' + (v / 1000).toFixed(0) + 'k'
                    }
                }
            }
        }
    });
}

/* --- Donut: por categoria --- */
function renderizarDonutChart() {
    const ctx = document.getElementById('donutChart');
    if (!ctx) return;

    const cats = {};
    contas.forEach(c => {
        const k = c.categoria || 'Outros';
        cats[k] = (cats[k] || 0) + parseFloat(c.valor || 0);
    });

    const labels = Object.keys(cats);
    const valores = Object.values(cats);
    const total = valores.reduce((s, v) => s + v, 0);
    const cores = labels.map((_, i) => CHART_CORES[i % CHART_CORES.length]);

    if (donutChart) donutChart.destroy();

    donutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: valores,
                backgroundColor: cores,
                borderWidth: 0,
                hoverOffset: 6,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderWidth: 1,
                    titleColor: '#f1f5f9',
                    bodyColor: '#94a3b8',
                    padding: 10,
                    callbacks: {
                        label: ctx => ` ${ctx.parsed > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : 0}% — R$ ${ctx.parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    }
                }
            }
        }
    });

    // legenda customizada
    const legendEl = document.getElementById('donut-legend');
    if (legendEl) {
        legendEl.innerHTML = labels.map((lb, i) => {
            const pct = total > 0 ? ((valores[i] / total) * 100).toFixed(0) : 0;
            return `
            <div class="legend-item">
                <div class="legend-dot-label">
                    <div class="legend-dot" style="background:${cores[i]}"></div>
                    <span>${escHtml(lb)}</span>
                </div>
                <span class="legend-pct" style="color:${cores[i]}">${pct}%</span>
            </div>`;
        }).join('');
    }
}

/* ============================================================
   MODAL
   ============================================================ */
function abrirModalNova() {
    editandoId = null;
    document.getElementById('modal-title').textContent = 'Nova Conta a Receber';
    document.getElementById('conta-form').reset();
    document.getElementById('form-id').value = '';
    // padrão: vencimento = hoje
    document.getElementById('form-vencimento').value = hojeISO();
    abrirModal();
}

function abrirModalEditar(id) {
    const conta = contas.find(c => c.id == id);
    if (!conta) return;
    editandoId = id;
    document.getElementById('modal-title').textContent = 'Editar Conta';
    document.getElementById('form-id').value = id;
    document.getElementById('form-descricao').value = conta.descricao || '';
    document.getElementById('form-categoria').value = conta.categoria || '';
    document.getElementById('form-valor').value = formatValorInput(conta.valor);
    document.getElementById('form-vencimento').value = conta.vencimento || '';
    document.getElementById('form-status').value = conta.status || 'pendente';
    document.getElementById('form-recorrencia').value = conta.recorrencia || 'nenhuma';
    document.getElementById('form-obs').value = conta.obs || '';
    abrirModal();
}

function abrirModal() {
    document.getElementById('modal-overlay').classList.add('open');
    document.getElementById('form-descricao').focus();
}

function fecharModal() {
    document.getElementById('modal-overlay').classList.remove('open');
    editandoId = null;
}

/* ============================================================
   FORM SUBMIT
   ============================================================ */
document.getElementById('conta-form').addEventListener('submit', async e => {
    e.preventDefault();

    const descricao = document.getElementById('form-descricao').value.trim();
    const categoria = document.getElementById('form-categoria').value;
    const valorStr = document.getElementById('form-valor').value.replace(/\./g, '').replace(',', '.');
    const vencimento = document.getElementById('form-vencimento').value;
    const status = document.getElementById('form-status').value;
    const recorrencia = document.getElementById('form-recorrencia').value;
    const obs = document.getElementById('form-obs').value.trim();

    // validação
    let valido = true;
    ['form-descricao', 'form-categoria', 'form-valor', 'form-vencimento'].forEach(id => {
        document.getElementById(id).classList.remove('error');
    });

    if (!descricao) { document.getElementById('form-descricao').classList.add('error'); valido = false; }
    if (!categoria) { document.getElementById('form-categoria').classList.add('error'); valido = false; }
    if (!valorStr || isNaN(parseFloat(valorStr)) || parseFloat(valorStr) <= 0) {
        document.getElementById('form-valor').classList.add('error'); valido = false;
    }
    if (!vencimento) { document.getElementById('form-vencimento').classList.add('error'); valido = false; }

    if (!valido) { toast('Preencha os campos obrigatórios.', 'error'); return; }

    const payload = {
        descricao, categoria,
        valor: parseFloat(valorStr),
        vencimento, status, recorrencia, obs,
    };

    fecharModal();

    if (editandoId) {
        await editarConta(editandoId, payload);
    } else {
        await criarConta(payload);
    }
});

/* ============================================================
   EVENTOS
   ============================================================ */
function bindEventos() {
    // botão nova conta
    document.getElementById('btn-nova-conta').addEventListener('click', abrirModalNova);
    document.getElementById('btn-cancelar').addEventListener('click', fecharModal);
    document.getElementById('modal-close').addEventListener('click', fecharModal);
    document.getElementById('modal-overlay').addEventListener('click', e => {
        if (e.target === e.currentTarget) fecharModal();
    });

    // filtros de status
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filtroStatus = tab.dataset.filter;
            renderizarTudo();
        });
    });

    // filtro mês
    document.getElementById('select-mes').addEventListener('change', e => {
        filtroMes = e.target.value;
        renderizarTudo();
    });

    // busca
    document.getElementById('search-input').addEventListener('input', e => {
        filtroTexto = e.target.value;
        aplicarFiltros();
        renderizarTabela();
        renderizarPaginacao();
    });

    // period tabs
    document.querySelectorAll('.period-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            periodoChart = parseInt(tab.dataset.period);
            renderizarBarChart();
        });
    });

    // máscara valor
    document.getElementById('form-valor').addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '');
        if (!v) { e.target.value = ''; return; }
        v = (parseInt(v) / 100).toFixed(2);
        e.target.value = v.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    });

    // ESC fecha modal
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') fecharModal();
    });
}

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
function formatBRL(valor) {
    return parseFloat(valor || 0).toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL'
    });
}

function formatValorInput(valor) {
    return parseFloat(valor || 0).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatarDataBR(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
}

function hojeISO() {
    return new Date().toISOString().slice(0, 10);
}

function gerarId() {
    return 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

function escHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function ucfirst(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

function setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
}

function obterUltimosMeses(n) {
    const meses = [];
    const hoje = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return meses;
}

function somarPorMesStatus(mesAnoStr, status) {
    return contas
        .filter(c => c.status === status && c.vencimento && c.vencimento.slice(0, 7) === mesAnoStr)
        .reduce((s, c) => s + parseFloat(c.valor || 0), 0);
}

/* ---------- TOAST ---------- */
function toast(msg, tipo = 'success') {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.className = `toast show ${tipo}`;
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* ============================================================
   DADOS DE EXEMPLO (fallback sem back-end)
   ============================================================ */
function dadosExemplo() {
    const hoje = new Date();
    const f = (delta, m = 0) => {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() + m, hoje.getDate() + delta);
        return d.toISOString().slice(0, 10);
    };
    return [
        { id: '1', descricao: 'Salário Maio', categoria: 'Salário', valor: 8500, vencimento: f(28, 0), status: 'pendente', recorrencia: 'mensal', obs: '' },
        { id: '2', descricao: 'Freelance Design', categoria: 'Freelance', valor: 1200, vencimento: f(-2, 0), status: 'recebido', recorrencia: 'nenhuma', obs: '' },
        { id: '3', descricao: 'Dividendo FII XPML', categoria: 'Dividendos', valor: 620, vencimento: f(15, 0), status: 'pendente', recorrencia: 'mensal', obs: 'XPML11' },
        { id: '4', descricao: 'Aluguel Sala 201', categoria: 'Aluguel Recebido', valor: 2100, vencimento: f(-10, 0), status: 'recebido', recorrencia: 'mensal', obs: '' },
        { id: '5', descricao: 'Venda Produto', categoria: 'Vendas', valor: 850, vencimento: f(-20, 0), status: 'atrasado', recorrencia: 'nenhuma', obs: '' },
        { id: '6', descricao: 'Reembolso Viagem', categoria: 'Reembolso', valor: 390, vencimento: f(5, 0), status: 'pendente', recorrencia: 'nenhuma', obs: '' },
        { id: '7', descricao: 'Salário Abril', categoria: 'Salário', valor: 8500, vencimento: f(-32, 0), status: 'recebido', recorrencia: 'mensal', obs: '' },
        { id: '8', descricao: 'Freelance App', categoria: 'Freelance', valor: 2400, vencimento: f(-5, 0), status: 'recebido', recorrencia: 'nenhuma', obs: '' },
        { id: '9', descricao: 'Dividendo ITUB', categoria: 'Dividendos', valor: 410, vencimento: f(-15, 0), status: 'recebido', recorrencia: 'mensal', obs: '' },
        { id: '10', descricao: 'Consultoria RH', categoria: 'Outros', valor: 700, vencimento: f(20, 0), status: 'pendente', recorrencia: 'nenhuma', obs: '' },
    ];
}

const form = document.querySelector("#conta-form");
form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = form.elements["form-descricao"].value.trim();
    const category = form.elements["form-categoria"].value.trim();
    const amount = form.elements["form-valor"].value.trim().replace(/\./g, "").replace(",", ".");
    const due_date = form.elements["form-vencimento"].value.trim();
    const status = form.elements["form-status"].value.trim();
    const recurrence = form.elements["form-recorrencia"].value.trim();
    const notes = form.elements["form-obs"].value.trim();

    const response = await fetch("http://127.0.0.1:5000/api/accounts-receivable", {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            category,
            amount,
            due_date,
            status,
            recurrence,
            notes
        })
    });
    const data = await response.json();

    console.log(data);
});