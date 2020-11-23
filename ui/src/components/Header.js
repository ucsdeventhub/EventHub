import { Component } from "react";
import { Link } from "react-router-dom";
import libuser from "../lib/user";


export default class Header extends Component {
    constructor(props) {
        super(props)
    }

    render() {

        const user = libuser.get();

        return (
            <header>
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
                        {user && user.remote && (
                            <li>
                                <Link to="/logout">Logout</Link>
                            </li>)}
                        {(!user || !user.remote) && (
                            <li>
                                <Link to="/login">Login</Link>
                            </li>)}
                    </ul>
                </nav>
            </header>
        );
    }
}

