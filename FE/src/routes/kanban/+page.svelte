<script>
	import TaskModal from '$lib/TaskModal.svelte';
	import PlanModal from '$lib/PlanModal.svelte';
	import CreateTaskModal from '$lib/CreateTaskModal.svelte';

	import { app_name } from '$lib/stores.js';
	import { axios } from '$lib/config.js';
	import { invalidate } from '$app/navigation';

	function print() {
		console.log(plans);
	}

	// Section for loading
	export let data;
	$: tasks = data.tasks;
	$: plans = data.plans;
	let plan_names = [];
	$: isPM = data.isPM;
	$: permissions = data.permissions;

	let columns = {
		Open: [],
		Todo: [],
		Doing: [],
		Done: [],
		Close: []
	};
	$: {
		//console.log('re-org tasks ' + tasks.length);
		tasks.forEach((task) => {
			if (columns[task.task_state]) {
				columns[task.task_state].push(task);
			}
		});
		columns = columns; //bit of a hack to force the columns to refresh
	}
	$: {
		console.log('plans updated');
		console.log(plans);
		plan_names = plans.map((plan) => plan.Plan_MVP_name);
	}
	$: {
		console.log('perms updated');
		console.log(permissions);
	}

	//Modals
	let showCreateModal = false;
	let showTaskModal = false;
	let showPlanModal = false;

	//handle additions
	async function addThang() {}

	async function newPlan(event) {
		console.log(event.detail);
		try {
			let res = await axios.post('/tms/plans/create', {
				plan_name: event.detail.planName,
				plan_app_acronym: $app_name,
				plan_startDate: event.detail.startDate,
				plan_endDate: event.detail.endDate,
				colour: event.detail.color
			});
			if (res.data.success) {
				plans = [
					...plans,
					{
						plan_MVP_name: event.detail.planName,
						plan_colour: event.detail.color
					}
				];
			}
		} catch (error) {
			console.log(error.response.data);
		}
	}

	async function newTask(event) {
		console.log(event.detail);
		try {
			let res = await axios.post('/tms/tasks/create', {
				plan_name: event.detail.planName,
				app_acronym: $app_name,
				task_name: event.detail.taskName,
				task_description: event.detail.taskDesc,
				input_task_notes: event.detail.taskNotes
			});
			if (res.data.success) {
				console.log('new task');
				tasks = [];
				invalidate('app:kanban');
			}
		} catch (error) {
			console.log(error.response.data);
		}
	}
</script>

<TaskModal bind:showTaskModal on:newApp={addThang}>
	<h2 slot="header">Create Application</h2>
</TaskModal>
<PlanModal bind:showPlanModal on:newPlan={newPlan}>
	<h2 slot="header">Create Application</h2>
</PlanModal>
<CreateTaskModal bind:showCreateModal on:newTask={newTask} plans={plan_names}>
	<h2 slot="header">Create New Task</h2>
</CreateTaskModal>

<div class="actions">
	{#if permissions.includes('Create')}
		<button on:click={() => (showCreateModal = true)} style="margin:10px">Create Task</button>{/if}
	{#if isPM}
		<button on:click={() => (showPlanModal = true)} style="margin:10px">Create Plan</button>
		<button on:click={print} style="margin:10px">Plan</button>{/if}
</div>
<div class="board">
	{#each Object.entries(columns) as [state, tasks]}
		<div class="column">
			<h2>{state.toUpperCase()}</h2>
			{#each tasks as task}
				<div class="task-card" style="border-color: #{task.color};">
					<h3>{task.task_name}</h3>
					<p>{task.task_description}</p>
					<p>Owner: {task.task_owner}</p>
					<button on:click={() => alert(`#details-${task.task_id}`)}>View</button>
				</div>
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
	.task-card {
		border-left: 5px solid transparent; /* Ensures that the border always exists */
		background-color: white;
		margin: 10px;
		padding: 10px;
		box-shadow: 3px 3px 3px lightblue;
	}
</style>
