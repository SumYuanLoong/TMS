<script>
	import { onMount } from 'svelte';
	import { axios } from '$lib/config';
	import MultiSelect from 'svelte-multiselect';
	import { goto } from '$app/navigation';
	let users = [];
	let groups = [];

	let loaded = false;
	async function loadValues() {
		try {
			const Gres = await axios.get('/groups/getAll');
			if (Gres.data.success) {
				groups = [];
				//console.log(Gres.data.grouplist);
				Gres.data.grouplist.forEach((group) => {
					groups.push(group.group_name);
				});
			}
			const res = await axios.get(`/users/getall`);
			if (res.data.success) {
				//console.log(res.data.userList);
				users = res.data.userList;
			}
		} catch (err) {
			if (err.response.data.message == 'Invalid Credentials') {
				goto('/login');
			}
			console.log(err);
		}
	}

	onMount(async () => {
		await loadValues();
		loaded = true;
	});

	let newGroups = []; //change based on what the dropdown requires
	let newUsername = '';
	let newPassword = '';
	let newEmail = '';
	let newActive = true;

	// Flags to check if fields are touched
	let emailTouch = false;
	let passTouch = false;
	let activeTouch = false;
	let groupTouch = false;
	let editing = null;

	// Flags to check if fields are touched
	let editEmail = '';
	let editPass = '';
	let editActive = true;
	let editGroup = [];

	async function createUser() {
		// check password
		if (!newUsername || !newPassword) {
			alert('Username or Password field empty');
			return 0;
		}
		const regex = new RegExp(/((?=.*\d)(?=.*[a-zA-Z])(?=.*[\W\_]).{8,10})/g);
		if (!regex.test(newPassword)) {
			alert(`Please ensure password is aplhanumeric with symbols from 8 to 10 charactes`);
			return 0;
		}
		let groupsArray = [];
		newGroups.forEach((group) => {
			groupsArray.push(group);
		});

		try {
			const res = await axios.post(`/users/createUser`, {
				username: newUsername,
				password: newPassword,
				email: newEmail,
				grouplist: groupsArray,
				active: newActive
			});
			if (res.data.success) {
				// adding new user to the list
				users = [
					...users,
					{
						username: newUsername,
						password: '********', // For simplicity, we'll obfuscate the password in the table
						email: newEmail,
						group_names: groupsArray,
						active: newActive
					}
				];
			}
		} catch (err) {
			console.error(err.response.data.message);
			if (err.response.data.message == 'Invalid Credentials') {
				goto('/login');
			}
			alert(err.response.data.message);
			return 0;
		}
		// Reset form fields
		newUsername = '';
		newPassword = '';
		newEmail = '';
		newGroups = [];
		newActive = true;
		alert('user created');
	}

	function addGroup() {
		groups = [
			...groups,
			{
				label: 'kkk',
				value: 5
			}
		];
	}

	function editUser(index) {
		editing = index;
		emailTouch = false;
		passTouch = false;
		activeTouch = false;
		groupTouch = false;
		editGroup = users[index].group_names;
	}

	async function saveUser(index) {
		let editingUser = users[index];
		if (emailTouch) {
			try {
				const res = await axios.patch('/users/updateEmail', {
					username: editingUser.username,
					email: editEmail
				});
				if (res.data.success) {
					console.log(res.data);
					editingUser.email = editEmail;
					alert('email changed');
				}
			} catch (error) {
				if (err.response.data.message == 'Invalid Credentials') {
					goto('/login');
				}
				alert('email not changed');
			}
		}
		if (passTouch) {
			try {
				const res = await axios.patch('/users/updatePassword', {
					username: editingUser.username,
					password: editPass
				});
				if (res.data.success) {
					alert('password changed');
				}
			} catch (error) {
				if (err.response.data.message == 'Invalid Credentials') {
					goto('/login');
				}
				alert('password not changed');
			}
		}
		if (groupTouch) {
			try {
				const res = await axios.put('/groups', {
					username: editingUser.username,
					grouplist: editingUser.group_names
				});
				if (res.data.success) {
					alert('groups changed');
				}
			} catch (err) {
				if (err.response.data.message == 'Invalid Credentials') {
					goto('/login');
				}
				alert('groups not changed');
			}
		}

		if (activeTouch) {
			try {
				const res = await axios.patch('/users/updateActive', {
					username: editingUser.username,
					active: editActive
				});
				if (res.data.success) {
					alert('active changed');
				}
			} catch (err) {
				if (err.response.data.message == 'Invalid Credentials') {
					goto('/login');
				}
				alert('active not changed');
			}
		}

		editing = null;
		editEmail = '';
		editPass = '';
		editActive = true;
		editGroup = [];

		loadValues();
	}

	function handleCancel(index) {
		editing = null;
		users[index].group_names = editGroup;
		console.log(emailTouch);
		editEmail = '';
		editPass = '';
		editActive = true;
		editGroup = [];
	}
</script>

<div>
	<!-- Create New Group Button -->
	<h2>User Management</h2>
	<button class="outerBtn" on:click={addGroup} style="float: right; margin-right:20px"
		>Create New Group</button
	>

	<!-- User Table -->
	<table class="user-table">
		<thead>
			<tr>
				<th style="width: 10%;">Username</th>
				<th style="width: 10%;">Password</th>
				<th style="width: 12%;">Email</th>
				<th>Groups</th>
				<th style="width: 5%;">Active</th>
				<th style="width: 10%;">Action</th>
			</tr>
		</thead>
		<tbody>
			{#each users as user, index}
				<tr>
					<td>{user.username}</td>

					{#if editing === index}
						<td
							><input
								type="password"
								on:change={(e) => (passTouch = true)}
								bind:value={editPass}
								placeholder={user.password}
							/></td
						>
					{:else}
						<td>*********</td>
					{/if}

					{#if editing === index}
						<td
							><input
								type="text"
								on:change={(e) => (emailTouch = true)}
								bind:value={editEmail}
								placeholder={user.email}
							/></td
						>
					{:else}
						<td>{user.email}</td>
					{/if}

					{#if editing === index}
						<td>
							<MultiSelect
								options={groups}
								bind:selected={user.group_names}
								on:change={(e) => (groupTouch = true)}
							/>
						</td>
					{:else}
						<td><MultiSelect options={groups} selected={user.group_names} disabled /></td>
					{/if}

					{#if editing === index}
						<td>
							<select bind:value={editActive} on:change={activeTouch}>
								<option value={true}>Yes</option>
								<option value={false}>No</option>
							</select>
						</td>
					{:else}
						<td>{user.active ? 'Yes' : 'No'}</td>
					{/if}
					{#if editing == index}
						<td>
							<button on:click={() => saveUser(index)}>Save</button>
							<button on:click={() => handleCancel(index)}>Cancel</button>
						</td>
					{:else}
						<td><button on:click={() => editUser(index)}>Edit</button></td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
	<h3>Create new User</h3>
	<form on:submit|preventDefault={createUser}>
		<input type="text" placeholder="Username" bind:value={newUsername} />
		<input type="password" placeholder="Password" bind:value={newPassword} />
		<input type="text" placeholder="Email" bind:value={newEmail} />
		{#if loaded}<MultiSelect
				options={groups}
				bind:selected={newGroups}
				style="width:40%; margin: 4px"
			/>{/if}
		<select bind:value={newActive}>
			<option value={true}>Yes</option>
			<option value={false}>No</option>
		</select>
		<button class="outerBtn">Create User</button>
	</form>
</div>

<style>
	.user-table {
		width: 100%;
		box-sizing: border-box;
	}

	.user-table {
		border-collapse: collapse;
		margin-bottom: 20px;
	}

	th,
	td {
		border: 1px solid #ccc;
		padding: 4px;
		text-align: left;
	}

	th {
		background-color: #f3f3f3;
	}

	button {
		background-color: #007bff;
		color: white;
		border: none;
		padding: 10px;
		cursor: pointer;
		margin: 5px;
	}

	form {
		display: flex;
		justify-content: left;
	}
	form input,
	form select {
		margin: 4px;
	}
	.outerBtn {
		width: 200px;
	}
	button:hover {
		background-color: #0056b3;
	}
</style>
