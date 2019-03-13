import React       from "react";
// import { connect } from "react-redux";
import { NavLink } from "react-router-dom";
import logo        from "./logo.png";
import { logout }  from "../../store/auth";
import                  "./Header.scss";

export default class Header extends React.Component {
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
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/measures">Measures</NavLink>
                                </li>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/report">Report</NavLink>
                                </li>
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

// connect(
//     state => ({}),
//     dispatch => ({ logout: () => dispatch(logout()) })
// )(Header);