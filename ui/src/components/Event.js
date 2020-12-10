import { Fragment, Component } from "react";
import { Link, withRouter } from "react-router-dom";
import eventhub from "../lib/eventhub";

export default withRouter(class Event extends Component {
    constructor(props) {
        super(props);

        if (props.model) {
            this.state = props.model;
        }

        console.log("this.props.model: ", props.model);
    }

    async componentDidMount() {
        if (!this.state) {
            const event = await eventhub.getEvent(this.props.eventID);
            this.setState({ event });
        }

        if (!this.state.org) {
            console.log(this.state);
            
            const org = await eventhub.getOrg(this.state.event.orgID);
            
            
            this.setState({
                org,
                ...this.state,
            });
        }

        if (!this.props.preview && !this.state.announcements) {
            const announcements = await eventhub.getEventAnnouncements(this.state.event.id);
            console.log("got announcements: ", announcements);
            this.setState({
                announcements,
                ...this.state,
            });
        }
    }

    preview() {
        const tags = this.state.event.tags;
        let strTags = "";
        for (let i = 0; i < tags.length; i++) {
            if (i !== (tags.length - 1)) {
                strTags = strTags + tags[i] + ", ";
            }
            else {
                strTags = strTags + tags[i];
            }
        }

        return (
            <>
                <div className="event-preview">
                    <ul className="userFav-preview">
                        <li>
                            <h3><Link to={`/events/${this.state.event.id}`}>{this.state.event.name}</Link></h3>
                            {/*<button className="btn fave-btn" onClick={this.toggleFavorite}>&#128305;</button>*/}
                            <h6>By: <b><Link to={`/orgs/${this.state.org.id}`}>{this.state.org.name}</Link></b></h6>
                            <div className="row">
                                <div className="col-sm-12 col-md-6"><p>Date, Time: <b>{this.state.event.startTime}</b></p></div>
                                <div className="col-sm-12 col-md-6"><p>Tags: <b>{strTags}</b></p></div>
                            </div>
                        </li>
                    </ul>
                </div>
            </>
        );
    }

    previewFav() {
        return (
            <>
                <div className="event-preview">
                    <ul className="userFav-preview">
                        <li>
                            <h3><Link to={`/events/${this.state.event.id}`}>{this.state.event.name}</Link></h3>
                            <h6>By: <b><Link to={`/orgs/${this.state.org.id}`}>{this.state.org.name}</Link></b></h6>
                            <div className="row">
                                <div className="col-sm-12"><p>Date, Time: <b>{this.state.event.startTime}</b></p></div>
                            </div>
                        </li>
                    </ul>
                </div>
            </>
        );
    }

    edit() {
        let announcements = null;
        if (this.state.announcements) {
            announcements = this.state.announcements.map((a, i) => (
                <Fragment key={i}>
                <div className="form-group">
                    <label htmlFor={`announcement-${i}`}>Announcement on {a.created}</label>

                    <textarea
                        id="announcement-text"
                        className="form-control"
                        name={`annoucement-${i}`}
                        value={a.announcement}
                        onChange={(evt) => {
                            this.state.announcements[i].announcement = evt.target.value;

                            this.setState({
                                ...this.state,
                            })
                        }}
                        rows="4"
                        required
                    />
                </div>  
                
                </Fragment>
            ));
        }
        

        console.log(this.props);
        console.log(this.state);

        const submitForm = (evt) => {
            evt.preventDefault();
            this.setState({
                ...this.state,
                hasNewAnnouncement: false
            })
            // TODO: send to api
    
            this.props.history.push(`/events/${this.props.eventID}`);
        }
        // TODO: what should happen with cancel - how to remove all the changes.
        const cancelForm =(evt) => {
            evt.preventDefault();
    
            if (this.state.hasNewAnnouncement) {
                let a = this.state.announcements;
                a.shift();
                this.setState({
                    ...this.state,
                    announcements: a,
                    hasNewAnnouncement: false
                });
            }
                
    
            this.props.history.push(`/events/${this.props.eventID}`);
        }
    

        return (

            <div id="main-content" className="container-fluid">
                
                <h1>
                    Edit: {this.state.event.name}
                </h1>

                <form onSubmit={submitForm}>

                    <div className="form-group">
                        <label for="event-name">Event Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="event-name" 
                            //placeholder="Enter event name"
                            value={this.state.event.name}
                            onChange={(evt) => {
                                this.state.event.name = evt.target.value;
                                this.setState({
                                    ...this.state
                                })
                            }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label for="event-location">Located at</label>
                        <input
                            id="event-location"
                            type="text"
                            className='form-control'
                            value={this.state.event.location}
                            onChange={(evt) => {
                                this.state.event.location = evt.target.value;
                                this.setState({
                                    ...this.state
                                });
                            }}
                            required
                        />
                    </div>


                    <div className="form-group">
                        <label for="start-time">Starting at</label>
                        {/*
                        datetime-local has a widget for all mobile browsers but only on
                        chrome for desktop */}
                        <input
                            id="start-time"
                            type="datetime-local"
                            className="form-control" 
                            value={this.state.event.startTime}
                            onChange={(evt) => {
                                this.state.event.startTime = evt.target.value;

                                this.setState({
                                    ...this.state,
                                })
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label for="end-time">Until</label>
                        <input
                            id="end-time"
                            type="datetime-local" 
                            className="form-control"
                            value={this.state.event.endTime}
                            onChange={(evt) => {
                                this.state.event.endTime = evt.target.value;
                                this.setState({
                                    ...this.state
                                });
                            }}
                        /> 
                        
                    </div>

                    <div className="form-group">
                        <label for="event-description">Description</label>
                            <textarea
                                id="event-description"
                                className='form-control'
                                value={this.state.event.description}
                                onChange={(evt) => {
                                    this.state.event.description = evt.target.value;
                                    this.setState({
                                        ...this.state
                                    });
                                }}
                                rows="4"
                                required
                            />
                       
                    </div>
                    
                    
                    {!this.state.hasNewAnnouncement && (<button className="btn btn-primary announcement-button"
                        type="button"
                        onClick={() => {
                            let a = this.state.announcements;

                            if (a) {
                                a.unshift({
                                    created: new Date().toISOString(),
                                    announcement: "New announcement",
                                });

                                this.setState({
                                    ...this.state,
                                    announcements: a,
                                    hasNewAnnouncement: true,
                                });
                            }
                            
                            else {
                                this.state.announcements =  [];
                                this.state.announcements.push({
                                    created: new Date().toISOString(),
                                    announcement: "New announcement"
                                });

                                this.setState({
                                    ...this.state,
                                    hasNewAnnouncement: true
                                })

                            }

                        }}>New Announcement</button>)}
                   

                    {this.state.hasNewAnnouncement && (<button className="btn btn-primary announcement-button"
                        type="button"
                        onClick={() => {
                            let a = this.state.announcements;
                            a.shift();
                            
                            if (a.length === 0) {
                                a = null;
                            }

                            this.setState({
                                ...this.state,
                                announcements: a,
                                hasNewAnnouncement: false,
                            });
                        }}>Cancel New Announcement</button>)}

                    {/* one of these per announcement */}
                    
                    <div className="form-group">
                        {announcements}
                    </div>
                    
                    
                    <button className="btn btn-primary org-buttons" onClick={cancelForm}>
                        Cancel
                    </button>   
                    <button type="submit" className="btn btn-primary org-buttons">Submit</button>
                    
                    
                </form>
            </div>


            /*
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
                        *
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
                        *
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
                    *

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

                    {/* one of these per announcement *

                    {announcements}

                    <input className="event-edit-field" type="submit"/>

                </form>
            </div>*/
        );
    }

    handleDelete(evt) {

    }

    toggleFavorite(evt) {

    }

    imgSrc() {
        return `/api/orgs/${this.state.id}/logo`
    }

    render() {
        if (!this.state || !this.state.event || !this.state.org) {
            return <div/>;
        }

        console.log("state: ", this.state);

        if (this.props.preview) {
            return this.preview();
        }

        if  (this.props.previewFav) {
            return this.previewFav();
        }

        if (this.props.edit) {
            return this.edit()
        }

        var announcements = <div/>;
        if (this.state.announcements) {
            announcements = this.state.announcements.map((a, i) => (
                <li key={i}>
                    <h3>Announcement on {a.created}</h3>
                    <p>{a.announcement}</p>
                </li>
            ));
        }

        return (

            <div id="main-content" className="container-fluid">
                <div className="row">
                    <div className="d-none d-md-block col-sm-4">
                        <img src={this.imgSrc()} className="img-fluid"/>
                    </div>

                    <div id="organization" className="col-sm-12 col-md-8"> 
                        <h2>{this.state.event.name}</h2>
                        <div>presented by <Link to={`/orgs/${this.state.event.orgID}`}>{this.state.org.name}</Link></div>
                        <ul>
                            <li><table><tbody>
                                <tr><td> Start Date/Time: </td><td>{this.state.event.startTime}</td></tr>
                                <tr><td> End Date/Time: </td><td>{this.state.event.endTime}</td></tr>
                                <tr><td> Location: {this.state.event.location}</td></tr>
                            </tbody></table></li>
                            <li><p id="event-description">{this.state.event.description}</p></li>
                        </ul>
                    </div>
                    
                    <div className="col-sm-12">
                        <button className="btn btn-primary org-buttons">
                            <Link to={`/events/${this.state.event.id}/edit`}>Edit</Link>
                        </button>
                    <button className="btn btn-primary org-buttons" onClick={this.handleDelete}>Delete</button>
                    <button className="btn btn-primary org-buttons" onClick={this.toggleFavorite}>Favorite/Unfavorite 🔱</button>
                    </div>

                    {this.state.announcements && 
                        <div className="col-sm-12" id="events-title">
                            <h3>Announcements:</h3>
                        </div>
                    }       
                    <ol className="announcement-list">
                        {announcements}
                    </ol>
                </div>
            </div>

            /*
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
                                <Link to={`/orgs/${this.state.event.orgID}`}>{this.state.org.name}</Link>
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
            </div>*/
        );
    }
});
