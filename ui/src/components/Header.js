import { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import libuser from "../lib/user";
import eventhub from "../lib/eventhub";
import logo from "../logo.svg";



class LoginModal extends Component {
    constructor(props) {
        super(props)

        // 0 - input email
        // 1 - input code
        this.state = {
            value: "",
            step : 0,
        };

        this.loginSubmit = this.loginSubmit.bind(this);
        this.pinSubmit = this.pinSubmit.bind(this);
    }

    async loginSubmit(evt) {
        evt.preventDefault();
        const email = this.state.value;
        await eventhub.postLogin1(email);

        console.log("step 1 successfule, setting email");

        this.setState({
            value: "",
            step: 1,
            email,
        });

        console.log("state: ", this.state);
    }

    login() {
        return (
            <div id="login-modal">
                <h1>Log In</h1>
                <form onSubmit={this.loginSubmit}>
                    <label htmlFor="login-email">Email:</label>
                    <input
                        name="login-email"
                        type="email"
                        value={this.state.value}
                        onChange={(evt) => {
                            this.setState({
                                value: evt.target.value,
                            });
                        }}/>
                    <input type="submit" />
                </form>
                <p>
                    Creating an account and logging in only requires an email. We'll send
                    you a one time password and you'll stay logged in on this device.
                </p>
            </div>
        );
    }

    async pinSubmit(evt) {
        evt.preventDefault();
        const code = this.state.value;
        var token;
        try {
            token = await eventhub.postLogin2(this.state.email, code);
        } catch (e) {
            document.querySelector(`input[name="login-otp"]`)
                .setCustomValidity("invalid code");
            return;
        }

        libuser.del();
        eventhub.setToken(token);
        this.props.onSuccess();
    }

    pin(wrong) {
        return (
            <div id="login-modal">
                <h1>Log In</h1>
                <form onSubmit={this.pinSubmit}>
                    <label htmlFor="login-otp">One Time Password</label>
                    <input
                        name="login-otp"
                        type="password"
                        value={this.state.value}
                        onChange={(evt) => {
                            this.setState({
                                value: evt.target.value,
                            });
                        }}/>
                    <input type="submit" />
                </form>
            </div>
        );
    }

    render() {
        let modal;
        switch (this.state.step) {
            case 0:
                modal =  this.login();
                break;
            case 1:
                modal =  this.pin(false);
                break;
            default:
                console.log("invalid state!!", this.state);
                return <div/>
        }

        return (<>
            {modal}
            <div id="modal-background" onClick={ this.props.onCancel }/>
        </>);
    }
}

export default withRouter(class Header extends Component {
    constructor(props) {
        super(props)

        this.state = {
            showLogin : false,
        };

        this.loginToggle = this.loginToggle.bind(this);
        this.logout = this.logout.bind(this);
        this.loggedIn = this.loggedIn.bind(this);
    }


    async componentDidMount() {
        const user = await libuser.get();
        this.setState({
            user,
            ...this.state,
        });
    }

    async loggedIn() {
        const user = await libuser.get();
        this.setState({
            user,
            showLogin: false,
        });
        window.location.reload();
    }

    loginToggle() {
        this.setState({
            showLogin: this.state.showLogin != true,
        });

        console.log(this.state.showLogin);
    }

    logout() {
        console.log("logging out");

        libuser.del();
        this.setState({
            user: null,
            showLogin: this.state.showLogin,
        });

        this.props.history.push("/");
        window.location.reload();
    }

    render() {
        const user = this.state.user;
        return (
            <header>
                <nav className="content" role="navigation">
                    <Link id="nav-title" to="/">
                        <img src={ logo } id="nav-logo" />
                        <h1>EventHub</h1>
                    </Link>

                    <ul>
                        <li>
                            <Link to="/calendar">Calendar</Link>
                        </li>
                        <li>
                            <Link to="/search">Search</Link>
                        </li>
                        {user && (
                            <li>
                                <Link to="/settings">Settings</Link>
                            </li>
                        )}
                        {user && user.email && (
                            <li>
                                <button onClick={this.logout}>Logout</button>
                            </li>
                        )}
                        {(!user || !user.email) && (
                            <li>
                                <button onClick={this.loginToggle}>Login</button>
                            </li>
                        )}
                    </ul>
                </nav>
                { this.state.showLogin && (
                    <LoginModal
                        onSuccess={this.loggedIn}
                        onCancel={this.loginToggle} />
                )}
            </header>
        );
    }
})

