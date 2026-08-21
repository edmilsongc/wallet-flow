// Exibe a data atual formatada em português no topbar
function setCurrentDate() {
    const el = document.getElementById('current-date');
    if (!el) return;

    const now = new Date();
    const formatted = now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Capitaliza a primeira letra
    el.textContent = formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

// Marca o item de navegação como ativo com base no href da página atual
function setActiveNavItem() {
    const currentPath = window.location.pathname.split('/').pop();
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.classList.remove('active');
        const href = item.getAttribute('href')?.split('/').pop();
        if (href && href === currentPath) {
            item.classList.add('active');
        }
    });
}

// Inicializa a busca na sidebar (filtra itens de navegação pelo texto)
function initSearch() {
    const input = document.querySelector('.search-box input');
    if (!input) return;

    input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            const label = item.textContent.trim().toLowerCase();
            item.style.display = (!query || label.includes(query)) ? '' : 'none';
        });

        // Esconde labels de seção se todos os itens abaixo estiverem ocultos
        const sections = document.querySelectorAll('.nav-section-label');
        sections.forEach(section => {
            let next = section.nextElementSibling;
            let hasVisible = false;

            while (next && !next.classList.contains('nav-section-label')) {
                if (next.classList.contains('nav-item') && next.style.display !== 'none') {
                    hasVisible = true;
                    break;
                }
                next = next.nextElementSibling;
            }

            section.style.display = hasVisible ? '' : 'none';
        });
    });
}

// Boot
document.addEventListener('DOMContentLoaded', () => {
    setCurrentDate();
    setActiveNavItem();
    initSearch();
});