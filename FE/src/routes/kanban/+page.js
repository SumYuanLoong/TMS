import { goto } from '$app/navigation';
import { axios } from '$lib/config';

import { app_name, title } from '$lib/stores.js';

let selected_app = '';
let tasks = [];
let plans = [];
let isPM = false;
let permissions = [];

export const load = async ({ depends }) => {
	depends('app:kanban');
	title.set('Kanban');
	console.log('in load');

	app_name.subscribe((app) => {
		selected_app = app;
	});
	title.set(`${selected_app} Kanban`);
	if (!selected_app) {
		console.log('nothing in store, redirecting');
		goto('/appList');
	}
	try {
		let res1 = await axios.post('/tms/tasks/all', {
			app_name: selected_app
		});
		if (res1.data.success) {
			tasks = res1.data.taskList;
		}
		tasks.forEach((task) => {
			if (!task.color) {
				task.color = '000000';
			}
		});
		let res2 = await axios.post('/tms/plans/all', {
			plan_app_acronym: selected_app
		});
		if (res2.data.success) {
			plans = res2.data.planList;
		}

		const res4 = await axios.post('/auth/role', {
			role: 'PM'
		});
		if (res4.data.success) {
			isPM = res4.data.authorised;
		}
		const res5 = await axios.post('/auth/app', {
			app_acronym: selected_app
		});
		if (res5.data.success) {
			permissions = res5.data.permissions;
		}
	} catch (error) {
		console.log(error);
	}

	return { tasks, plans, isPM, permissions };
};

export const ssr = false;
