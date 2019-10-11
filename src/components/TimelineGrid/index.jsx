import React             from "react";
import PropTypes         from "prop-types";
import moment            from "moment";
import { connect }       from "react-redux";
import                        "./TimelineGrid.scss";


export class TimelineGrid extends React.Component
{
    static propTypes = {

        /**
         * The data to be rendered within the grid. Contains `description`,
         * `name` a `measures[]` array to hold the measure results.
         */
        data: PropTypes.object,

        /**
         * Pass the clicked measure up to the parent component where the
         * selection is being managed.
         */
        onRowClick: PropTypes.func,

        /**
         * Tell the TimelineGrid which is the selected organization ID.
         * Rows that apply to that ID and to @selectedMeasureId will be
         * rendered as selected.
         */
        selectedOrgId: PropTypes.string,

        /**
         * Tell the TimelineGrid which is the selected measure ID.
         * Rows that apply to that ID and to @selectedOrgId will be
         * rendered as selected.
         */
        selectedMeasureId: PropTypes.string,

        /**
         * The ID of the organization that this grid is about. This can be the
         * same as @selectedOrgId if there is a selection within that org, or
         * it can be different, n which case we render table that has no
         * selected row.
         */
        orgId: PropTypes.string
    };

    static defaultProps = {
        data: {}
    };

    static contextTypes = {
        router: PropTypes.object
    };

    render() {
        const { description, name, measures } = this.props.data;

        const headerLabels = [];
        const bodyRows = [];
        const now = moment();

        // loop over each measure
        measures.forEach(measure => {

            const cells = [];
            let i = 0;
            for (let date in measure.data) {

                const entry = measure.data[date];
                const dateObject = moment(date);
                const month = dateObject.format("MMM");
                if (headerLabels.indexOf(month) === -1) {
                    headerLabels.push(month);
                }

                const title = `${dateObject.format("MMM YYYY")} - ${entry.numerator} of ${entry.denominator}`;
                const pct = Math.round(entry.pct);

                // Values from the current year "overlap" the values from the
                // last year. We can compare them and show trends
                if (dateObject.isSame(now, "year")) {
                    // const prevDate = moment(dateObject).subtract(1, "year");
                    // const prevValue = measure.data[prevDate.format("YYYY-MM")];
                    // const diff = Math.round(measure.data[date] - prevValue);

                    cells[i % 12] = (
                        <td key={date} title={title}>
                            <a href={`/report/${entry.id}`}>{ Math.round(pct) }%</a>
                        </td>
                    );
                }

                // Values from the previous year that do not yet have new data
                // for the current year
                else {
                    const newDate = moment(dateObject).add(1, "year");
                    if (!measure.data[newDate]) {
                        cells[i % 12] = (
                            <td key={date} title={title}>
                                <a href={`/report/${entry.id}`} className="text-muted">{ Math.round(pct) }%</a>
                            </td>
                        );
                    }
                }
                i++;
            }

            bodyRows.push(
                <tr
                    key={ name + "-" + measure.name }
                    className={
                        (this.props.selectedOrgId === this.props.orgId &&
                         this.props.selectedMeasureId === measure.id) ? "selected" : "" }
                    onClick={ e => { if (e.target.nodeName != "A") this.props.onRowClick(measure) }}
                >
                    <th>{ measure.name }</th>
                    { cells }
                </tr>
            );
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
        );
    }
}

export default connect()(TimelineGrid);
