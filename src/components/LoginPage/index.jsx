import React        from "react";
import PropTypes    from "prop-types";
import { connect }  from "react-redux";
import { Redirect } from "react-router-dom";
import logo         from "./logo.svg";
import { login }    from "../../store/auth";

class LoginPage extends React.Component
{
    static propTypes = {
        error      : PropTypes.oneOfType([PropTypes.instanceOf(Error), PropTypes.string]),
        loading    : PropTypes.bool,
        login      : PropTypes.func.isRequired,
        currentUser: PropTypes.object
    };

    constructor(props)
    {
        super(props);

        this.state = {
            email   : "user@aco.org",
            password: "password"
        };

        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onSubmit(e)
    {
        e.preventDefault();
        this.props.login(this.state.email, this.state.password);
    }

    onChange(e)
    {
        this.setState({ [e.target.name ]: e.target.value });
    }

    render()
    {
        let { from } = this.props.location.state || { from: { pathname: "/measures" } };
        if (!from || !from.pathname || from.pathname === "/") {
            from = { pathname: "/measures" }
        }

        if (this.props.currentUser) {
            return <Redirect to={from} push />
        }

        return (
            <div className="row">
                <form className="mx-auto col-xs-12 col-sm-8 col-md-6 col-lg-4"
                    onSubmit={ this.onSubmit }>
                    { this.props.error && (
                        <div className="alert alert-danger" role="alert">
                            { String(this.props.error) }
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email1">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            id="email1"
                            placeholder="Enter email"
                            name="email"
                            value={ this.state.email }
                            onChange={ this.onChange }
                            disabled={ this.props.loading }
                        />
                        <small className="form-text text-muted">Enter "user@aco.org" or "user@payer.org"</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="password1">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password1"
                            placeholder="Password"
                            name="password"
                            value={ this.state.password }
                            onChange={ this.onChange }
                            disabled={ this.props.loading }
                        />
                        <small className="form-text text-muted">The default password is "password"</small>
                    </div>
                    <br/>
                    <button
                        disabled={ this.props.loading }
                        type="submit"
                        className="btn btn-block btn-brand active"
                    >
                        { this.props.loading && <i className="fas fa-spinner fa-spin"/> } Login
                    </button>
                    <br/>
                    <br/>
                    <p className="text-center">
                        <img src={logo} alt="BCH Logo" width="150"/>
                    </p>
                </form>
            </div>
        );
    }
}

export default connect(
    state => state.auth,
    dispatch => ({
        // @ts-ignore
        login: (email, pass) => dispatch(login(email, pass))
    })
)(LoginPage);
