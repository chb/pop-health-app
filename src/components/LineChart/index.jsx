import React     from "react";
import PropTypes from "prop-types";

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

        this.chart = window.Highcharts.chart("container", window.jQuery.extend(true, {
            chart: {
                type               : "spline",
                borderWidth        : 1,
                borderColor        : "#EEE",
                plotBackgroundColor: "#F6F6F6",
                plotBorderColor    : "#EEE",
                plotBorderWidth    : 1
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
            xAxis: {
                lineWidth : 0,
                crosshair : true,
                categories: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
            },
            yAxis: {
                title: {
                    text: "% Patients",
                    style: {
                        fontFamily,
                        fontSize  : "1rem",
                        fontWeight: 300
                    }
                },
                lineColor   : "#CCC",
                tickInterval: 25,
                min         : 0,
                max         : 100
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
            series: [{
                name  : "Current Year",
                color : "#4a90e2",
                type  : "areaspline",
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
            }, {
                name     : "Previous Year",
                color    : "#555",
                dashStyle: "ShortDot",
                lineWidth: 2
            }],
            navigation: {
                menuItemStyle: {
                    fontSize: "10px"
                }
            },
            legend: {
                align        : "left",
                verticalAlign: "top",
                layout       : "vertical",
                floating     : true,
                x            : 60,
                y            : 58
            },
        }, this.props.chartOptions));
    }

    componentDidUpdate(/*prevProps, prevState*/) {
        this.chart.update(this.props.chartOptions);
    }

    render() {
        return <div id="container" style={{
            width       : "100%",
            height      : 240,
            marginBottom: 15
        }}/>;
    }
}
