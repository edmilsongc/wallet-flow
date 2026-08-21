// ─── DADOS ────────────────────────────────────────────────────────────────────
const catEmojis = {
    'Aluguel': '🏠', 'Energia': '⚡', 'Água': '💧', 'Internet': '📡',
    'Salários': '👥', 'Impostos': '📋', 'Fornecedores': '📦', 'Transporte': '🚗',
    'Saúde': '🏥', 'Outros': '📦'
};
const catColors = {
    'Aluguel': '#eff6ff', 'Energia': '#fffbeb', 'Água': '#f0f9ff', 'Internet': '#f0fdf4',
    'Salários': '#fdf4ff', 'Impostos': '#fff7ed', 'Fornecedores': '#f8fafc', 'Transporte': '#f0fdf4',
    'Saúde': '#fef2f2', 'Outros': '#f8fafc'
};

let contas = [
    { id: 1, desc: 'Aluguel Comercial', fornecedor: 'Imóveis Silva', cat: 'Aluguel', valor: 2800, data: '2026-05-10', status: 'vencida', obs: '', formaPgto: '', recorrente: true, arquivo: '' },
    { id: 2, desc: 'Conta de Energia', fornecedor: 'Equatorial', cat: 'Energia', valor: 450, data: '2026-05-15', status: 'pendente', obs: '', formaPgto: 'Débito Automático', recorrente: true, arquivo: '' },
    { id: 3, desc: 'Internet Fibra', fornecedor: 'Vivo', cat: 'Internet', valor: 199.90, data: '2026-05-12', status: 'pendente', obs: '', formaPgto: 'Boleto', recorrente: true, arquivo: '' },
    { id: 4, desc: 'Salário - João', fornecedor: 'Folha de Pagamento', cat: 'Salários', valor: 3500, data: '2026-05-05', status: 'paga', obs: 'Pago via PIX', formaPgto: 'PIX', recorrente: true, arquivo: '' },
    { id: 5, desc: 'IPTU Parcela 5/10', fornecedor: 'Prefeitura', cat: 'Impostos', valor: 680, data: '2026-05-20', status: 'pendente', obs: '', formaPgto: 'Boleto', recorrente: false, arquivo: '' },
    { id: 6, desc: 'Fornecedor Material', fornecedor: 'Distribuidora ABC', cat: 'Fornecedores', valor: 1250, data: '2026-05-08', status: 'paga', obs: '', formaPgto: 'Transferência', recorrente: false, arquivo: '' },
    { id: 7, desc: 'Conta de Água', fornecedor: 'Sabesp', cat: 'Água', valor: 189.80, data: '2026-05-28', status: 'pendente', obs: '', formaPgto: '', recorrente: true, arquivo: '' },
    { id: 8, desc: 'Plano de Saúde', fornecedor: 'Unimed', cat: 'Saúde', valor: 920, data: '2026-05-07', status: 'vencida', obs: '', formaPgto: 'Débito Automático', recorrente: true, arquivo: '' },
];
let nextId = 9;
let editandoId = null;
let pagandoId = null;

// ─── DATA E SAUDAÇÃO ─────────────────────────────────────────────────────────
(function () {
    const agora = new Date();
    const hora = agora.getHours();
    const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
    document.getElementById('greetingText').textContent = saudacao + ', Usuário 👋';
    const opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    document.getElementById('dateText').textContent = agora.toLocaleDateString('pt-BR', opts).replace(/^\w/, c => c.toUpperCase());
    const mesNome = agora.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    document.getElementById('progressTitle').textContent = 'Progresso de ' + mesNome.replace(/^\w/, c => c.toUpperCase());
})();

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmt(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function fmtDate(d) { const [y, m, dd] = d.split('-'); return `${dd}/${m}/${y}`; }
function today() { return new Date().toISOString().split('T')[0]; }

function diasParaVencer(dataStr) {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const venc = new Date(dataStr + 'T00:00:00');
    return Math.round((venc - hoje) / 86400000);
}

function vencimentoDisplay(c) {
    if (c.status === 'paga') return `<span class="venc-text venc-paga">${fmtDate(c.data)}</span>`;
    const dias = diasParaVencer(c.data);
    if (dias === 0) return `<span class="venc-text venc-hoje">Vence hoje</span>`;
    if (dias === 1) return `<span class="venc-text venc-amanha">Vence amanhã</span>`;
    if (dias < 0) return `<span class="venc-text venc-atrasada">${Math.abs(dias)} dia${Math.abs(dias) > 1 ? 's' : ''} em atraso</span>`;
    return `<span class="venc-text venc-normal">${fmtDate(c.data)}</span>`;
}

function calcularStatus(c) {
    if (c.status === 'paga') return c.status;
    const dias = diasParaVencer(c.data);
    if (dias < 0) return 'vencida';
    return c.status === 'pendente' ? 'pendente' : c.status;
}

function statusInfo(s) {
    const map = {
        'vencida': { cls: 'badge-vencida', label: 'Vencida' },
        'pendente': { cls: 'badge-pendente', label: 'Pendente' },
        'paga': { cls: 'badge-paga', label: 'Paga' },
    };
    return map[s] || map['pendente'];
}

// ─── RENDER CARDS ─────────────────────────────────────────────────────────────
function renderSummary() {
    const total = contas.reduce((a, c) => c.status !== 'paga' ? a + c.valor : a, 0);
    const venc = contas.filter(c => calcularStatus(c) === 'vencida').reduce((a, c) => a + c.valor, 0);
    const avencer = contas.filter(c => c.status !== 'paga' && calcularStatus(c) !== 'vencida').reduce((a, c) => a + c.valor, 0);
    const pagas = contas.filter(c => c.status === 'paga').reduce((a, c) => a + c.valor, 0);
    const nVenc = contas.filter(c => calcularStatus(c) === 'vencida').length;
    const nPend = contas.filter(c => c.status !== 'paga' && calcularStatus(c) !== 'vencida').length;
    const nPagas = contas.filter(c => c.status === 'paga').length;

    document.getElementById('summaryGrid').innerHTML = `
    <div class="sum-card card-total">
      <div class="card-icon"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="#3b82f6" stroke-width="1.8"/><path d="M12 6v6l4 2" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round"/></svg></div>
      <div class="card-label">Total em Aberto</div>
      <div class="card-value">${fmt(total)}</div>
      <div class="card-sub">${contas.filter(c => c.status !== 'paga').length} contas pendentes</div>
      <div class="card-accent"></div>
    </div>
    <div class="sum-card card-vencida">
      <div class="card-icon"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#ef4444" stroke-width="1.8"/><line x1="12" y1="9" x2="12" y2="13" stroke="#ef4444" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="#ef4444"/></svg></div>
      <div class="card-label">Vencidas</div>
      <div class="card-value" style="color:var(--red)">${fmt(venc)}</div>
      <div class="card-sub">${nVenc} conta${nVenc !== 1 ? 's' : ''} em atraso</div>
      <div class="card-accent"></div>
    </div>
    <div class="sum-card card-vencer">
      <div class="card-icon"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke="#f59e0b" stroke-width="1.8"/><path d="M12 8v4l3 3" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round"/></svg></div>
      <div class="card-label">A Vencer</div>
      <div class="card-value" style="color:var(--amber)">${fmt(avencer)}</div>
      <div class="card-sub">${nPend} conta${nPend !== 1 ? 's' : ''} a vencer</div>
      <div class="card-accent"></div>
    </div>
    <div class="sum-card card-paga">
      <div class="card-icon"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="#10b981" stroke-width="1.8" stroke-linecap="round"/><polyline points="22 4 12 14.01 9 11.01" stroke="#10b981" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="card-label">Pagas no Mês</div>
      <div class="card-value" style="color:var(--green)">${fmt(pagas)}</div>
      <div class="card-sub">${nPagas} conta${nPagas !== 1 ? 's' : ''} quitada${nPagas !== 1 ? 's' : ''}</div>
      <div class="card-accent"></div>
    </div>
  `;

    const totalAll = contas.reduce((a, c) => a + c.valor, 0);
    const pct = totalAll > 0 ? Math.round((pagas / totalAll) * 100) : 0;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressPct').textContent = pct + '% pago';
}

// ─── RENDER TABELA ────────────────────────────────────────────────────────────
function renderList() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const statusF = document.getElementById('statusFilter').value;
    const catF = document.getElementById('catFilter').value;
    const dInicio = document.getElementById('periodoInicio').value;
    const dFim = document.getElementById('periodoFim').value;

    let filtered = contas.filter(c => {
        const st = calcularStatus(c);
        const matchS = !search || c.desc.toLowerCase().includes(search) || c.fornecedor.toLowerCase().includes(search);
        const matchSt = !statusF || st === statusF;
        const matchC = !catF || c.cat === catF;
        const matchDi = !dInicio || c.data >= dInicio;
        const matchDf = !dFim || c.data <= dFim;
        return matchS && matchSt && matchC && matchDi && matchDf;
    });

    const el = document.getElementById('contasList');
    if (!filtered.length) {
        el.innerHTML = `<div class="empty-state">
      <svg fill="none" viewBox="0 0 24 24"><path d="M9 17H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v3" stroke="currentColor" stroke-width="1.5"/><path d="M13 21l-4 0M17 21l-2 0M3 21h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      <p>Nenhuma conta encontrada com esses filtros.</p>
    </div>`;
        return;
    }

    el.innerHTML = filtered.map(c => {
        const st = calcularStatus(c);
        const si = statusInfo(st);
        const bg = catColors[c.cat] || '#f8fafc';
        const em = catEmojis[c.cat] || '📦';
        const recBadge = c.recorrente ? '<span class="recorrente-badge">↻ mensal</span>' : '';
        return `<div class="ct-row">
      <div class="ct-nome">
        <div class="ct-icon" style="background:${bg}">${em}</div>
        <div class="ct-nome-text">
          <div class="primary">${c.desc}</div>
          <div class="secondary">${recBadge}</div>
        </div>
      </div>
      <div class="ct-cell ct-fornecedor">${c.fornecedor || '—'}</div>
      <div class="ct-cell" style="font-size:12px;color:var(--muted)">${c.cat}</div>
      <div class="ct-cell">${vencimentoDisplay(c)}</div>
      <div class="ct-cell ct-valor">${fmt(c.valor)}</div>
      <div class="ct-cell"><span class="badge ${si.cls}"><span class="badge-dot"></span>${si.label}</span></div>
      <div class="ct-actions">
        <button class="act-btn edit" title="Editar" onclick="editarConta(${c.id})">
          <svg fill="none" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </button>
        ${st !== 'paga' ? `<button class="act-btn pay" title="Marcar como paga" onclick="abrirModalPgto(${c.id})">
          <svg fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>`: ''}
        <button class="act-btn del" title="Excluir" onclick="deletar(${c.id})">
          <svg fill="none" viewBox="0 0 24 24"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>`;
    }).join('');
}

// ─── AÇÕES ────────────────────────────────────────────────────────────────────
function deletar(id) {
    const c = contas.find(x => x.id === id);
    if (c && confirm(`Remover "${c.desc}"?`)) {
        contas = contas.filter(x => x.id !== id);
        toast('🗑️ Conta removida.');
        renderSummary(); renderList();
    }
}

function abrirModalPgto(id) {
    pagandoId = id;
    const c = contas.find(x => x.id === id);
    document.getElementById('pgtoData').value = today();
    document.getElementById('pgtoValor').value = c ? c.valor : '';
    document.getElementById('pgtoForma').value = c?.formaPgto || '';
    document.getElementById('modalPgtoOverlay').classList.add('open');
}

function closeModalPgto() {
    document.getElementById('modalPgtoOverlay').classList.remove('open');
    pagandoId = null;
}

function handlePgtoOverlayClick(e) {
    if (e.target === document.getElementById('modalPgtoOverlay')) closeModalPgto();
}

function confirmarPagamento() {
    if (!pagandoId) return;
    const c = contas.find(x => x.id === pagandoId);
    if (!c) return;

    c.status = 'paga';
    c.formaPgto = document.getElementById('pgtoForma').value || c.formaPgto;

    // RECORRENTE: gerar próximo mês
    if (c.recorrente) {
        const [y, m, d] = c.data.split('-').map(Number);
        let novoM = m + 1; let novoY = y;
        if (novoM > 12) { novoM = 1; novoY++; }
        const novoData = `${novoY}-${String(novoM).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        contas.push({
            ...c, id: nextId++, status: 'pendente', data: novoData, obs: ''
        });
        toast(`✅ ${c.desc} paga! Próxima parcela gerada para ${fmtDate(novoData)}.`, 'success');
    } else {
        toast(`✅ ${c.desc} marcada como paga!`, 'success');
    }

    closeModalPgto();
    renderSummary(); renderList();
}

// ─── MODAL NOVA / EDITAR ──────────────────────────────────────────────────────
function openModal() {
    editandoId = null;
    document.getElementById('modalTitle').textContent = 'Nova Conta a Pagar';
    document.getElementById('fDesc').value = '';
    document.getElementById('fFornecedor').value = '';
    document.getElementById('fCategoria').value = '';
    document.getElementById('fValor').value = '';
    document.getElementById('fData').value = today();
    document.getElementById('fObs').value = '';
    document.getElementById('fFormaPgto').value = '';
    document.getElementById('fAnexo').value = '';
    document.getElementById('fileName').textContent = '';
    document.getElementById('fRecorrente').checked = false;
    document.getElementById('modalOverlay').classList.add('open');
}

function editarConta(id) {
    const c = contas.find(x => x.id === id);
    if (!c) return;
    editandoId = id;
    document.getElementById('modalTitle').textContent = 'Editar Conta';
    document.getElementById('fDesc').value = c.desc;
    document.getElementById('fFornecedor').value = c.fornecedor || '';
    document.getElementById('fCategoria').value = c.cat;
    document.getElementById('fValor').value = c.valor;
    document.getElementById('fData').value = c.data;
    document.getElementById('fObs').value = c.obs || '';
    document.getElementById('fFormaPgto').value = c.formaPgto || '';
    document.getElementById('fAnexo').value = '';
    document.getElementById('fileName').textContent = c.arquivo ? `📎 ${c.arquivo}` : '';
    document.getElementById('fRecorrente').checked = c.recorrente || false;
    document.getElementById('modalOverlay').classList.add('open');
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); editandoId = null; }
function handleOverlayClick(e) { if (e.target === document.getElementById('modalOverlay')) closeModal(); }

function onFileChange(input) {
    const fname = input.files[0] ? input.files[0].name : '';
    document.getElementById('fileName').textContent = fname ? `📎 ${fname}` : '';
}

function salvarConta() {
    const desc = document.getElementById('fDesc').value.trim();
    const forn = document.getElementById('fFornecedor').value.trim();
    const cat = document.getElementById('fCategoria').value;
    const valor = parseFloat(document.getElementById('fValor').value);
    const data = document.getElementById('fData').value;

    if (!desc) { alert('Informe a descrição.'); return; }
    if (!forn) { alert('Informe o fornecedor.'); return; }
    if (!cat) { alert('Selecione a categoria.'); return; }
    if (!valor || valor <= 0) { alert('Informe um valor válido.'); return; }
    if (!data) { alert('Informe a data de vencimento.'); return; }

    const obs = document.getElementById('fObs').value.trim();
    const formaPgto = document.getElementById('fFormaPgto').value;
    const recorrente = document.getElementById('fRecorrente').checked;
    const arquivo = document.getElementById('fAnexo').files[0]?.name || '';
    const status = data < today() ? 'vencida' : 'pendente';

    if (editandoId) {
        const idx = contas.findIndex(x => x.id === editandoId);
        if (idx >= 0) {
            const stAtual = contas[idx].status;
            contas[idx] = {
                ...contas[idx], desc, fornecedor: forn, cat, valor, data, obs, formaPgto, recorrente,
                arquivo: arquivo || contas[idx].arquivo,
                status: stAtual === 'paga' ? 'paga' : status
            };
            toast('✏️ Conta atualizada com sucesso!');
        }
    } else {
        contas.push({ id: nextId++, desc, fornecedor: forn, cat, valor, data, status, obs, formaPgto, recorrente, arquivo });
        toast('🎉 Conta adicionada!', 'success');
    }

    closeModal();
    renderSummary(); renderList();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('catFilter').value = '';
    document.getElementById('periodoInicio').value = '';
    document.getElementById('periodoFim').value = '';
    renderList();
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function toast(msg, tipo = '') {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.className = 'toast' + (tipo ? ' ' + tipo : '');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
}

// ─── INIT ─────────────────────────────────────────────────────────────────────
renderSummary();
renderList();

// ##############################################################################################
const form = document.querySelector("#");