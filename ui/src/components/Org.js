import { Component } from "react";

import Event from "./Event";
import eventhub from "../lib/eventhub";
import { Link, withRouter } from "react-router-dom"; 

class OrgEventList extends Component {
    constructor(props) {
        super(props)

        if (this.props.model) {
            this.state = {
                org: this.props.model
            };
        }
    }

    async componentDidMount() {
        console.log("state: ", this.state);
        console.log("props: ", this.props);
        if (!this.state) {
            const org = await eventhub.getOrg(this.props.orgID);
            this.setState({org});
        }

        if (!this.state.events) {
            const events = (await eventhub.getOrgsEvents(this.state.org.id))
                .map((evt) => {
                    return {
                        event: evt,
                        org: this.props.model,
                    };
                });
            this.setState({events, ...this.state});
        }
    }

    render() {
        if (!this.state || !this.state.events) {
            return <div/>;
        }

        const events = this.state.events.map((evt, i) => {
            console.log("event model", evt);
            return (
                <li key={i}>
                    <Event previewFav model={evt}/>
                </li>
            )
        });

        console.log(events);

        return (
            <>
                <div class="col-sm-12" id="events-title">
                    <h3>Upcoming Events:</h3>
                    <button class="btn btn-primary" id="btn-add-event">
                        Add Event
                    </button>
                </div>
                <ol>
                    {events}
                </ol>
                
            </>
        );
    }
};

export default withRouter(class Org extends Component {
    constructor(props) {
        super(props);

        // for org preview on settings page
        if (props.model) { 
            this.state = props.model;
        }
    }

    async componentDidMount() {
        console.log("eventhub: ", eventhub);
        const org = await eventhub.getOrg(this.props.orgID);
        this.setState(org);
        this.setState({
            email: "abc@ucsd.edu"
        })
    }

    imgSrc() {
        return `/api/orgs/${this.state.id}/logo`
    }

    edit() {

        const submitForm = (evt) => {
            evt.preventDefault();
            this.setState({
                ...this.state,
            })
            // TODO: send to api
    
            this.props.history.push(`/orgs/${this.state.id}`);
        }
        // TODO: what should happen with cancel - how to remove all the changes.
        const cancelForm =(evt) => {
            evt.preventDefault();
            
            // go to org page without sending any data to the api
            this.props.history.push(`/orgs/${this.state.id}`);
        }

        return (
            <div id="main-content" className="container-fluid">
                
            <h1>
                Edit: {this.state.name}
            </h1>

                <form onSubmit={submitForm}>

                    <div className="form-group">
                        <label for="org-name">Org Name</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            id="org-name" 
                            value={this.state.name}
                            onChange={(evt) => {
                                this.state.name = evt.target.value;
                                this.setState({
                                    ...this.state
                                })
                            }}
                            required
                        />
                    </div>
                   
                    <div className="form-group">
                        <label for="org-email">Contact Email</label>
                        <input
                            id="org-email"
                            type="email"
                            className="form-control" 
                            value={this.state.email}
                            onChange={(evt) => {
                                this.state.email = evt.target.value;

                                this.setState({
                                    ...this.state,
                                })
                            }}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label for="org-description">Description</label>
                        <textarea
                            id="org-description"
                            className='form-control'
                            value={this.state.description}
                            onChange={(evt) => {
                                this.state.description = evt.target.value;
                                this.setState({
                                    ...this.state
                                });
                            }}
                            rows="4"
                            required
                        />
                    </div>

                    <button className="btn btn-primary org-buttons" onClick={cancelForm}>
                        Cancel
                    </button>   
                    <button type="submit" className="btn btn-primary org-buttons">Submit</button>      

                </form>
            </div>
                            
        );
    }

    handleDelete(evt) {

    }

    toggleFavorite(evt) {

    }

    preview() {
        return (
            <div className="org-preview">
                <ul className="userFav-preview">
                    <li>
                        <h3><Link to={`/orgs/${this.state.id}`}>{this.state.name}</Link></h3>
                        {/*<button className="btn fave-btn" onClick={this.toggleFavorite}>&#128305;</button>
                        <div className="row">
                            <div className="col-sm-12">
                                <p><b>{this.state.description}</b></p>
                            </div>
        </div>*/}
                    </li>
                </ul>
            </div>
        );
    }

    render() {
        if (!this.state) {
            return <div/>;
        }

        if (this.props.edit) {
            return this.edit();
        }

        if (this.props.preview) {
            return this.preview();
        }

        console.log(this.state);

        return (
            <div id="main-content" className="container-fluid">
                <div className="row">
                    <div className="d-none d-md-block col-sm-4" id="org-image-container">
                        <img src={this.imgSrc()} class="img-fluid"/>
                    </div>
                    <div id="organization" class="col-sm-12 col-md-8"> 
                        <h2>{this.state.name}</h2>
                        <ul>
                            <li><p id="org-description">{this.state.description}</p>
                            </li>
                            <li>
                                <table><tbody>
                                    <tr>
                                        <td>Contact Email:</td>
                                        <td class="info"><a href={`mailto: ${this.state.email}`}>{this.state.email}</a></td>
                                    </tr>
                                </tbody></table>
                            </li>
                        </ul>
                    </div>
            
                    <div class="col-sm-12">
                        <button class="btn btn-primary org-buttons">
                            <Link to={`/orgs/${this.state.id}/edit`}>Edit</Link>
                        </button>
                        <button class="btn btn-primary org-buttons">Delete</button>
                        <button class="btn btn-primary org-buttons">Favorite/Unfavorite 🔱</button>
                    </div>
                </div>

                <OrgEventList model={this.state} />
                {/*
                <img src={this.imgSrc()} className="org-logo" />
                <h1>{this.state.name}</h1>
                <p>{this.state.description}</p>
                <OrgEventList model={this.state} />*/}
           
            </div>
        );
    }
});
