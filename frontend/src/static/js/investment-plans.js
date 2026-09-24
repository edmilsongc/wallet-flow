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

    series: [{ name: 'Revenue', data: [1, 2, 2, 0, 4, 5, 9, 3, 4, 1, 3, 4] }],
    xaxis: { categories: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"] }
}

var chart = new window.ApexCharts(document.querySelector('#chart-column'), options)
chart.render()