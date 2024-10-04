/**
 * Gets all task of the Specific app
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getAllTask = async (req, res, next) => {
	const { app_name } = req.body;
	console.log(app_name);
	if (app_name) {
		try {
			let [val1] = await pool.execute(
				"select t.task_id, t.task_name, t.task_description, t.task_owner, t.task_state, p.plan_colour as 'color' " +
					"from task t left join plan p on t.task_plan = p.plan_mvp_name and t.task_app_acronym = p.plan_app_acronym " +
					"where t.task_app_acronym = ?",
				[app_name]
			);

			res.status(200).json({
				success: true,
				taskList: val1
			});
		} catch (error) {
			return next(new ErrorObj("Error getting Tasks", 500, ""));
		}
	}
};
