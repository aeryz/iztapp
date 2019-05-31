import config from "../config";
import helpers from "../helpers";

const EventController = (() => ({

	async pullEvents() { },

	async sendEvent(event, emailListId) {
		if (typeof event === "undefined" || event === null || typeof emailListId === "undefined" || emailListId === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate email list id
		emailListId += "";
		await helpers.validate(emailListId, "id");
	},

	async sendEventToImportedEmailList(event, filePath) { }


}))();

export default EventController;
