exports.promoteTask2Done = async (req, res, next) => {
	let { task_id, current_state } = req.body;

	let token = req.cookies.token;
	let decoded = await jwt.verify(token, process.env.JWT_secret);
	let username = decoded.username;

	let email, task_name, task_app_acronym;
	try {
		let [check] = await pool.execute(
			`select case when task_state = 3 then true else false end as task_is_doing
			from task where task_id = ?`,
			[task_id]
		);
		if (!check[0].task_is_doing) {
			return res.status(400).json({
				success: false,
				message:
					"Task is not in doing state and cannot be promoted to Done"
			});
		}

		let [val] = await pool.execute(
			`update task set task_state = 4, task_owner = ? where task_id = ?`,
			[username, task_id]
		);
		if (val.affectedRows === 0) {
			return res.status(500).json({
				success: false,
				message: "Task is not updated"
			});
		} else {
			if (
				await updateTaskNotes(
					username,
					"Done",
					null,
					getDatetime(),
					actions.promote,
					null,
					task_id
				)
			) {
				//need task_creator, email address, task_name,
				let [vals] = await pool.execute(
					`select u.email, t.task_name, t.task_app_acronym from task t 
				join users u on t.Task_creator = u.user_name where task_id = ?`,
					[task_id]
				);
				if (vals[0]) {
					email = vals[0].email;
					task_name = vals[0].task_name;
					task_app_acronym = vals[0].task_app_acronym;
				}
				if (!email) {
					email = "PL@tms.com";
				}

				await sendEmail(email, task_name, username, task_app_acronym);
				res.status(200).json({
					success: true
				});
			}
		}
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			message: "Database Error task not updated"
		});
	}
};

/**
 * sample usage: sendEmail(username, task_name, username, app_acronym);
 * @param {*} user task creator
 * @param {*} task_name
 * @param {*} promotor user that promoted it
 * @param {*} app_acronym
 */
async function sendEmail(email, task_name, promotor, app_acronym) {
	try {
		const info = mailer.sendMail({
			from: '"TMS" <no-reply.TMS@ethereal.email>', // sender address
			to: `${email}`, // list of receivers
			subject: `${task_name} is done`, // Subject line
			text: `${task_name} for ${app_acronym} has been promoted to the done state by ${promotor}` // plain text body
			//html: "<b>Hello world?</b>" // html body
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			success: false,
			message: "Error Sending email, Task set to Done"
		});
	}
}

function getDatetime() {
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0");
	const yyyy = today.getFullYear();
	const hours = today.getHours().toString().padStart(2, "0");
	const minutes = today.getMinutes().toString().padStart(2, "0");
	return `${dd}-${mm}-${yyyy}, ${hours}:${minutes}`;
}

/**
 * either plan, notes or action(state) will have something.
 * Idea being that
 * @param {*} username
 * @param {*} task_state
 * @param {*} task_plan
 * @param {*} dateTime
 * @param {*} action
 * @param {*} notes
 */
async function updateTaskNotes(
	username,
	task_state,
	task_plan,
	dateTime,
	action,
	notes,
	task_id
) {
	let newNotes = `${username} at ${dateTime} `;
	if (task_plan) {
		newNotes += `has changed the plan to ${task_plan}\n`;
	} else if (task_state) {
		newNotes += `has ${action} task to ${task_state}\n`;
	} else if (notes) {
		newNotes += `has added the notes: \n${notes}\n`;
	}
	newNotes += `\n######################################\n`;

	try {
		let [val] = await pool.execute(
			"update task set Task_notes = CONCAT(?, Task_notes),task_owner = ? where task_id = ?",
			[newNotes, username, task_id]
		);
		return true;
	} catch (error) {
		console.error(error);
		return false;
	}
}
