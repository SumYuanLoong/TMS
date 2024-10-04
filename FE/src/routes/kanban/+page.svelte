<script>
	import TaskModal from '$lib/TaskModal.svelte';
	import PlanModal from '$lib/PlanModal.svelte';
	import CreateTaskModal from '$lib/CreateTaskModal.svelte';

	import { toast } from '@zerodevx/svelte-toast';
	import { app_name } from '$lib/stores.js';
	import { axios } from '$lib/config.js';
	import { goto, invalidate } from '$app/navigation';

	function print() {
		console.log(plans);
	}

	// Section for loading
	export let data;
	$: tasks = data.tasks;
	$: plans = data.plans;
	$: plan_names = [];
	$: isPM = data.isPM;
	$: permissions = data.permissions;

	let taskData = {};
	let planData = {};
	$: editMode = false;
	let flagPlan = false;
	let flagNone = true;
	let flagNotes = false;
	/**
	 * Permissions
	 * create: access create modal
	 * open: notes and plan
	 * dev: notes
	 * done: notes and plan
	 */

	let columns = {};
	$: {
		//console.log('re-org tasks ' + tasks.length);
		columns = {
			Open: [],
			Todo: [],
			Doing: [],
			Done: [],
			Closed: []
		};
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
	async function newPlan(event) {
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
						Plan_MVP_name: event.detail.planName,
						plan_colour: event.detail.color.substring(1)
					}
				];
				toast.push(event.detail.planName + ' Created', { duration: 3000 });
			}
		} catch (error) {
			console.log(error.response.data);
			if (error.response.data.message == 'Invalid Credentials') {
				goto('/login');
			}
			toast.push(error.response.data.message, { classes: ['error-toast'], duration: 3000 });
		}
	}

	async function startUpdatePlan(plan) {
		console.log(plan);
		try {
			let res = await axios.post('/tms/plans/getOne', {
				plan_app_acronym: $app_name,
				plan_name: plan.Plan_MVP_name
			});
			if (res.data.success) {
				console.log(res);
				planData = res.data.plan;
				editMode = true;
				planData.plan_startDate = dateFormating(res.data.plan.plan_startDate);
				planData.plan_endDate = dateFormating(res.data.plan.plan_endDate);
				showPlanModal = true;
			}
		} catch (error) {
			console.log(error.response.data);
			if (error.response.data.message == 'Invalid Credentials') {
				goto('/login');
			}
			toast.push(error.response.data.message, { classes: ['error-toast'], duration: 3000 });
		}
	}

	async function updatePlan(event) {
		console.log(event.detail);
		try {
			let res = await axios.put('/tms/plans/update', {
				plan_name: event.detail.planName,
				plan_app_acronym: $app_name,
				plan_startDate: event.detail.startDate,
				plan_endDate: event.detail.endDate,
				colour: event.detail.color
			});
			if (res.data.success) {
				toast.push(event.detail.planName + ' Updated', { duration: 3000 });
				invalidate('app:kanban');
			}
		} catch (error) {
			console.log(error.response.data);
			if (error.response.data.message == 'Invalid Credentials') {
				goto('/login');
			}
			toast.push(error.response.data.message, { classes: ['error-toast'], duration: 3000 });
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
				toast.push(event.detail.taskName + ' Created', { duration: 3000 });
				invalidate('app:kanban');
			}
		} catch (error) {
			console.log(error.response.data);
			if (error.response.data.message == 'Invalid Credentials') {
				goto('/login');
			}
			toast.push(error.response.data.message, { classes: ['error-toast'], duration: 3000 });
		}
	}

	// task Modal setup
	async function viewTask(task_id) {
		try {
			let res = await axios.post('/tms/tasks/getOne', {
				task_id: task_id
			});
			if (res.data.success) {
				console.log(res.data);
				taskData = res.data.task;
				if (permissions.includes(taskData.Task_state)) {
					console.log('permission matches');
					flagNone = false;
					flagNotes = true;
					if (taskData.Task_state == 'Done' || taskData.Task_state == 'Open') {
						flagPlan = true;
					} else {
						flagPlan = false;
					}
				} else {
					flagNone = true;
				}
				showTaskModal = true;
			}
		} catch (error) {
			console.log(error.response.data);
			if (error.response.data.message == 'Invalid Credentials') {
				goto('/login');
			}
			toast.push(error.response.data.message, { classes: ['error-toast'], duration: 3000 });
		}
	}

	async function saveTaskPlan(event) {
		try {
			let res = await axios.put('/tms/tasks/plan', {
				app_acronym: $app_name,
				plan_name: event.detail.planName,
				task_id: event.detail.task_id
			});
			if (res.data.success) {
				viewTask(event.detail.task_id);
				toast.push(event.detail.task_id + ' Plan Updated', { duration: 3000 });
			}
		} catch (error) {
			invalidate('app:kanban');
			toast.push(error.response.data.message, { classes: ['error-toast'], duration: 3000 });
			console.log(error);
		}
	}

	async function saveTaskNotes(event) {
		try {
			let res = await axios.put('/tms/tasks/notes', {
				task_id: event.detail.task_id,
				app_acronym: $app_name,
				new_notes: event.detail.newNotes
			});
			if (res.data.success) {
				viewTask(event.detail.task_id);
				toast.push(event.detail.task_id + ' Notes Updated', { duration: 3000 });
			}
		} catch (error) {
			invalidate('app:kanban');
			toast.push(error.response.data.message, { classes: ['error-toast'], duration: 3000 });
			console.log(error);
		}
	}

	function dateFormating(date) {
		const parts = date.split('-');
		const dd = parts[0];
		const mm = parts[1];
		const yyyy = parts[2];
		const formattedDate = `${yyyy}-${mm}-${dd}`;
		return formattedDate;
	}
	function closePlan() {
		editMode = false;
	}
</script>

<TaskModal
	bind:showTaskModal
	on:updateNotes={saveTaskNotes}
	on:updatePlan={saveTaskPlan}
	{flagNone}
	{flagNotes}
	{flagPlan}
	taskState={taskData.Task_state}
	taskID={taskData.Task_id}
	taskName={taskData.Task_name}
	taskNotes={taskData.Task_notes}
	taskDescription={taskData.Task_description}
	taskCreator={taskData.Task_creator}
	taskOwner={taskData.Task_owner}
	taskCreatedDate={taskData.Task_createDate}
	planName={taskData.Task_plan}
	plans={plan_names}
	app_acronym={$app_name}
>
	<h2 slot="header">Task Detail</h2>
</TaskModal>
<PlanModal
	bind:showPlanModal
	on:newPlan={newPlan}
	on:closePlan={closePlan}
	on:updatePlan={updatePlan}
	{editMode}
	color="#{planData.plan_colour}"
	planName={planData.Plan_MVP_name}
	startDate={planData.plan_startDate}
	endDate={planData.plan_endDate}
>
	<h2 slot="header">{editMode ? 'Update Plan' : 'Create Plan'}</h2>
</PlanModal>
<CreateTaskModal bind:showCreateModal on:newTask={newTask} plans={plan_names}>
	<h2 slot="header">Create New Task</h2>
</CreateTaskModal>

<div class="actions">
	{#if permissions.includes('Create')}
		<button on:click={() => (showCreateModal = true)} style="margin:10px">Create Task</button>{/if}
	{#if isPM}
		<button on:click={() => (showPlanModal = true)} style="margin:10px">Create Plan</button>
		<div class="dropdown-container">
			<button disabled style="margin:10px" class="">Plan</button>
			<div class="dropdown-content">
				<!-- svelte-ignore a11y-click-events-have-key-events -->
				{#each plans as plan}
					<a on:click={() => startUpdatePlan(plan)}>{plan.Plan_MVP_name}</a>
				{/each}
			</div>
		</div>
	{/if}
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
					<button on:click={() => viewTask(task.task_id)}>View</button>
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
		border-radius: 0.7em;
		border-left: 5px solid transparent; /* Ensures that the border always exists */
		background-color: white;
		margin: 10px;
		padding: 10px;
		box-shadow: 3px 3px 3px lightblue;
	}
	.dropdown-container:hover .dropdown-content {
		display: block;
		background-color: aliceblue;
		border: 1px;
		border-color: black;
	}
	.dropdown-container:hover .dropdown-content a {
		border-width: 1px;
		border-color: black;
	}

	a:hover {
		background-color: aquamarine;
	}
	.dropdown-content {
		display: none;
		position: absolute;
		right: 0;
		z-index: 1;
		min-width: 160px;
	}
	.dropdown-content a {
		color: black;
		padding: 12px 16px;
		text-decoration: none;
		display: block;
	}
</style>
