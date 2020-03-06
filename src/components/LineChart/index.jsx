import React     from "react";
import PropTypes from "prop-types";
import moment    from "moment";
import                "./LineChart.scss";

const Highcharts = window.Highcharts;

export default class LineChart extends React.Component
{
    static propTypes = {
        chartOptions: PropTypes.object
    };

    componentDidMount() {
        const fontFamily = "-apple-system,BlinkMacSystemFont,\"Segoe UI\"," +
            "Roboto,\"Helvetica Neue\",Arial,sans-serif,\"Apple Color Emoji\"" +
            ",\"Segoe UI Emoji\",\"Segoe UI Symbol\"";

        this.chart = window.Highcharts.chart("container", {
            chart: {
                type               : "spline",
                plotBackgroundColor: "#F6F6F6",
                plotBorderColor    : "#DDD",
                plotBorderWidth    : 1,
                zoomType: "x"
            },
            drilldown: {
                allowPointDrilldown: false,
                drillUpButton: {
                    text: "This is a test",
                    position: {
                        x: 0,
                        y: -35
                    },
                    theme: {
                        "stroke-width": 2,
                        stroke: "#4a90e2"
                    }
                }
            },
            title: {
                align: "center",
                style: {
                    fontFamily,
                    fontSize  : "1.5rem",
                    fontWeight: 500
                }
            },
            subtitle: {
                align: "center",
                style: {
                    fontFamily,
                    fontSize  : "1rem",
                    fontWeight: 300
                }
            },
            xAxis: [
                {
                    lineWidth : 0,
                    crosshair : true,
                    type      : "category",
                    id        : "year_axis",
                    showEmpty : false,
                    categories: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ],
                    plotLines : [
                        {
                            value: moment().month(),
                            zIndex: 2,
                            color: "rgba(200, 0, 0, 0.5)",
                            dashStyle: "ShortDash"
                        }
                    ],
                    title: {
                        text: null
                    }
                },
                {
                    lineWidth : 0,
                    id        : "monthAxis",
                    crosshair : true,
                    type      : "datetime",
                    minorTicks: true,
                    showEmpty : false,
                    zoomEnabled: true,
                    min       : +moment().utc().startOf("month"),
                    max       : +moment().utc().endOf("month").startOf("day"),
                    dateTimeLabelFormats: {
                        day: "%e"
                    },
                    title: {
                        text: null
                    }
                }
            ],
            yAxis: {
                id: "pct_axis",
                title: {
                    text: "% Patients",
                    style: {
                        fontFamily,
                        fontSize  : "1rem",
                        fontWeight: 500
                    }
                },
                lineColor   : "#CCC",
                tickInterval: 25,
                min         : 0,
                max         : 100,
                lineWidth   : 0
            },
            tooltip: {
                crossHairs   : true,
                shared       : true,
                useHTML      : true,
                headerFormat : "<b>{point.key}</b><hr style=\"margin: 2px 0\"/><table>",
                pointFormat  : "<tr><td style=\"color: {series.color}; text-align: right\">{series.name}: </td>" +
                    "<td style=\"text-align: right\"><b>&nbsp;{point.y} %</b></td></tr>",
                footerFormat : "</table>",
                valueDecimals: 2
            },
            plotOptions: {
                spline: {
                    lineWidth: 3,
                    states: {
                        hover: {
                            lineWidth: 4
                        }
                    },
                    marker: {
                        enabled: false
                    }
                }
            },
            series: [
                {
                    name  : "Current Year",
                    id    : "current_year",
                    color : "#4a90e2",
                    type  : "areaspline",
                    xAxis : "year_axis",
                    shadow: true,
                    fillColor: {
                        linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                        stops: [
                            [
                                0,
                                Highcharts.color("#4a90e2").setOpacity(0.35).get()
                            ],
                            [
                                1,
                                Highcharts.color("#4a90e2").setOpacity(0).get()
                            ]
                        ]
                    },
                    marker: {
                        enabled: false
                    }
                },
                {
                    name     : "Previous Year",
                    id       : "previous_year",
                    color    : "#555",
                    dashStyle: "ShortDot",
                    xAxis    : "year_axis",
                    lineWidth: 2
                }
            ],
            navigation: {
                menuItemStyle: {
                    fontSize: "10px"
                }
            },
            legend: {
                align        : "left",
                verticalAlign: "top",
                layout       : "horizontal",
                floating     : true,
                x            : 60,
                y            : 58
            },
        });

        this.chart.update(this.props.chartOptions, true, true, false);
    }

    componentDidUpdate() {
        this.chart.drillUp();
        this.chart.update(this.props.chartOptions, true, true);
    }

    render() {
        return <div id="container"/>;
    }
}
