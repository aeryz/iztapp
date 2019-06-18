import config from "../config";
import helpers from "../helpers";

import JSSoup from 'jssoup';
import request from 'request';
import DatabaseController from "./databaseController";

function getSingleEvent(url) {
	return new Promise((res, _) => {
		request(url, function (error, response, html) {
			// @ts-ignore
			const soup = new JSSoup(html);
			const title = soup.findAll('h2', "entry-title");
			const date = soup.findAll('ul', 'event-info__datetime');
			const context = soup.findAll('p');
			const event = {
				title: title[0].nextElement._text,
				date: date[0].nextElement.nextElement.nextElement._text,
				time: date[0].nextElement.nextElement.nextElement.nextElement.nextElement.nextElement._text,
				context: context[1].nextElement._text,
				link: url
			};
			res(event);
		})
	})
}

function getPage(url) {
	return new Promise((res, _) => {
		request(url, function (error, response, html) {
			let links = [];
			let promises = [];
			// @ts-ignore
			const soup = new JSSoup(html)
			const hrefs = soup.findAll('div', "stm-event__thumbnail");
			if (hrefs.length != 0) {
				for (var i = 0; i < hrefs.length; i++) {
					links.push(hrefs[i].nextElement.attrs.href)
				}
				for (let j = 0; j < links.length; j++) {
					promises.push(getSingleEvent(links[j]))
				}
				Promise.all(promises)
					.then((events) => {
						res(events);
					});
			}
		});
	});
}

function checkIncludesEvent(url) {
	return new Promise((res, _) => {
		request(url, function (error, response, html) {
			// @ts-ignore
			const soup = new JSSoup(html)
			const events = soup.findAll("div", "stm-events");
			res(events);
		});
	});
}


const EventController = (() => ({
	async pullEvents() {
		let promises = [];
		let events = [];
		let i = 0;
		while (true) {
			const url = "http://ceng.iyte.edu.tr/events/page/" + i + "/"
			const lengthCheckPoint = promises.length;
			await Promise.resolve(checkIncludesEvent(url)).then((result) => {
				if (result && result.length) {
					promises.push(getPage(url));
				}
			});
			i++;
			if (lengthCheckPoint === promises.length) break;
		}
		await Promise.all(promises)
			.then((pages) => {
				for (let page of pages) {
					for (let event of page) {
						events.push(event);
					}
				}
			});
		return events;
	},

	async sendEvent(event, emailListId) {
		if (typeof event === "undefined" || event === null || typeof emailListId === "undefined" || emailListId === null) throw new Error(config.errors.MISSING_PARAMETER);

		// validate email list id
		emailListId += "";
		await helpers.validate(emailListId, "id");

		const entries = await DatabaseController.find("email", 0, 0, {});

		let emails = []

		for (let entry of entries) {
			emails.push(entry.email)
		}

		helpers.sendMail(emails, {
			subject: event.title,
			text: event.context + "\n" + event.link + "\n" + event.time + "\n" + event.date
		});

	}
}))();

export default EventController;
