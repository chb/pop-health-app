import React     from "react";
import moment    from "moment";
import PropTypes from "prop-types";
import Chart     from "../Chart";
import                "./ReportSummary.scss";

export default class ReportSummary extends React.Component
{
    static propTypes = {
        date                  : PropTypes.string.isRequired,
        clinic                : PropTypes.string,
        measureName           : PropTypes.string,
        numeratorValue        : PropTypes.number,
        denominatorValue      : PropTypes.number,
        measureDescription    : PropTypes.string,
        numeratorDescription  : PropTypes.string,
        denominatorDescription: PropTypes.string
    };

    render()
    {
        const {
            date,
            clinic,
            measureName,
            numeratorValue,
            denominatorValue,
            measureDescription,
            numeratorDescription,
            denominatorDescription
        } = this.props;


        return (
            <div className="report-summary">
                <div className="row">
                    <div className="col-8">
                        <div className="sub-title">{ clinic }: { moment(date).format("MMMM YYYY") }</div>
                        <div className="title">{ measureName }</div>
                    </div>
                    <div className="col">
                        <Chart
                            numerator={ numeratorValue }
                            denominator={ denominatorValue }
                            value={Math.round(numeratorValue / denominatorValue * 100)} subText={`${numeratorValue}/${denominatorValue}`}
                        />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <p className="sub-title">POPULATION HEALTH IMPACT</p>
                        <p>{ measureDescription }</p>
                    </div>
                </div>
                <br/>
                <div className="row">
                    <div className="col">
                        <p className="sub-title">NUMERATOR</p>
                        <p>{ numeratorDescription }</p>
                    </div>
                    <div className="col">
                        <p className="sub-title">DENOMINATOR</p>
                        <p>{ denominatorDescription }</p>
                    </div>
                </div>
            </div>
        );
    }
}
