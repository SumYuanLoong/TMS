<script>
	export let task;
</script>

<div class="task-card" style="border-color: {task.color};">
	<h3>{task.name}</h3>
	<p>{task.description}</p>
	<p>Owner: {task.owner}</p>
	<button on:click={() => window.open(`#details-${task.id}`, '_blank')}>View</button>
</div>

<style>
	.task-card {
		border-left: 5px solid transparent; /* Ensures that the border always exists */
		background-color: white;
		margin: 10px;
		padding: 10px;
	}
</style>
