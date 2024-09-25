<script>
	import TaskCard from '$lib/TaskCard.svelte';
	import TaskModal from '$lib/TaskModal.svelte';
	import PlanModal from '$lib/PlanModal.svelte';
	import { afterUpdate, beforeUpdate, onMount } from 'svelte';
	import { axios } from '$lib/config.js';

	// Section for loading
	export let data;
	$: tasks = data.tasks;
	let columns = {
		open: [],
		todo: [],
		doing: [],
		done: [],
		close: []
	};
	$: {
		tasks.forEach((task) => {
			if (columns[task.state]) {
				columns[task.state].push(task);
			}
		});
		columns = columns; //bit of a hack to force the columns to refresh
	}

	//Modals
	let showTaskModal = false;
	let showPlanModal = false;

	//handle additions
	async function addThang() {}
</script>

<TaskModal bind:showTaskModal on:newApp={addThang}>
	<h2 slot="header">Create Application</h2>
</TaskModal>
<PlanModal bind:showPlanModal on:newApp={addThang}>
	<h2 slot="header">Create Application</h2>
</PlanModal>
<div class="actions">
	<button on:click={() => (showTaskModal = true)} style="margin:10px">Create Task</button>
	<button on:click={() => (showPlanModal = true)} style="margin:10px">Create Plan</button>
	<button on:click={print} style="margin:10px">Plan</button>
</div>
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
	.actions {
		display: flex;
		justify-content: flex-end;
	}
	button {
		padding: 10px 20px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}
</style>
