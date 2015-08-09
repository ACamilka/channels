channelsApp.directive('pieChart', function(){
    return {
        restrict: 'E',
        replace: true,
        scope: {
          items: '='
        },
        link: function (scope, element, attrs) {
            var chart = new Highcharts.Chart({
                chart: {
                    renderTo: 'chart-body',
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    height: 450,
                    width: 450
                },
                title: {
                    text: 'Частота появления букв'
                },
                tooltip: {
                    pointFormat: 'Кличество {point.y}</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            color: '#333',
                            connectorColor: '#333',
                            formatter: function () {
                                return '<b>' + this.point.name + '</b> (' + this.y + ')';
                            }
                        }
                    }
                },
                series: [{
                    type: 'pie',
                    name: 'Alphabet',
                    data: scope.lettersData
                }]
            });
            scope.$watch("items", function (newValue) {
                chart.series[0].setData(newValue);
            }, true);
        }
    }
});