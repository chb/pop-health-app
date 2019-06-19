import React     from "react";
import PropTypes from "prop-types";
import moment    from "moment";
import                "./TimelineGrid.scss";


export default class TimelineGrid extends React.Component
{
    static propTypes = {
        data: PropTypes.object
    };

    static defaultProps = {
        data: {}
    };

    static contextTypes = {
        // history: PropTypes.object,
        // location: PropTypes.object,
        router: PropTypes.object
    };

    render()
    {
        const { description, name, measures } = this.props.data;
        // console.log("===>", this.props.data);

        const headerLabels = [];
        const bodyRows = [];
        const now = moment();

        // loop over each measure
        measures.forEach(measure => {

            const cells = [];
            let i = 0;
            for (let date in measure.data) {
                
                const dateObject = moment(date);
                const month = dateObject.format("MMM");
                if (headerLabels.indexOf(month) === -1) {
                    headerLabels.push(month);
                }

                
                // Values from the current year "overlap" the values from the
                // last year. We can compare them and show trends
                if (dateObject.isSame(now, "year")) {
                    const prevDate = moment(dateObject).subtract(1, "year");
                    const prevValue = measure.data[prevDate.format("YYYY-MM")];
                    const diff = Math.round(measure.data[date] - prevValue);
                    cells[i % 12] = (
                        <td
                            key={date}
                            title={`${diff > 0 ? "+" : ""}${diff}%`}
                            onClick={() => {
                                this.context.router.history.push(
                                    "/report?" + [
                                        `date=${date}`,
                                        `measure=${measure.id}`,
                                        `org=${this.props.orgId}`,
                                        `payer=bcbs_ma`
                                    ].join("&")
                                );
                            }}
                        >
                            { Math.round(measure.data[date]) }%
                            {
                                diff > 0 ? 
                                <small className="text-success">▲</small> :
                                diff < 0 ? 
                                <small className="text-danger">▼</small> :
                                " "
                            }
                        </td>
                    );
                }

                // Values from the previous year that do not yet have new data
                // for the current year
                else {
                    const newDate = moment(dateObject).add(1, "year");
                    if (!measure.data[newDate]) {
                        cells[i % 12] = (
                            <td key={date} className="text-muted">
                                { Math.round(measure.data[date]) }%&nbsp;
                            </td>
                        );
                    }
                }
                i++;
            }
            bodyRows.push(
                <tr key={ name + "-" + measure.name }>
                    <th>{ measure.name }</th>
                    { cells }
                </tr>
            )

        });
    
        const header = (
            <thead>
                <tr>
                    <th></th>
                    { headerLabels.map((label, i) => (
                        <th key={"th-" + i}>{ label }</th>
                    )) }
                </tr>
            </thead>
        );

        return (
            <div>
                <h4>{ description }</h4>
                <div className="table-responsive">
                    <table className="table table-sm table-hover timeline-grid">
                        { header }
                        <tbody>{ bodyRows }</tbody>
                    </table>
                </div>
            </div>
        )
    }
}
