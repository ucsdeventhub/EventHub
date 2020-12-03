'use strict';

const axios = require("axios");

const GET = "GET";
const POST = "POST";
const PUT = "PUT";
const DELETE = "DELETE";


class Client {
	constructor(root) {
		this.root = root;
	}

	getUrl(route) {
		return `${this.root}/api${route}`;
	}

	setToken(token) {
		localStorage.setItem("token", JSON.stringify(token));
	}

	getToken() {
		return JSON.parse(localStorage.getItem("token"));
	}

	delToken()  {
		localStorage.removeItem("token");
	}

	async request(method, route, auth, body) {

		const url = this.getUrl(route);

		let headers = {};

		if (auth) {
			const token = this.getToken();
			if (!token) {
				throw new Error("token required but user not logged in");
			}

			headers["Authorization"] = `Bearer ${token}`;
		}

		switch (method) {
		case GET:
			if (body) {
				throw new Error("cannot have body in GET request");
			}

			return (await axios.get(url, {
				headers,
			})).data;

		case DELETE:
			if (body) {
				throw new Error("cannot have body in DELETE request");
			}

			return (await axios.delete(url, {
				headers,
			})).data


		case POST:
			return (await axios.post(url, body, {
				url,
				headers,
			})).data;

		case PUT:
                console.log("PUT", headers);
			return (await axios.put(url, body, {
				url,
				headers,
			})).data;

		default:
			throw new Error(`unknown method ${method}`);
		}
	}

	async postLogin1(email) {
		const route = `/login?email=${email}`;
		await this.request(POST, route);
	}

	async postLogin2(email, code) {
		const route = `/login?email=${email}&code=${code}`;
		return await this.request(POST, route);
	}

	async getOrgs(tags, limit, offset) {
		let args = [];

		if (tags && tags.length > 0) {
			args.push(`tags=${tags.join(",")}`);
		}

		if (limit) {
			args.push(`limit=${limit}`);
		}

		if (offset) {
			args.push(`offset=${offset}`);
		}

		let route = "/orgs";

		if (args.length > 0 ) {
			route += `?${args.join("&")}`;
		}

		return await this.request(GET, route);
	}

	async getEventsRaw(query) {
		let route = "/events";

		return await this.request(GET, `${route}${query}`);
	}

	async getEvents(orgs, tags, before, after, limit, offset) {
		console.log("/events orgs tags", orgs, tags)
		let args = [];

		if (orgs && orgs.length > 0) {
			args.push(`orgs=${orgs.join(",")}`);
		}

		if (tags && tags.length > 0) {
			args.push(`tags=${tags.join(",")}`);
		}

		if (before) {
			args.push(`before=${before.toISOString().substring(0, 10)}`);
		}

		if (after) {
			args.push(`after=${after.toISOString().substring(0, 10)}`);
		}

		if (limit) {
			args.push(`limit=${limit}`);
		}

		if (offset) {
			args.push(`offset=${offset}`);
		}

		console.log("/events args", args);
		let route = "/events";

		if (args.length > 0 ) {
			route += `?${args.join("&")}`
		}

		return await this.request(GET, route);
	}

	async getEventsTrending() {
		let route = "/events/trending";

		return await this.request(GET, route);
	}

	async getEvent(id) {
		const route = `/events/${id}`
		return await this.request(GET, route);
	}

	async getEventAnnouncements(id) {
		const route = `/events/${id}/announcements`
		return await this.request(GET, route);

	}

	async getOrg(id) {
		const route = `/orgs/${id}`;
		return await this.request(GET, route);
	}

	async getOrgsEvents(orgID) {
		return await this.getEvents([orgID]);
	}

	async getOrgsSelf() {
		const route = "/orgs/self";

		return await this.request(GET, route, true);
	}

	async getUsersSelf() {
		const route = "/users/self";

		return await this.request(GET, route, true);
	}

    async postOrgEvent(event) {
        const route = `/org/${event.orgID}/events`

		return await this.request(POST, route, true, event);
    }
    async putEvent(event) {
        const route = `/events/${event.id}`

		return await this.request(PUT, route, true, event);
    }

    async putEventAnnouncements(eventId, ann) {
        console.log("putAnn: ", eventId);
        const route = `/events/${eventId}/announcements`
        console.log(route);

		return await this.request(PUT, route, true, ann || []);
    }

    async putOrg(org) {
        const route = `/orgs/${org.id}`

		return await this.request(PUT, route, true, org);
    }

}

window.c = new Client(window.location.origin);

export default window.c;

/*
const c = new Client("http://localhost:8080");

// print promise
const pp = (p) => {
	p.then(console.log);
}

pp(c.getOrgs(["greek"]));

pp(c.getEvents([1, 2], ["gaming"]));
*/
