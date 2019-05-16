import config from "../config";

const DatabaseController = (() => ({

	async find(model, limit = 0, skip = 0, query = {}) {
		// validate model parameter
		if (typeof model === "undefined" || model === null || !Object.keys(config.models).includes(model)) throw new Error(config.errors.INVALID_MODEL);
		model = config.models[model];
		// validate limit parameter
		limit = +limit;
		if (Number.isNaN(limit) || limit < 0 || Math.floor(limit) !== limit) throw new Error(config.errors.INVALID_LIMIT);
		// validate skip parameter
		skip = +skip;
		if (Number.isNaN(skip) || skip < 0 || Math.floor(skip) !== skip) throw new Error(config.errors.INVALID_SKIP);
		// validate query
		if (typeof query !== "object") throw new Error(config.errors.INVALID_QUERY);

		return model.find(query).skip(skip).limit(limit).exec();
	},

	async findOneByQuery(model, query) {
		// validate model parameter
		if (typeof model === "undefined" || model === null || !Object.keys(config.models).includes(model)) throw new Error(config.errors.INVALID_MODEL);
		model = config.models[model];
		// validate query
		if (typeof query !== "object") throw new Error(config.errors.INVALID_QUERY);

		return model.findOne(query);
	},

	async add(model, query) {
		// validate model parameter
		if (typeof model === "undefined" || model === null || !Object.keys(config.models).includes(model)) throw new Error(config.errors.INVALID_MODEL);
		model = config.models[model];
		// validate query
		if (typeof query !== "object") throw new Error(config.errors.INVALID_QUERY);

		// save new entity
		const newEntity = new model(query);
		await newEntity.save();
		return newEntity;
	}

}))();

export default DatabaseController;
