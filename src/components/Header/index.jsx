import React              from "react";
import PropTypes          from "prop-types";
import { NavLink, Route } from "react-router-dom";
import logo               from "./logo.png";
import { logout }         from "../../store/auth";
import                         "./Header.scss";

export default class Header extends React.Component {

    static propTypes = {
        user    : PropTypes.object,
        dispatch: PropTypes.func,
        loading : PropTypes.bool
    };

    render() {
        return (
            <header className="app-header navbar navbar-expand-lg">
                <div className="container collapse navbar-collapse justify-content-between">
                    <div className="navbar-brand">
                        <NavLink className="app-link" to="/measures">
                            <img src={logo} className="app-logo" alt="logo" />
                        </NavLink>
                    </div>
                    { this.props.user && (
                        <>
                            <ul className="navbar-nav justify-content-center">
                                <Route path="/measures" render={() => (
                                    <li className="nav-item">
                                        <b className="nav-link active">Measures</b>
                                    </li>
                                )} />
                                <Route path="/report" render={() => (
                                    <>
                                        <li className="nav-item">
                                            <NavLink className="nav-link" to="/measures">Measures</NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <b className="nav-link active">Report</b>
                                        </li>
                                    </>
                                )} />
                            </ul>
                            <ul className="navbar-nav">
                                <li className="nav-item text-right">
                                    <a className="nav-link" onClick={e => {
                                        e.preventDefault();
                                        this.props.dispatch(logout());
                                    }} href="/login">
                                        <i className={
                                            "fas fa-power-off" + (
                                                this.props.loading ? " fa-spin" : ""
                                            )
                                        } style={{ color: "#FA0" }}/> Logout
                                    </a>
                                </li>
                            </ul>
                        </>
                    )}
                </div>
            </header>
        );
    }
}
