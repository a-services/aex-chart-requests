/* Histogram of the number of requests (server load).
 */

var a = {};

$(function () {
    // buildHisto();
    buildAligned()
});

function buildHisto() {
    var numSteps = 20;
    $.get(`/reqHisto?n=${numSteps}`).then(createChart);
}

function buildAligned() {
    $.get('/config').then(config => {
        var stepMin = 1;

        a.stepMin = stepMin;
        a.hostName = config.host_name;
        $.get(`/reqAligned?n=${stepMin}`).then(createChart);
    });
}

function createChart(cdata) {
    var labels = cdata.a.map(it => it.t);

    var data = cdata.a.map(it => it.count);
    var color = 'rgb(255, 99, 132)';

    a.chartDate = cdata.chartDate;
    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Number of requests in ${a.stepMin} min`,
                    backgroundColor: color,
                    borderColor: color,
                    data: data,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `${a.hostName} on ${a.chartDate}`
                }
            }
        }
    };

    var myChart = new Chart(
        document.getElementById('myChart'),
        config
    );
}