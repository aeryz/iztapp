import config from "../config";
import helpers from "../helpers";

const EventController = (() => ({

	async pullEvents() { },

	async sendEvent(event, emailListId) {
		// validate id
		if (typeof emailListId === "undefined" || emailListId === null) throw new Error(config.errors.UNFILLED_REQUIREMENTS);
		emailListId += "";
		await helpers.validate(emailListId, "id");
	},

	async sendEventToImportedEmailList(event, filePath) { }


}))();

export default EventController;
