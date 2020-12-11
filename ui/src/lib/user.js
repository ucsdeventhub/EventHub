import eventhub from "../lib/eventhub";

class User {
	async get() {
		let user = JSON.parse(localStorage.getItem("user"));

		if (!user && eventhub.getToken()) {
			// todo get user via
            user = await eventhub.getUsersSelf();
            localStorage.setItem("user", JSON.stringify(user));
            console.log("got user: ", user);
		}

		return user
	}

	async set(user) {
		// todo: validation
		localStorage.setItem("user", JSON.stringify(user));

		// todo set the user via api
        /* not currently implemented
        if (eventhub.getToken()) {
            await eventhub.putUsersSelf(user);
        }
        */
	}

	del() {
        eventhub.delToken();
		localStorage.removeItem("user");
	}

	async orgFavorites() {
		const user = await this.get();
        if (user && user.orgFavorites) {
            return user.orgFavorites;
        } else {
            return [];
        }
	}

    async addOrgFavorite(orgID) {
        const user = await this.get();
        if (!user.orgFavorites) {
            user.orgFavorites = [];
        }

        user.orgFavorites.push(orgID);
        await this.set(user);

        if (eventhub.getToken()) {
            await eventhub.putUsersOrgs(orgID);
        }
    }

    async removeOrgFavorite(orgID) {
        const user = await this.get();
        user.orgFavorites = user.orgFavorites.filter(id => id !== orgID);
        console.log(user);
        await this.set(user);

        if (eventhub.getToken()) {
            await eventhub.deleteUsersOrgs(orgID);
        }
    }

    async eventFavorites() {
        const user = await this.get();
        if (user && user.eventFavorites) {
            return user.eventFavorites;
        } else {
            return [];
        }
    }

    async addEventFavorite(eventID) {
        const user = await this.get();
        if (!user.eventFavorites) {
            user.eventFavorites = [];
        }

        user.eventFavorites.push(eventID);
        await this.set(user);

        if (eventhub.getToken()) {
            await eventhub.putUsersEvents(eventID);
        }
    }

    async removeEventFavorite(eventID) {
        const user = await this.get();
        user.eventFavorites = user.eventFavorites.filter(id => id !== eventID);
        console.log(user);
        await this.set(user);

        if (eventhub.getToken()) {
            await eventhub.deleteUsersEvents(eventID);
        }
    }

    async orgAdmins() {
        const user = await this.get();
        if (user) {
            return await eventhub.getOrgsSelf();
        } else {
            return [];
        }
    }
};

const lib = new User();

// debugging

window.removeUser = () => lib.del();
window.getUser = () => lib.get();
/*
window.setDefaultUser = () => lib.set({
	id: 1,
	email: "abc@ucsd.edu",
	tokenVersion: 1,
	tagFavorites: ["asd"],
	orgFavorites: [1, 2],
	eventFavorites: [1, 2],
});
*/


export default lib;
