<script>
	export let showTaskModal; // boolean
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let dialog; // HTMLDialogElement
	let planName = '';
	let startDate = '';
	let endDate = '';
	let color = '';

	$: if (dialog && showTaskModal) dialog.showModal();

	function btnClick() {
		dispatch('newPlan', {
			planName: planName
		});
		planName = '';
		startDate = '';
		endDate = '';
		color = '';
	}
</script>
