/* ════════════════════════════════════════════════════
   Rende Mais — suporte.js
   Página de Ajuda e Suporte
   ════════════════════════════════════════════════════ */

/* ── Data atual na topbar ───────────────────────────── */
(function setDate() {
    const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const now = new Date();
    const el = document.getElementById('topbar-date');
    if (el) {
        el.textContent = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
    }
})();

/* ── Sidebar mobile (drawer) ────────────────────────── */
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const menuToggle = document.getElementById('menu-toggle');

function openSidebar() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebar() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (menuToggle) menuToggle.addEventListener('click', openSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

/* Fechar ao pressionar Escape */
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
});

/* ── Dados do FAQ ───────────────────────────────────── */
const faqs = [
    {
        q: 'Como faço para lançar uma conta a receber?',
        a: 'Acesse o menu "Contas a Receber" na sidebar, clique em "+ Nova Conta" e preencha os campos de valor, vencimento e categoria. Confirme clicando em Salvar.',
        tags: 'conta receber lançar'
    },
    {
        q: 'Como registrar um pagamento realizado?',
        a: 'Vá em "Contas a Pagar", localize o lançamento desejado e clique no ícone de check (✓) para marcá-lo como pago. O saldo será atualizado automaticamente.',
        tags: 'pagamento pagar registrar'
    },
    {
        q: 'Como gerar um relatório de extrato?',
        a: 'No menu "Relatórios > Extrato", selecione o período desejado e clique em "Gerar Extrato". Você pode exportar em PDF ou Excel.',
        tags: 'relatório extrato gerar'
    },
    {
        q: 'Esqueci minha senha, como recuperar?',
        a: 'Na tela de login, clique em "Esqueci minha senha". Informe seu e-mail cadastrado e você receberá um link de redefinição em até 5 minutos.',
        tags: 'senha conta acesso segurança'
    },
    {
        q: 'O que é o Plano de Aporte?',
        a: 'O Plano de Aporte é uma ferramenta de simulação e controle de investimentos recorrentes. Você define metas e valores mensais e o sistema projeta a evolução do seu patrimônio.',
        tags: 'aporte plano investimento'
    },
    {
        q: 'Posso exportar meus dados?',
        a: 'Sim! Em Configurações > Dados, você pode exportar todo o histórico de transações em formato CSV ou PDF.',
        tags: 'exportar dados relatório'
    },
    {
        q: 'Como alterar o e-mail da minha conta?',
        a: 'Acesse Configurações > Perfil e clique em "Editar E-mail". Você precisará confirmar a alteração pelo e-mail atual por segurança.',
        tags: 'conta acesso email segurança'
    },
    {
        q: 'Como ativar a autenticação em dois fatores?',
        a: 'Em Configurações > Segurança, ative a opção "Autenticação em Dois Fatores (2FA)". Você pode usar Google Authenticator ou SMS.',
        tags: 'segurança 2fa autenticação conta'
    },
    {
        q: 'Meu pagamento aparece duplicado, o que faço?',
        a: 'Abra um chamado de suporte com a categoria "Pagamentos" informando data, valor e descrição do lançamento duplicado. Nossa equipe revisará e corrigirá em até 24h.',
        tags: 'pagamento duplicado erro'
    },
];

/* ── Renderizar FAQ ─────────────────────────────────── */
function renderFaq(list) {
    const container = document.getElementById('faq-list');
    const empty = document.getElementById('faq-empty');
    const count = document.getElementById('faq-count');

    if (!container) return;
    container.innerHTML = '';

    if (!list.length) {
        if (empty) empty.style.display = 'block';
        if (count) count.textContent = '';
        return;
    }

    if (empty) empty.style.display = 'none';
    if (count) count.textContent = `${list.length} resultado${list.length !== 1 ? 's' : ''}`;

    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'faq-item';
        div.innerHTML = `
            <div class="faq-question" role="button" tabindex="0" aria-expanded="false">
                <span>${item.q}</span>
                <div class="faq-icon" aria-hidden="true"><i class="fa-solid fa-plus"></i></div>
            </div>
            <div class="faq-answer">${item.a}</div>`;

        const question = div.querySelector('.faq-question');
        question.addEventListener('click', () => toggleFaq(div));
        question.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleFaq(div); } });

        container.appendChild(div);
    });
}

/* ── Abrir/fechar item FAQ ──────────────────────────── */
function toggleFaq(item) {
    const isOpen = item.classList.contains('open');

    /* Fechar todos */
    document.querySelectorAll('.faq-item.open').forEach(el => {
        el.classList.remove('open');
        el.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
        item.classList.add('open');
        item.querySelector('.faq-question').setAttribute('aria-expanded', 'true');
    }
}

/* ── Filtrar FAQ ────────────────────────────────────── */
function filterFaq(term) {
    const t = (term || '').trim().toLowerCase();
    const emptyTerm = document.getElementById('empty-term');
    if (emptyTerm) emptyTerm.textContent = term;

    if (!t) {
        renderFaq(faqs);
        return;
    }

    const result = faqs.filter(f =>
        f.q.toLowerCase().includes(t) ||
        f.a.toLowerCase().includes(t) ||
        f.tags.toLowerCase().includes(t)
    );

    renderFaq(result);

    const faqSection = document.getElementById('faq');
    if (faqSection) {
        faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/* Expor globalmente (chamado via onclick no HTML) */
window.filterFaq = filterFaq;

/* Inicializar FAQ */
renderFaq(faqs);

/* ── Upload de arquivo ──────────────────────────────── */
window.showFileName = function (input) {
    const label = document.getElementById('file-name');
    if (!label) return;
    if (input.files && input.files.length) {
        label.textContent = '📎 ' + input.files[0].name;
        label.style.display = 'block';
    }
};

/* Drag & Drop */
const uploadArea = document.querySelector('.upload-area');
if (uploadArea) {
    uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
        uploadArea.style.borderColor = 'var(--accent2)';
        uploadArea.style.background = '#eff6ff';
        uploadArea.style.color = 'var(--accent2)';
    });

    ['dragleave', 'dragend'].forEach(evt => {
        uploadArea.addEventListener(evt, () => {
            uploadArea.style.borderColor = '';
            uploadArea.style.background = '';
            uploadArea.style.color = '';
        });
    });

    uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';
        uploadArea.style.color = '';

        const file = e.dataTransfer.files[0];
        if (file) {
            const label = document.getElementById('file-name');
            if (label) {
                label.textContent = '📎 ' + file.name;
                label.style.display = 'block';
            }
        }
    });
}

/* ── Toast ──────────────────────────────────────────── */
function showToast(msg, duration = 3500) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    if (!toast || !toastMsg) return;

    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), duration);
}

/* ── Enviar chamado ─────────────────────────────────── */
window.submitTicket = function () {
    const subject = (document.getElementById('ticket-subject')?.value || '').trim();
    const category = (document.getElementById('ticket-category')?.value || '').trim();
    const desc = (document.getElementById('ticket-desc')?.value || '').trim();
    const email = (document.getElementById('ticket-email')?.value || '').trim();
    const priority = document.getElementById('ticket-priority')?.value || 'Média';

    /* Validações */
    if (!subject || !category || !desc || !email) {
        showToast('⚠️ Preencha todos os campos obrigatórios.');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('⚠️ Informe um e-mail válido.');
        return;
    }

    /* Criar linha na tabela */
    const newId = '#' + (1043 + Math.floor(Math.random() * 900));
    const today = new Date().toLocaleDateString('pt-BR');
    const dotClass = { Alta: 'dot-high', Média: 'dot-medium', Baixa: 'dot-low' }[priority] || 'dot-medium';

    const tbody = document.getElementById('tickets-body');
    if (tbody) {
        const row = document.createElement('tr');
        row.style.animation = 'fadeUp 0.4s ease both';
        row.innerHTML = `
            <td class="ticket-id">${newId}</td>
            <td class="ticket-title">${escapeHtml(subject)}</td>
            <td><span class="badge badge-muted">${escapeHtml(category)}</span></td>
            <td><span class="priority-dot ${dotClass}"></span>${priority}</td>
            <td><span class="badge badge-blue"><i class="fa-solid fa-hourglass-half" style="font-size:9px"></i> Aguardando</span></td>
            <td class="ticket-date">${today}</td>`;
        tbody.insertBefore(row, tbody.firstChild);
    }

    /* Limpar formulário */
    ['ticket-subject', 'ticket-email', 'ticket-desc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const cat = document.getElementById('ticket-category');
    if (cat) cat.value = '';
    const pri = document.getElementById('ticket-priority');
    if (pri) pri.value = 'Média';
    const fileName = document.getElementById('file-name');
    if (fileName) fileName.style.display = 'none';

    showToast('✅ Chamado ' + newId + ' aberto com sucesso!');

    /* Scroll até tabela */
    setTimeout(() => {
        const tableCard = document.getElementById('tickets-section');
        if (tableCard) tableCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 400);
};

/* ── Escape para evitar XSS na tabela ──────────────── */
function escapeHtml(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, m => map[m]);
}

/* ── Barra de pesquisa global do topbar ─────────────── */
const topSearch = document.querySelector('.topbar .search-box input');
if (topSearch) {
    topSearch.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            filterFaq(topSearch.value);
        }
    });
}