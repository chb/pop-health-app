import React from "react";
import PropTypes from "prop-types";
import "./Chart.scss";

function getCoordinatesForPercent(percent) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x * 100, y * 100];
}

export default class Chart extends React.Component
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
        this.state = { numerator: 0, denominator: 1 };
    }

    componentDidMount() {
        this.setState({ animating: true }, () => {
            window.jQuery({ numerator: 0, denominator: this.props.denominator }).animate(
                {
                    numerator  : this.props.numerator,
                    denominator: this.props.denominator
                },
                {
                    duration: this.props.duration,
                    easing  : this.props.easing,
                    step: (now, tween) => this.setState({ [tween.prop]: now }),
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
                        duration: this.props.duration,
                        easing  : this.props.easing,
                        step: (now, tween) => this.setState({ [tween.prop]: now }),
                        complete: () => this.setState({ animating: false })
                    }
                );
            });
        }
    }

    render() {
        const percent = Math.max(Math.min(this.state.numerator / this.state.denominator * 100, 100), 0);
        const largeArcFlag = percent >= 50 ? 1 : 0;
        const [x, y] = getCoordinatesForPercent(percent / 100);
        return (
            <svg className="chart" viewBox="-110 -110 220 220">
                <defs>
                    <linearGradient id="myGradient" gradientTransform="rotate(90)">
                    <stop offset="5%"  stop-color="gold" />
                    <stop offset="95%" stop-color="red" />
                    </linearGradient>
                </defs>
                <text className="chart-big-text" y={0}>{Math.round(percent)}%</text>
                {
                    <text className="chart-small-text" y={35}>
                        {Math.round(this.state.numerator)}/{Math.round(this.state.denominator)}
                    </text>
                }
                {
                    percent === 0 ?
                        <circle cx={0} cy={0} r={100} className="chart-arc-bg"/> :
                        <g style={{ transform: "rotate(-0.25turn)" }}>
                            <path fill="url('#myGradient')" className="chart-arc-main" d={`M 100 0 A 100 100 0 ${largeArcFlag} 1 ${x} ${y}`}/>
                            <path className="chart-arc-bg" d={`M ${x} ${y} A 100 100 0 ${largeArcFlag ? 0 : 1 } 1 100 0`}/>
                        </g>
                }
            </svg>
        );
    }
}
