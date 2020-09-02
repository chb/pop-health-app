import React     from "react";
import moment    from "moment";
import PropTypes from "prop-types";
import Chart     from "../Chart";
import PROChart  from "../Chart/PROChart";
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
        denominatorDescription: PropTypes.string,
        measureId             : PropTypes.string
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
            denominatorDescription,
            measureId
        } = this.props;


        return (
            <div className="report-summary">
                <div className="row">
                    <div className="col-8">
                        <div className="sub-title">{ clinic }: { moment(date).format("MMMM YYYY") }</div>
                        <div className="title">{ measureName }</div>
                    </div>
                    <div className="col">
                        {
                            measureId === "pro" ?
                            <PROChart numerator={ numeratorValue } denominator={ denominatorValue } /> :
                            <Chart numerator={ numeratorValue } denominator={ denominatorValue } />
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <p className="sub-title">POPULATION HEALTH IMPACT</p>
                        <div dangerouslySetInnerHTML={{ __html: measureDescription }}></div>
                        <br/>
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
