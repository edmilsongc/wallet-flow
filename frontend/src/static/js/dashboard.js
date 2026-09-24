var options = {
    chart: { type: 'pie' },
    series: [44, 55, 33],
    labels: ['Contas a Receber', 'Contas a Pagar', 'Plano de Aporte']
}

var chart = new window.ApexCharts(document.querySelector('#chart-pie'), options)
chart.render()

var options = {
    chart: {
        type: 'area',
        with: 100,
        height: 200,
        toolbar: {
            show: false
        }
    },

    colors: ['#22c55e'],

    series: [{ name: 'Revenue', data: [4, 9, 0, 5, 7, 7, 2, 3, 6, 2, 10, 8] }],
    xaxis: { categories: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"] }
}

var chart = new window.ApexCharts(document.querySelector('#chart-column'), options)
chart.render()