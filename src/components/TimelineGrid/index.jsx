import React             from "react";
import PropTypes         from "prop-types";
import moment            from "moment";
import { connect }       from "react-redux";
import { Link }          from "react-router-dom";
import config            from "../../config";
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
        orgId: PropTypes.string,

        /**
         * The organization that is being rendered.
         */
        org: PropTypes.object,

        /**
         * The dataSources included in this grid
         */
        dataSources: PropTypes.object,

        startYear: PropTypes.number
    };

    static defaultProps = {
        data: {},
        startYear: config.startYear
    };

    static contextTypes = {
        router: PropTypes.object
    };

    render() {
        const { description, name, measures } = this.props.data;

        const headerLabels = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec"
        ];

        const bodyRows = [];
        const now = moment(config.startYear + 1 + "-01-01", "YYYY-MM-DD");

        // loop over each measure
        measures.forEach(measure => {

            const cells = [];
            let i = 0;
            for (let date in measure.data) {

                const entry      = measure.data[date];
                const dateObject = moment(date);

                let title = dateObject.format("MMM YYYY");
                let value;

                if (measure.id === "pro") {
                    title += ` - Average T-Score of ${entry.numerator} from ${entry.denominator} patients`;
                    value = entry.numerator;
                }
                else {
                    title += ` - ${entry.numerator} of ${entry.denominator} patients`;
                    value = Math.round(entry.pct);
                }
 
                const query = new URLSearchParams();
                query.set("date", dateObject.format("YYYY-MM-DD"));
                query.set("measure", measure.id);
                query.set("org", this.props.org.value);
                Object.keys(this.props.dataSources).forEach(key => {
                    if (this.props.dataSources[key].selected) {
                        query.append("ds", key);
                    }
                });

                // Values from the current year "overlap" the values from the
                // last year. We can compare them and show trends
                if (dateObject.isSame(now, "year")) {
                    cells[i % 12] = (
                        <td key={date} title={title}>
                            <Link to={`/report?${query}`}>{ value }</Link>
                        </td>
                    );
                }

                // Values from the previous year that do not yet have new data
                // for the current year
                else {
                    const newDate = moment(dateObject).add(1, "year").format("YYYY-MM");
                    if (!measure.data[newDate]) {
                        cells[i % 12] = (
                            <td key={date} title={title}>
                                <Link to={`/report?${query}`} className="text-muted">{ value }</Link>
                            </td>
                        );
                    }
                }
                i++;
            }

            if (!cells.length) {
                cells.push(
                    <td key="empty-1">-</td>,
                    <td key="empty-2">-</td>,
                    <td key="empty-3">-</td>,
                    <td key="empty-4">-</td>,
                    <td key="empty-5">-</td>,
                    <td key="empty-6">-</td>,
                    <td key="empty-7">-</td>,
                    <td key="empty-8">-</td>,
                    <td key="empty-9">-</td>,
                    <td key="empty-10">-</td>,
                    <td key="empty-11">-</td>,
                    <td key="empty-12">-</td>
                );
            }

            bodyRows.push(
                <tr
                    key={ name + "-" + measure.name }
                    className={
                        (this.props.selectedOrgId === this.props.orgId &&
                         this.props.selectedMeasureId === measure.id) ? "selected" : "" }
                    onClick={
                        e => {
                            // @ts-ignore
                            if (e.target.nodeName !== "A") {
                                this.props.onRowClick(measure);
                            }
                        }
                    }
                >
                    <th>{ measure.name } ({ measure.id === "pro" ? "T-Score" : "%"})</th>
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

export default connect(
    state => ({
        dataSources: state.dataSources,
    })
)(TimelineGrid);
