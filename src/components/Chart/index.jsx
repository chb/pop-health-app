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
        duration: 1600,
        easing  : "easeInOutExpo"
    };

    constructor(props) {
        super(props);
        this.state = { numerator: 0 };
    }

    componentDidMount() {
        window.jQuery({ numerator: 0 }).animate(
            {
                numerator: this.props.numerator
            },
            {
                duration: this.props.duration,
                easing  : this.props.easing,
                step: numerator => this.setState({ numerator })
            }
        );
    }

    render() {
        const percent = Math.max(Math.min(this.state.numerator / this.props.denominator * 100, 100), 0);
        const largeArcFlag = percent >= 50 ? 1 : 0;
        const [x, y] = getCoordinatesForPercent(percent/100);
        return (
            <svg className="chart" viewBox="-110 -110 220 220">
                <text className="chart-big-text" y={0}>{Math.round(percent)}%</text>
                {
                    <text className="chart-small-text" y={35}>
                        {Math.round(this.state.numerator)}/{this.props.denominator}
                    </text>
                }
                {
                    percent === 0 ?
                        <circle cx={0} cy={0} r={100} className="chart-arc-bg"/> :
                        <g style={{ transform: "rotate(-0.25turn)" }}>
                            <path className="chart-arc-main" d={`M 100 0 A 100 100 0 ${largeArcFlag} 1 ${x} ${y}`}/>
                            <path className="chart-arc-bg" d={`M ${x} ${y} A 100 100 0 ${largeArcFlag ? 0 : 1 } 1 100 0`}/>
                        </g>
                }
            </svg>
        );
    }
}
