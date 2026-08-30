/* index.html: página apenas de navegação; os links levam para login e cadastro. */
'use strict';

var options = {
    chart: {
        type: 'area',
        height: 150,

        toolbar: {
            show: false
        },

        sparkline: {
            enabled: true
        }
    },

    colors: ['#22c55e'],

    series: [
        {
            name: 'Revenue',
            data: [44, 55, 57, 56, 61, 58, 51, 55, 58, 60, 61]
        }
    ],

    stroke: {
        curve: 'smooth',
        width: 4
    },

    fill: {
        type: 'gradient',
        gradient: {
            opacityFrom: 0.45,
            opacityTo: 0.08
        }
    },

    dataLabels: {
        enabled: false
    },

    tooltip: {
        enabled: false
    },

    states: {
        hover: {
            filter: {
                type: 'none'
            }
        },
        active: {
            filter: {
                type: 'none'
            }
        }
    }
}

var chart = new window.ApexCharts(document.querySelector('#chart'), options)
chart.render()