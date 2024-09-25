import { goto } from '$app/navigation';
import { axios } from '$lib/config';

import { app_name, title } from '$lib/stores.js';

let selected_app = '';
let tasks = [
	{
		id: 1,
		name: 'Task 1',
		description: 'Description 1',
		owner: 'Alice',
		state: 'todo',
		color: 'red'
	},
	{
		id: 1,
		name: 'Task 1',
		description: 'Description 1',
		owner: 'Alice',
		state: 'done',
		color: 'blue'
	},
	{
		id: 1,
		name: 'Task 1',
		description: 'Description 1',
		owner: 'Alice',
		state: 'doing',
		color: 'green'
	}
	// Add more tasks
];
let plans = [];

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
	} catch (error) {
		console.log(error);
	}

	return { tasks, plans };
};
export const ssr = false;
