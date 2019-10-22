import React                     from "react";
import PropTypes                 from "prop-types";
import { connect }               from "react-redux";
import moment                    from "moment";
import Sidebar                   from "../Sidebar";
import Dropdown                  from "../Dropdown";
import TimelineGrid              from "../TimelineGrid";
import LineChart                 from "../LineChart";
import { toggle as toggleOrg   } from "../../store/organizations";
import { toggle as togglePayer } from "../../store/payers";
import { queryMeasures }         from "../../store/measureResults";

const Highcharts = window.Highcharts;

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

        const org = this.props.data.organizations[orgId];

        let measure;

        if (!measureId) {
            measure = org.measures[0];
        } else {
            measure = org.measures.find(o => o.id === measureId);
        }

        return { orgId, org, measure };
    }

    getChartOptions(orgId, orgData, measure) {
        const series = [
            {
                data: [],
                id  : "current_year",
                name: "Current Year",
                xAxis: "year_axis"
            },
            {
                data: [],
                id  : "previous_year",
                name: "Previous Year",
                xAxis: "year_axis"
            }
        ];

        const now = moment().utc();
        const thisYear = now.format("YYYY");
        const thisMonth = now.month();

        let lastPct = 0;
        let lastPct2 = 0;

        Object.keys(measure.data).forEach(key => {
            const [ year, month ] = key.split("-");
            const rec = measure.data[key];
            const point = {
                x: month * 1 - 1,
                y: rec.pct,
                name : moment(key).format("MMMM"),
                xAxis: 0
            };
            if (year === thisYear) {
                series[0].data.push(point);

                if (month * 1 === thisMonth) {
                    lastPct = rec.pct;
                    // point.drilldown = "Month";
                }
            }
            else if (year * 1 === thisYear - 1) {
                if (+month - 1 === thisMonth) {
                    point.drilldown = "Month_last_year";
                    lastPct2 = rec.pct;
                }
                series[1].data.push(point);
            }
        });

        // Add some extra points for the current month
        series[0].data.push({
            x: thisMonth,
            y: lastPct + 6 - (6 *  Math.random()),
            xAxis: 0,
            name: moment().format("MMMM"),
            color: "#900",
            drilldown: "Month"
        });

        // Set up the drill-down data for the last month
        let day1 = moment().utc().startOf("month");
        const drilldownSeries1 = {
            id    : "Month",
            name  : moment().format("MMMM YYYY"),
            data  : [],
            type  : "areaspline",
            xAxis : 1,
            color : "rgb(200, 100, 100)",
            shadow: true,
            fillColor: {
                linearGradient: { x1: 0, x2: 0, y1: 0, y2: 1 },
                stops: [
                    [
                        0,
                        Highcharts.color("rgb(200, 100, 100)").setOpacity(0.35).get()
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
        };

        const drilldownSeries2 = {
            name     : moment().subtract(1, "year").format("MMMM YYYY"),
            id       : "Month_last_year",
            xAxis    : 1,
            data     : [],
            dashStyle: "ShortDot",
            color    : "#555",
            lineWidth: 2,
            marker: {
                enabled: false
            }
        };

        const diff = lastPct2 - lastPct;

        while (day1.isSameOrBefore(moment(now).endOf("month"), "day")) {
            if (day1.isSame(moment(now).endOf("month"), "day")) {
                drilldownSeries2.data.push({
                    x: +day1,
                    y: lastPct2
                });
            } else {
                drilldownSeries2.data.push({
                    x: +day1,
                    y: lastPct + diff * Math.random()
                });
            }
            if (day1.isSameOrBefore(now, "day")) {
                drilldownSeries1.data.push({
                    x: +day1,
                    y: lastPct + diff - diff * 2 * Math.random()
                });
            }
            day1.add(1, "day");
        }

        return {
            title: {
                text: measure.name
            },
            subtitle: {
                text: orgData.description
            },
            series,
            drilldown: {
                series: [ drilldownSeries1, drilldownSeries2 ]
            }
        };
    }

    // Event Handlers ----------------------------------------------------------
    onRowClick(orgId, orgData, measure)
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
                    onRowClick={ msr => this.onRowClick(id, orgData, msr) }
                    selectedOrgId={ orgId }
                    selectedMeasureId={ measure.id }
                />
            );
        }

        return (
            <>
                <LineChart key="line-chart" chartOptions={ this.getChartOptions(orgId, org, measure) }/>
                <div style={{
                    maxHeight: "calc(100vh - 210px)",
                    overflow: "auto"
                }}>
                    { reports }
                </div>
            </>
        );
    }

    render()
    {
        return (
            <div className="row">
                <Sidebar/>
                <div className="col-9">
                    <div className="row align-items-center">
                        <div className="col">
                            <div className="row">
                                <div className="col">
                                    <label>Payer</label>
                                    <Dropdown
                                        label="All Payers"
                                        value={ null }
                                        onSelect={id => this.props.dispatch(togglePayer(id))}
                                        options={this.props.payers}
                                    />
                                </div>
                                <div className="col">
                                    <label>Organization</label>
                                    <Dropdown
                                        multiple
                                        label="Organizations"
                                        onSelect={id => this.props.dispatch(toggleOrg(id))}
                                        options={this.props.organizations}
                                    />
                                </div>
                                <div className="col">
                                    <label>Clinic</label>
                                    <Dropdown
                                        label="All Clinics"
                                        value={ null }
                                        onSelect={() => 1}
                                        options={[
                                            {
                                                label: "All Clinics",
                                                description: "Show results from all clinics",
                                                value: null
                                            }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="col-3 align-self-end">
                            <br/>
                            <button className="btn btn-brand active btn-block">Update</button>
                        </div>
                    </div>
                    <br/>
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
