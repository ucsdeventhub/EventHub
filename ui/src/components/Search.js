import { Fragment, Component } from "react";
import Event from "./Event";
import eventhub from "../lib/eventhub";
import queryparser from "../lib/queryparser";

export default class Search extends Component {
    constructor(props) {
        super(props);

        this.state = {
            query: "",
        };

        this.submitQuery = this.submitQuery.bind(this);
    }

    async submitQuery(evt) {
        evt.preventDefault();
        const obj = queryparser.parse(this.state.query);
        let q = obj.filters.reduce((acc, el) => {
            if (el.key === "after" && el.value === "today") {
                el.value = (new Date()).toISOString().slice(0, 10);
            }
            return `${acc}${el.key}=${el.value}&`
        }, "?");

        q += `name=${obj.query}`



        const results = await eventhub.getEventsRaw(q);
        console.log(results);
        this.setState({...this.state, results});
    }

    render() {
        let results = null;
        if (this.state.results) {
            results = this.state.results.map((event, i) => {
                return (
                    <li key={i} className="event-preview-wide no-scroll-item">
                        <Event preview model={{event}} />
                    </li>
                );
            });
        }

        // TODO: add more suggestions
        return (
            <>
                <form onSubmit={this.submitQuery}>
                    <input
                        name="event-search"
                        list="event-search-list"
                        type="text"
                        value={this.state.query}
                        onChange={(evt) => {
                            this.setState({
                                query: evt.target.value,
                            });
                        }} />
                    <datalist id="event-search-list">
                        <option value="tags:gaming" />
                        <option value="tags:greek" />
                        <option value="before:2020-12-30" />
                        <option value="after:today" />
                    </datalist>
                    <input type="submit" />
                </form>
                <ul className="no-scroll-list">
                    {results}
                </ul>
            </>
        );
    }
}
