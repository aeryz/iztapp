import DatabaseController from "./databaseController";

const WorkerController = (() => ({

	async getWorkers(limit = 0, skip = 0, query) {
		const wantedWorkers = await DatabaseController.find("worker", limit, skip, query);
		return wantedWorkers;
	}

}))();

export default WorkerController;
