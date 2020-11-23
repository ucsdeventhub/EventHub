import { Fragment, Component } from "react";
import { Link, withRouter } from "react-router-dom";

export default withRouter(class Event extends Component {
    constructor(props) {
        super(props);

        if (props.model) {
            this.state = props.model;
        }

        console.log("in cons: ", props);
    }

    componentDidMount() {
        if (!this.state) {
            this.setState({
                event: {
                    id: this.props.eventID,
                    name: "event name",
                    orgID: 2,
                    description: "event description",
                    startTime: new Date().toISOString(),
                    endTime: new Date().toISOString(),
                    tags: ["gaming", "greek"],
                    location: "price center",
                    created: new Date().toISOString(),
                    updated: new Date().toISOString(),
                },
                org: {
                    name: "org name",
                },
                announcements: [
                    {
                        date: new Date().toISOString(),
                        body: "announcement 1",
                    },
                    {
                        date: new Date().toISOString(),
                        body: "announcement 2",
                    },
                ],
            });
        }
    }

    preview(className) {
        return (
            <>
                <h2>
                    <Link to={`/events/${this.state.event.id}`}>{this.state.event.name}</Link>
                </h2>
                <table>
                    <tbody>
                        <tr>
                            <td className="event-detail-field">By: </td>
                            <td>
                                <Link to={`/orgs/${this.state.org.id}`}>{this.state.org.name}</Link>
                            </td>
                        </tr>
                        <tr>
                            <td className="event-detail-field">On: </td>
                            <td>{this.state.event.startTime}</td>
                        </tr>
                    </tbody>
                </table>
            </>
        );
    }

    edit() {
        const announcements = this.state.announcements.map((a, i) => (
            <Fragment key={i}>
                <label className="event-edit-field" htmlFor={`announcement-${i}`}>{a.date}</label>

                <textarea
                    form="event-edit-form"
                    name={`annoucement-${i}`}
                    value={a.body}
                    onChange={(evt) => {
                        this.state.announcements[i].body = evt.target.value;

                        this.setState({
                            ...this.state,
                        })
                    }}/>

            </Fragment>
        ));

            console.log(this.props);
            console.log(this.state);

        const submitForm = (evt) => {
            evt.preventDefault();
            // TODO: send to api

            this.props.history.push(`/events/${this.props.eventID}`);
        }


        return (
            <div>
                <h1>
                    Edit: {this.state.event.name}
                </h1>

                <form id="event-edit-form" onSubmit={submitForm}>
                    <label className="event-edit-field" >Event Name
                        <input
                            name="event-name"
                            type="text"
                            value={this.state.event.name}
                            onChange={(evt) => {
                                this.state.event.name = evt.target.value;

                                this.setState({
                                    ...this.state,
                                })
                            }}/>
                    </label>

                    <label className="event-edit-field">Starting at
                        {/*
                            datetime-local has a widget for all mobile browsers but only on
                            chrome for desktop
                        */}
                        <input
                            name="start-time"
                            type="datetime-local"
                            value={this.state.event.startTime}
                            onChange={(evt) => {
                                this.state.event.startTime = evt.target.value;

                                this.setState({
                                    ...this.state,
                                })
                            }}/>
                    </label>

                    <label className="event-edit-field">Until
                        {/*
                            datetime-local has a widget for all mobile browsers but only on
                            chrome for desktop
                        */}
                        <input
                            name="end-time"
                            type="datetime-local"
                            value={this.state.event.endTime}
                            onChange={(evt) => {
                                this.state.event.endTime = evt.target.value;

                                this.setState({
                                    ...this.state,
                                })
                            }}/>
                    </label>

                    <label className="event-edit-field">Located at
                        <input
                            name="location"
                            type="text"
                            value={this.state.event.location}
                            onChange={(evt) => {
                                this.state.event.location = evt.target.value;

                                this.setState({
                                    ...this.state,
                                })
                            }}/>
                    </label>

                    <label className="event-edit-field" htmlFor="description">Description</label>

                    <textarea
                        form="event-edit-form"
                        name="description"
                        value={this.state.event.description}
                        onChange={(evt) => {
                            this.state.event.description = evt.target.value;

                            this.setState({
                                ...this.state,
                            })
                        }}/>

                    {/*
                        this button is not part of the form, merely a way to interact
                        with the form, therefore it is not an input
                    */}

                    {!this.state.hasNewAnnouncement && (<button className="event-edit-field"
                        type="button"
                        onClick={() => {
                            let a = this.state.announcements;

                            a.unshift({
                                date: new Date().toISOString(),
                                body: "New announcement",
                            });


                            this.setState({
                                ...this.state,
                                announcements: a,
                                hasNewAnnouncement: true,
                            });

                        }}>New Announcement</button>)}
                    { this.state.hasNewAnnouncement && (<button className="event-edit-field"
                        type="button"
                        onClick={() => {
                            let a = this.state.announcements;
                            a.shift();

                            this.setState({
                                ...this.state,
                                announcements: a,
                                hasNewAnnouncement: false,
                            });
                        }}>Cancel New Announcement</button>)}

                    {/* one of these per announcement */}

                    {announcements}

                    <input className="event-edit-field" type="submit"/>

                </form>
            </div>
        );
    }

    render() {
        if (!this.state) {
            return <div/>;
        }

        if (this.props.preview) {
            return this.preview();
        }

        if (this.props.edit) {
            return this.edit()
        }

        const announcements = this.state.announcements.map((a, i) => (
            <li key={i}>
                <h3>{a.date}</h3>
                <p>{a.body}</p>
            </li>
        ));

        return (
            <div>
                <h1>
                    {this.state.event.name}
                </h1>
                <h2>Details</h2>
                <table>
                    <tbody>
                        <tr>
                            <td className="event-detail-field">By: </td>
                            <td>
                                <Link to={`/orgs/${this.state.org.id}`}>{this.state.org.name}</Link>
                            </td>
                        </tr>
                        <tr>
                            <td className="event-detail-field">On: </td>
                            <td>{this.state.event.startTime}</td>
                        </tr>
                        <tr>
                            <td className="event-detail-field">Until: </td>
                            <td>{this.state.event.endTime}</td>
                        </tr>
                        <tr>
                            <td className="event-detail-field">At: </td>
                            <td>{this.state.event.location}</td>
                        </tr>
                    </tbody>
                </table>

                <h2>Description</h2>
                <p>{this.state.event.description}</p>

                <h2>Announcements</h2>
                <ol>
                    {announcements}
                </ol>
            </div>
        );
    }
});
