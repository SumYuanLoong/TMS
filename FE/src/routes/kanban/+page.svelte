<script>
	import TaskCard from '$lib/TaskCard.svelte';
	import { page } from '$app/stores';
	import { afterUpdate, beforeUpdate, onMount } from 'svelte';
	import { axios } from '$lib/config.js';

	$: tasks = [];

	$: {
		tasks.forEach((task) => {
			if (columns[task.state]) {
				columns[task.state].push(task);
			}
		});
		columns = columns; //bit of a hack to force the columns to refresh
	}

	let columns = {
		open: [],
		todo: [],
		doing: [],
		done: [],
		close: []
	};

	async function onLoad(app) {
		try {
			let res1 = await axios.post('/tms/tasks/all', {
				app_name: app
			});
			console.log(res1);
			if (res1.data.success) {
				console.log(res1.data.taskList);
			}
		} catch (error) {}
	}

	onMount(async () => {
		console.log($page.state.app);
		await onLoad($page.state.app);
		tasks = [
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
	});
</script>

<div class="board">
	{#each Object.entries(columns) as [state, tasks]}
		<div class="column">
			<h2>{state.toUpperCase()}</h2>
			{#each tasks as task}
				<TaskCard {task} />
			{/each}
		</div>
	{/each}
</div>

<style>
	.board {
		display: flex;
		justify-content: space-between;
	}
	.column {
		width: 18%;
		background-color: #f0f0f0;
		padding: 10px;
	}
</style>
