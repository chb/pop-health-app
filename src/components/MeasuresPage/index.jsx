import React             from "react";
import PropTypes         from "prop-types";
import { connect }       from "react-redux";
import moment            from "moment";
import config            from "../../config";
import Sidebar           from "../Sidebar";
import TimelineGrid      from "../TimelineGrid";
import LineChart         from "../LineChart";
import { queryMeasures } from "../../store/measureResults";


class MeasuresPage extends React.Component
{
    static propTypes = {

        /**
         * The dispatch function is passed internally
         */
        dispatch: PropTypes.func.isRequired,

        /**
         * True if the measure results are currently being loaded
         */
        loading: PropTypes.bool,

        /**
         * The measure results data object (if available)
         */
        data: PropTypes.object,

        /**
         * Any error occurred while loading the measure results data
         */
        error: PropTypes.instanceOf(Error),

        organizations: PropTypes.array,

        payers: PropTypes.array,

        measures: PropTypes.object,

        dataSources: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.state = {
            chart: {},
            selection: {}
        };

        this.onRowClick = this.onRowClick.bind(this);
    }

    loadDataIfNeeded(prevProps) {

        // Skip if currently loading
        if (this.props.loading) {
            return false;
        }

        // Skip if organizations are not loaded yet
        if (!this.props.organizations.length) {
            return false;
        }

        // Skip if payers are not loaded yet
        if (!this.props.payers.length) {
            return false;
        }

        // Skip if measures are not loaded yet
        if (!Object.keys(this.props.measures).length) {
            return false;
        }

        // Skip if dataSources are not loaded yet
        if (!Object.keys(this.props.dataSources).length) {
            return false;
        }

        // Load if no data has been loaded yet
        if (!this.props.data) {
            return this.props.dispatch(queryMeasures());
        }

        // Detect state changes
        if (prevProps) {

            // Detect dataSource changes
            for (const id in prevProps.dataSources) {
                const ds  = prevProps.dataSources[id];
                const cur = this.props.dataSources[id];
                if (cur.selected !== ds.selected) {
                    return this.props.dispatch(queryMeasures());
                }
            }

            // Detect payer changes
            for (const ds of prevProps.payers) {
                const cur = this.props.payers.find(o => o.value === ds.value);
                if (cur.selected !== ds.selected) {
                    return this.props.dispatch(queryMeasures());
                }
            }

            // Detect organization changes
            for (const org of prevProps.organizations) {
                const cur = this.props.organizations.find(o => o.value === org.value);
                if (cur.selected !== org.selected) {
                    return this.props.dispatch(queryMeasures());
                }
            }
        }
    }

    componentDidUpdate(prevProps)
    {
        this.loadDataIfNeeded(prevProps);
    }

    componentDidMount()
    {
        this.loadDataIfNeeded();
    }

    getSelection() {
        let { orgId, measureId } = this.state.selection;

        if (!orgId) {
            orgId = Object.keys(this.props.data.organizations).shift();
        }

        let org = this.props.data.organizations[orgId];

        if (!org) {
            orgId = Object.keys(this.props.data.organizations).shift();
            org = this.props.data.organizations[orgId];
        }

        let measure;

        if (!measureId) {
            measure = org.measures[0];
        } else {
            measure = org.measures.find(o => o.id === measureId);
        }

        return { orgId, org, measure };
    }

    getChartOptions(orgData, measure) {
        const options = {
            title: {
                text: measure.name
            },
            subtitle: {
                text: orgData.description
            },
            series: [
                {
                    data : [],
                    id   : "current_year",
                    name : config.startYear + 1,
                    xAxis: "year_axis"
                },
                {
                    data : [],
                    id   : "previous_year",
                    name : config.startYear,
                    xAxis: "year_axis"
                }
            ],
            yAxis: {
                title: {
                    text: "% Patients"
                }
            }
        };

        if (measure.id === "pro") {
            Object.keys(measure.data).forEach(key => {
                const [ year, month ] = key.split("-");
                const rec = measure.data[key];
                const point = {
                    x: parseInt(month, 10) - 1,
                    y: rec.numerator,
                    name : moment(key).format("MMMM"),
                    xAxis: 0
                };
                if (year === String(config.startYear + 1)) {
                    options.series[0].data.push(point);
                }
                else if (year === String(config.startYear)) {
                    options.series[1].data.push(point);
                }
            });

            options.tooltip = {
                headerFormat : "<b>{point.key} - Average T-Score</b><hr style=\"margin: 2px 0\"/><table>",
                pointFormat  : "<tr><td style=\"color: {series.color}; text-align: right\">{series.name}: </td>" +
                    "<td style=\"text-align: right\"><b>&nbsp;{point.y}</b></td></tr>",
                valueDecimals: 0
            };

            options.yAxis.title.text = "Avg. T-Score";
        }
        else {
            Object.keys(measure.data).forEach(key => {
                const [ year, month ] = key.split("-");
                const rec = measure.data[key];
                const point = {
                    x: parseInt(month, 10) - 1,
                    y: rec.pct,
                    name : moment(key).format("MMMM"),
                    xAxis: 0
                };
                if (year === String(config.startYear + 1)) {
                    options.series[0].data.push(point);
                }
                else if (year === String(config.startYear)) {
                    options.series[1].data.push(point);
                }
            });
        }

        return options;
    }

    // Event Handlers ----------------------------------------------------------
    onRowClick(orgId, measure)
    {
        this.setState({
            selection: {
                orgId,
                measureId: measure.id
            }
        });
    }

    // Rendering methods -------------------------------------------------------
    renderStage()
    {
        const { error, loading, data } = this.props;

        if (loading) {
            return <p style={{ textAlign: "center" }}>Loading...</p>;
        }

        if (error) {
            return <pre>{ error.stack }</pre>;
        }

        if (!data) {
            return <p style={{ textAlign: "center" }}>No data to display</p>;
        }

        let { orgId, org, measure } = this.getSelection();

        const reports = [];
        for (let id in data.organizations) {
            const org = this.props.organizations.find(o => o.value === id);
            const orgData = data.organizations[id];
            if (!org.selected) continue;
            reports.push(
                <TimelineGrid
                    key={ "timeline-" + id }
                    data={ orgData }
                    org={ org }
                    orgId={ id }
                    onRowClick={ msr => this.onRowClick(id, msr) }
                    selectedOrgId={ orgId }
                    selectedMeasureId={ measure.id }
                />
            );
        }

        return (
            <>
                <LineChart key="line-chart" chartOptions={ this.getChartOptions(org, measure) }/>
                { reports }
            </>
        );
    }

    render()
    {
        return (
            <div className="row">
                <Sidebar/>
                <div className="col-9">
                    { this.renderStage() }
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        organizations: Object.keys(state.organizations).map(id => ({
            value      : id,
            label      : state.organizations[id].name,
            selected   : state.organizations[id].enabled,
            description: state.organizations[id].description
        })),
        payers: Object.keys(state.payers).map(id => ({
            value   : id,
            label   : state.payers[id].label,
            selected: state.payers[id].selected
        })),
        measures   : state.measures,
        dataSources: state.dataSources,
        data       : state.measureResults.data,
        loading    : state.measureResults.loading,
        error      : state.measureResults.error
    })
)(MeasuresPage);
