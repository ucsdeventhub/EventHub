import { Component } from "react";
import { Link } from "react-router-dom";
import libuser from "../lib/user";
import eventhub from "../lib/eventhub";
import lib from "../lib/user";



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
            <div id="myModal" className="modal fade">
                <div className="modal-dialog modal-login">
                    <div className="modal-content">
                        <div className="modal-header">				
                            <h4 className="modal-title">Log In Below!</h4>
                            <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        </div>
                
                        <div className="modal-body">
                            <form onSubmit={this.loginSubmit}>
                                <div className="form-group">
                                    <label htmlFor="login-email">Email:</label>
                                    <input
                                        name="login-email" 
                                        type="email" 
                                        className="form-control"
                                        value={this.state.value} 
                                        placeholder="example@ucsd.edu" 
                                        required="required"
                                        onChange={(evt) => {
                                            this.setState({
                                                value: evt.target.value,
                                            });
                                        }}/>
                                </div>
                                <div className="form-group">
                                    <button type="submit" className="btn btn-primary modal-btn">
                                        Log In
                                    </button>
                                </div>
                            </form>				
                        </div>
                
                        <div className="modal-footer">
                            <p>Creating an account and logging in only requires an email. 
                                We'll send you a one time password and you'll stay logged 
                                in on this device.
                            </p>
                        </div>
                
                    </div>
                </div>
            </div>
            /*
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
            </div>*/
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
            <div id="myModal" className="modal fade">
                <div className="modal-dialog modal-login">
                    <div className="modal-content">
                        <div className="modal-header">				
                            <h4 className="modal-title">Log In Below!</h4>
                            <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                        </div>
            
                        <div className="modal-body">
                            <form onSubmit={this.pinSubmit}>
                                <div className="form-group">
                                    <label htmlFor="login-otp">One Time Password:</label>
                                    <input
                                        name="login-otp" 
                                        type="text" 
                                        className="form-control"
                                        value={this.state.value} 
                                        required="required"
                                        onChange={(evt) => {
                                            this.setState({
                                                value: evt.target.value,
                                            });
                                        }}/>
                                </div>
                                <div className="form-group">
                                    <button type="submit" className="btn btn-primary modal-btn">
                                        Submit
                                    </button>
                                </div>
                            </form>				
                        </div>
                    </div>
                </div>
            </div>
            /*
            <div id="login-modal">
                <h1>Log In</h1>
                <form onSubmit={this.pinSubmit}>
                    <label htmlFor="login-otp">One Time Password</label>
                    <input
                        name="login-otp"
                        type="text"
                        value={this.state.value}
                        onChange={(evt) => {
                            this.setState({
                                value: evt.target.value,
                            });
                        }}/>
                    <input type="submit" />
                </form>
            </div>*/
        );
    }

    render() {
        switch (this.state.step) {
            case 0:
                return this.login();
            case 1:
                return this.pin(false);
            default:
                console.log("invalid state!!", this.state);
                return <div/>
        }
    }
}

export default class Header extends Component {
    constructor(props) {
        super(props)

        //this.state = {
        //    showLogin : false,
        //};

        //this.loginToggle = this.loginToggle.bind(this);
        this.logout = this.logout.bind(this);
        this.loggedIn = this.loggedIn.bind(this);
    }


    async componentDidMount() {
        const user = await libuser.get();
        this.setState({
            user,
            //...this.state,
        });
    }

    async loggedIn() {
        const user = await libuser.get();
        this.setState({
            user
            //showLogin: false,
        });
    }

    /*loginToggle() {
        this.setState({
            showLogin: this.state.showLogin != true,
        });

        console.log(this.state.showLogin);
    }*/

    logout() {
        console.log("logging out");

        libuser.del();
        this.setState({
            user: null
            //showLogin: this.state.showLogin,
        });
    }

    render() {
        if (!this.state) {
            return <div/>;
        }
        const user = this.state.user;
        console.log("header state: ", this.state.user);
        return (
            <header>
                <nav id="navbar" className="navbar navbar-expand-md navbar-light extendFull">
                    <div className="container-fluid">
                        <div className="navbar-header">
                            <Link to="/" className="navbar-brand">
                                <img id="logo-img" src="https://cdn.discordapp.com/attachments/771973772881690644/780461009663164459/logo.png" width="70px" height="70px"/>
                                EventHub
                            </Link>
                        </div>

                        <button id="nav-button" className="navbar-toggler" type="button" data-toggle="collapse" 
                                data-target="#navbarToggler" aria-controls="navbarToggler" 
                                aria-expanded="false" aria-label="Toggle navigation">
                                <span className="navbar-toggler-icon"></span>
                        </button>

                        <div className="collapse navbar-collapse" id="navbarToggler">
                            <ul className="navbar-nav ml-auto">
                                <li className="nav-item">
                                    <Link to="/calendar" className="nav-link">Calendar</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/search" className="nav-link">Search</Link>
                                </li>
                                {user && (
                                    <li className="nav-item">
                                        <Link to="/settings" className="nav-link">Settings</Link>
                                    </li>
                                )}
                                {user && user.email && (
                                    <li className="nav-item">
                                        <Link className="nav-link" onClick={this.logout}>Log Out</Link>
                                    </li>
                                )}
                                {(!user || !user.email) && (
                                    <li className="nav-item">
                                        <a className="nav-link" href="#myModal" data-toggle="modal">
                                            Log In
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div> 
                    </div>
                </nav>
                <LoginModal onSuccess={this.loggedIn} />
                
                {/*}
                <nav className="content" role="navigation">
                    <Link id="nav-title" to="/">
                        <img id="nav-logo" />
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
                    <LoginModal onSuccess={this.loggedIn} />
                )} */}
            </header>
        );
    }
}

