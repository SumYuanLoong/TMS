<script>
	import TaskCard from '$lib/TaskCard.svelte';

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

	const columns = {
		open: [],
		todo: [],
		doing: [],
		done: [],
		close: []
	};

	tasks.forEach((task) => {
		if (columns[task.state]) {
			columns[task.state].push(task);
		}
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
