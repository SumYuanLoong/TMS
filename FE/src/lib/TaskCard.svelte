<script>
	export let task;
</script>

<div class="task-card" style="border-color: {task.color};">
	<h3>{task.task_name}</h3>
	<p>{task.task_description}</p>
	<p>Owner: {task.task_owner}</p>
	<button on:click={() => alert(`#details-${task.task_id}`)}>View</button>
</div>

<style>
	.task-card {
		border-left: 5px solid transparent; /* Ensures that the border always exists */
		background-color: white;
		margin: 10px;
		padding: 10px;
	}
</style>
