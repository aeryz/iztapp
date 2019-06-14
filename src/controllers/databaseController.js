import config from "../config";

const DatabaseController = (() => ({

	async find(model, limit = 0, skip = 0, query = {}) {
		// validate model parameter
		if (typeof model === "undefined" || model === null || !Object.keys(config.models).includes(model)) throw new Error(config.errors.VALIDATION.INVALID_MODEL);
		model = config.models[model];
		// validate limit parameter
		limit = +limit;
		if (Number.isNaN(limit) || limit < 0 || Math.floor(limit) !== limit) throw new Error(config.errors.VALIDATION.INVALID_LIMIT);
		// validate skip parameter
		skip = +skip;
		if (Number.isNaN(skip) || skip < 0 || Math.floor(skip) !== skip) throw new Error(config.errors.VALIDATION.INVALID_SKIP);
		// validate query
		if (typeof query !== "object") throw new Error(config.errors.VALIDATION.INVALID_QUERY);

		return model.find(query).skip(skip).limit(limit).exec();
	},

	async findOneByQuery(model, query) {
		// validate model parameter
		if (typeof model === "undefined" || model === null || !Object.keys(config.models).includes(model)) throw new Error(config.errors.VALIDATION.INVALID_MODEL);
		model = config.models[model];
		// validate query
		if (typeof query !== "object") throw new Error(config.errors.VALIDATION.INVALID_QUERY);

		const wantedEntity = await model.findOne(query).exec()

		if (typeof wantedEntity === "undefined" || wantedEntity === null) throw new Error(config.errors.RECORD_NOT_FOUND);

		return wantedEntity;
	},

	async add(model, query) {
		// validate model parameter
		if (typeof model === "undefined" || model === null || !Object.keys(config.models).includes(model)) throw new Error(config.errors.VALIDATION.INVALID_MODEL);
		model = config.models[model];
		// validate query
		if (typeof query !== "object") throw new Error(config.errors.VALIDATION.INVALID_QUERY);

		// save new entity
		try {
			const newEntity = new model(query);
			await newEntity.save();
			return newEntity;
		} catch (err) {
			throw new Error(err);
		}
	},

	async update(model, query) {
		// validate model parameter
		if (typeof model === "undefined" || model === null || !Object.keys(config.models).includes(model)) throw new Error(config.errors.VALIDATION.INVALID_MODEL);
		model = config.models[model];
		// validate query
		if (typeof query !== "object") throw new Error(config.errors.VALIDATION.INVALID_QUERY);

		try {
			const updatedEntity = await model.findOneAndUpdate(
				{ _id: query._id },
				{ $set: query },
				{ returnNewDocument: true }
			);
			return query;
		} catch (err) {
			throw new Error(config.errors.UPDATE_FAILURE);
		}
	},

	async delete(model, query) {
		// validate model parameter
		if (typeof model === "undefined" || model === null || !Object.keys(config.models).includes(model)) throw new Error(config.errors.VALIDATION.INVALID_MODEL);
		model = config.models[model];
		// validate query
		if (typeof query !== "object") throw new Error(config.errors.VALIDATION.INVALID_QUERY);

		try {
			const deleteResult = await model.deleteOne(query);
			if (deleteResult.deletedCount === 0) return false;
			else return true;
		} catch (err) {
			throw new Error(config.errors.DELETE_FAILURE);
		}
	}

}))();

export default DatabaseController;
