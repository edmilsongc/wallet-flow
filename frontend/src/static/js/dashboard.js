// Line Chart adaptado para o Tema Claro
const lineCtx = document.getElementById('lineChart').getContext('2d');
new Chart(lineCtx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [
            {
                label: 'Entradas',
                data: [8200, 9400, 7800, 11200, 10500, 12500],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: '#10b981',
                pointBorderWidth: 0,
                tension: 0.4,
                fill: true,
            },
            {
                label: 'Saídas',
                data: [5100, 6200, 5800, 7400, 6900, 7840],
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: '#ef4444',
                pointBorderWidth: 0,
                tension: 0.4,
                fill: true,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                labels: {
                    color: '#64748b', font: { family: 'DM Sans', size: 12, weight: 500 },
                    usePointStyle: true, pointStyleWidth: 8, boxHeight: 8
                }
            },
            tooltip: {
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                titleColor: '#0f172a',
                bodyColor: '#64748b',
                padding: 12,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                callbacks: {
                    label: ctx => ' R$ ' + ctx.parsed.y.toLocaleString('pt-BR')
                }
            }
        },
        scales: {
            x: {
                grid: { color: '#f1f5f9' },
                ticks: { color: '#64748b', font: { family: 'DM Sans', size: 12, weight: 500 } }
            },
            y: {
                grid: { color: '#f1f5f9' },
                ticks: {
                    color: '#64748b', font: { family: 'DM Sans', size: 11, weight: 500 },
                    callback: v => 'R$ ' + (v / 1000).toFixed(0) + 'k'
                }
            }
        }
    }
});

// Donut Chart adaptado para o Tema Claro
const donutCtx = document.getElementById('donutChart').getContext('2d');
new Chart(donutCtx, {
    type: 'doughnut',
    data: {
        labels: ['Investimentos', 'Receitas', 'Despesas', 'Reserva'],
        datasets: [{
            data: [42, 31, 19, 8],
            backgroundColor: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b'],
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
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                titleColor: '#0f172a',
                bodyColor: '#64748b',
                padding: 10,
                callbacks: { label: ctx => ' ' + ctx.parsed + '%' }
            }
        }
    }
});

// Period tabs
document.querySelectorAll('.period-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

async function buscarDados() {
    const response = await fetch("http://127.0.0.1:5000/api/dashboard", {
        method: "GET",
        credentials: "include"
    });
    const data = await response.json();
    const user = data.user[0];
    document.getElementById("nameUser").innerHTML = user.trim().split(' ')[0];
}
buscarDados();