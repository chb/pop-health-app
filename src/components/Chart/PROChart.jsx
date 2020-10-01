import React from "react";
import PropTypes from "prop-types";
import "./Chart.scss";

function getCoordinatesForPercent(percent) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x * 100, y * 100];
}

export default class PROChart extends React.Component
{
    static propTypes = {
        numerator  : PropTypes.number.isRequired,
        denominator: PropTypes.number.isRequired,
        duration   : PropTypes.number,
        easing     : PropTypes.string
    };

    static defaultProps = {
        duration: 1200,
        easing  : "easeInOutExpo"
    };

    constructor(props) {
        super(props);
        this.state = { numerator: 0, denominator: 0 };
    }

    componentDidMount() {
        this.setState({ animating: true }, () => {
            window.jQuery({ numerator: 10, denominator: 0 }).animate(
                {
                    numerator  : this.props.numerator,
                    denominator: this.props.denominator
                },
                {
                    duration: this.props.duration,
                    easing  : this.props.easing,
                    step: (now, tween) => this.setState({ [tween.prop]: Math.round(now) }),
                    complete: () => this.setState({ animating: false })
                }
            );
        });
    }

    componentDidUpdate() {
        if (!this.state.animating && this.state.numerator !== this.props.numerator) {
            this.setState({ animating: true }, () => {
                window.jQuery({
                    numerator: this.state.numerator,
                    denominator: this.state.denominator
                }).animate(
                    {
                        numerator  : this.props.numerator,
                        denominator: this.props.denominator
                    },
                    {
                        duration: 200,
                        easing  : "linear",
                        step: (now, tween) => this.setState({ [tween.prop]: Math.round(now) }),
                        complete: () => this.setState({ animating: false })
                    }
                );
            });
        }
    }

    render() {
        const score = this.state.numerator;

        const zones = [
            { min: 10, max: 55, className: "chart-arc-normal"            },
            { min: 55, max: 60, className: "chart-arc-mild"              },
            { min: 60, max: 65, className: "chart-arc-moderate"          },
            { min: 65, max: 70, className: "chart-arc-moderately-severe" },
            { min: 70, max: 90, className: "chart-arc-severe"            }
        ].map((section, i, all) => {
            let startPct = section.min / 100;
            let endPct   = section.max / 100;

            if (i > 0) {
                startPct += 0.0025;
            }

            if (i < all.length - 1) {
                endPct -= 0.0025;
            }

            const [ startX, startY ] = getCoordinatesForPercent(startPct);
            const [ endX  , endY   ] = getCoordinatesForPercent(endPct);

            const largeArcFlag = endPct - startPct > 0.5 ? 1 : 0;

            return (
                <path
                    className={ section.className }
                    d={ `M ${startX} ${startY} A 100 100 0 ${largeArcFlag} 1 ${endX} ${endY}` }
                />
            );
        });

        return (
            <svg className="chart" viewBox="-110 -110 220 220">
                <text className="chart-big-text" y={0}>{score}</text>
                <text className="chart-smaller-text" y={25}>Average T-Score</text>
                <text className="chart-smaller-text" y={45}>from {this.state.denominator} patients</text>
                <text className="chart-smaller-text" y={105} x="-70">Normal</text>
                <text className="chart-smaller-text" y={105} x="70">Severe</text>
                <g style={{ transform: "rotate(0.25turn)" }}>{ zones }</g>
                <path fill="#000" d={`M 0 0 l -10 -10 20 0 z`} style={{ transform: `rotate(${0.1 + (Math.max((score-10)/100, 0))}turn) translate(0, 87px)` }}/>
            </svg>
        );
    }
}
