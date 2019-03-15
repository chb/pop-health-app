import React     from "react";
import PropTypes from "prop-types";
import                "./TimelineGrid.scss";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default class TimelineGrid extends React.Component
{
    static propTypes = {
        data: PropTypes.object,
        title: PropTypes.string.isRequired
    };

    static defaultProps = {
        data: {}
    };

    render()
    {
        const monthIndex = new Date().getMonth();
    
        const header = (
            <thead>
                <tr>
                    <th></th>
                    { MONTHS.map((key, i) => (
                        <th key={"th-" + i}>{ key }</th>
                    )) }
                </tr>
            </thead>
        );

        const body = Object.keys(this.props.data).map((rec, i) => (
            <tr key={i}>
                <th>{ rec }</th>
                { MONTHS.map((key, i) => (
                    <td key={i} className={[
                        i > monthIndex ? "text-muted" : null,
                        i <= monthIndex && this.props.data[rec][i] < 20 ? "table-danger" : null
                    ].filter(Boolean).join(" ")}>
                        { this.props.data[rec][i] }%
                    </td>
                )) }
            </tr>
        ));

        return (
            <div>
                <h4>{ this.props.title }</h4>
                <div className="table-responsive">
                    <table className="table table-sm table-hover timeline-grid">
                        { header }
                        <tbody>{ body }</tbody>
                    </table>
                </div>
            </div>
        )
    }
}
