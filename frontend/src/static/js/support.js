'use strict';

const faqs = [
    { q: 'Como faço para lançar uma conta a receber?', a: 'Acesse o menu "Contas a Receber" na sidebar, clique em "+ Nova Conta" e preencha os campos de valor, vencimento e categoria. Confirme clicando em Salvar.', tags: 'conta receber lançar' },
    { q: 'Como registrar um pagamento realizado?', a: 'Vá em "Contas a Pagar", localize o lançamento desejado e clique no ícone de check (✓) para marcá-lo como pago. O saldo será atualizado automaticamente.', tags: 'pagamento pagar registrar' },
    { q: 'Como gerar um relatório de extrato?', a: 'No menu "Relatórios > Extrato", selecione o período desejado e clique em "Gerar Extrato". Você pode exportar em PDF ou Excel.', tags: 'relatório extrato gerar' },
    { q: 'Esqueci minha senha, como recuperar?', a: 'Na tela de login, clique em "Esqueci minha senha". Informe seu e-mail cadastrado e você receberá um link de redefinição em até 5 minutos.', tags: 'senha conta acesso segurança' },
    { q: 'O que é o Plano de Aporte?', a: 'O Plano de Aporte é uma ferramenta de simulação e controle de investimentos recorrentes. Você define metas e valores mensais e o sistema projeta a evolução do seu patrimônio.', tags: 'aporte plano investimento' },
    { q: 'Posso exportar meus dados?', a: 'Sim! Em Configurações > Dados, você pode exportar todo o histórico de transações em formato CSV ou PDF.', tags: 'exportar dados relatório' },
    { q: 'Como alterar o e-mail da minha conta?', a: 'Acesse Configurações > Perfil e clique em "Editar E-mail". Você precisará confirmar a alteração pelo e-mail atual por segurança.', tags: 'conta acesso email segurança' },
    { q: 'Como ativar a autenticação em dois fatores?', a: 'Em Configurações > Segurança, ative a opção "Autenticação em Dois Fatores (2FA)". Você pode usar Google Authenticator ou SMS.', tags: 'segurança 2fa autenticação conta' },
    { q: 'Meu pagamento aparece duplicado, o que faço?', a: 'Abra um chamado de suporte com a categoria "Pagamentos" informando data, valor e descrição do lançamento duplicado. Nossa equipe revisará e corrigirá em até 24h.', tags: 'pagamento duplicado erro' }
];

function renderFaq(list) {
    const container = document.getElementById('faq-list');
    const empty = document.getElementById('faq-empty');
    const count = document.getElementById('faq-count');
    if (!container || !empty || !count) return;

    container.replaceChildren();
    empty.hidden = list.length > 0;
    count.textContent = list.length ? `${list.length} resultado${list.length === 1 ? '' : 's'}` : '';

    list.forEach(item => {
        const element = document.createElement('div');
        element.className = 'faq-item';
        element.innerHTML = `<button class="faq-question" type="button" aria-expanded="false"><span>${item.q}</span><span class="faq-icon" aria-hidden="true"><i class="fa-solid fa-plus"></i></span></button><div class="faq-answer">${item.a}</div>`;
        element.querySelector('.faq-question').addEventListener('click', () => toggleFaq(element));
        container.appendChild(element);
    });
}

function toggleFaq(item) {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(element => {
        element.classList.remove('open');
        element.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
        item.classList.add('open');
        item.querySelector('.faq-question').setAttribute('aria-expanded', 'true');
    }
}

function filterFaq(term) {
    const value = (term || '').trim().toLocaleLowerCase('pt-BR');
    const emptyTerm = document.getElementById('empty-term');
    if (emptyTerm) emptyTerm.textContent = term;
    const matches = value ? faqs.filter(item => `${item.q} ${item.a} ${item.tags}`.toLocaleLowerCase('pt-BR').includes(value)) : faqs;
    renderFaq(matches);
    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function notify(message) {
    window.WalletFlowUI?.showToast(message);
}

window.filterFaq = filterFaq;
window.showFileName = input => {
    const label = document.getElementById('file-name');
    if (!label) return;
    const file = input.files?.[0];
    label.hidden = !file;
    label.textContent = file ? `📎 ${file.name}` : '';
};

const uploadArea = document.querySelector('.upload-area');
if (uploadArea) {
    uploadArea.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            document.getElementById('file-input')?.click();
        }
    });
    uploadArea.addEventListener('dragover', event => { event.preventDefault(); uploadArea.classList.add('drag-over'); });
    ['dragleave', 'dragend'].forEach(type => uploadArea.addEventListener(type, () => uploadArea.classList.remove('drag-over')));
    uploadArea.addEventListener('drop', event => {
        event.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = event.dataTransfer.files[0];
        const label = document.getElementById('file-name');
        if (file && label) { label.textContent = `📎 ${file.name}`; label.hidden = false; }
    });
}

window.submitTicket = function submitTicket() {
    const subject = document.getElementById('ticket-subject')?.value.trim() || '';
    const category = document.getElementById('ticket-category')?.value.trim() || '';
    const description = document.getElementById('ticket-desc')?.value.trim() || '';
    const email = document.getElementById('ticket-email')?.value.trim() || '';
    const priority = document.getElementById('ticket-priority')?.value || 'Média';
    if (!subject || !category || !description || !email) { notify('Preencha todos os campos obrigatórios.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { notify('Informe um e-mail válido.'); return; }

    const id = `#${1043 + Math.floor(Math.random() * 900)}`;
    const dotClass = { Alta: 'dot-high', Média: 'dot-medium', Baixa: 'dot-low' }[priority] || 'dot-medium';
    const tbody = document.getElementById('tickets-body');
    if (tbody) {
        const row = document.createElement('tr');
        row.innerHTML = `<td class="ticket-id">${id}</td><td class="ticket-title">${escapeHtml(subject)}</td><td><span class="badge badge-muted">${escapeHtml(category)}</span></td><td><span class="priority-dot ${dotClass}"></span>${priority}</td><td><span class="badge badge-blue"><i class="fa-solid fa-hourglass-half" aria-hidden="true"></i>Aguardando</span></td><td class="ticket-date">${new Date().toLocaleDateString('pt-BR')}</td>`;
        tbody.insertBefore(row, tbody.firstChild);
    }
    ['ticket-subject', 'ticket-email', 'ticket-desc'].forEach(id => { const field = document.getElementById(id); if (field) field.value = ''; });
    document.getElementById('ticket-category').value = '';
    document.getElementById('ticket-priority').value = 'Média';
    document.getElementById('file-name').hidden = true;
    notify(`Chamado ${id} aberto com sucesso!`);
    document.getElementById('tickets-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]);
}

renderFaq(faqs);
