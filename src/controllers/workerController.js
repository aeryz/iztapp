import DatabaseController from "./databaseController";

const WorkerController = (() => ({

	async getWorkers(limit = 0, skip = 0, query) {
		return DatabaseController.find("worker", limit, skip, query);
	}

}))();

export default WorkerController;
