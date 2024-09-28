import { goto } from '$app/navigation';
import { axios } from '$lib/config';

import { app_name, title } from '$lib/stores.js';

let selected_app = '';
let tasks = [];
let plans = [];
let isPM = false;
let isPL = false;

export const load = async ({ depends }) => {
	depends('app:kanban');
	title.set('Kanban');
	console.log('in load');

	app_name.subscribe((app) => {
		selected_app = app;
	});

	if (!selected_app) {
		console.log('nothing in store, redirecting');
		goto('/appList');
	}
	try {
		let res1 = await axios.post('/tms/tasks/all', {
			app_name: selected_app
		});
		if (res1.data.success) {
			console.log(res1.data.taskList);
			tasks = res1.data.taskList;
		}
		let res2 = await axios.post('/tms/plans/all', {
			plan_app_acronym: selected_app
		});
		if (res2.data.success) {
			console.log(res2.data.planList);
			plans = res2.data.planList;
		}
		tasks.forEach((task) => {
			if (!task.color) {
				task.color = '000000';
			}
		});

		const res3 = await axios.post('/auth/role', {
			role: 'PL'
		});
		if (res3.data.success) {
			isPL = res3.data.authorised;
		}
		const res4 = await axios.post('/auth/role', {
			role: 'PM'
		});
		if (res4.data.success) {
			isPM = res4.data.authorised;
		}
	} catch (error) {
		console.log(error);
	}

	return { tasks, plans, isPM, isPL };
};

export const ssr = false;
