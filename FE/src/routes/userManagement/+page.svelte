<script>
	import { onMount } from 'svelte';
	import { axios } from '$lib/config';
	import MultiSelect from 'svelte-multiselect';
	import { goto } from '$app/navigation';
	import { toast } from '@zerodevx/svelte-toast';
	import Modal from '$lib/Modal.svelte';

	let users = [];
	let groups = [];
	let showModal = false;
	let loaded = false;
	let usernameInput;

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
			toast.push(err.response.data.message, { classes: ['error-toast'], duration: 3000 });
		}
	}

	onMount(async () => {
		await loadValues();
		loaded = true;
	});

	//fields for new inputs
	let newGroups = [];
	let newUsername = '';
	let newPassword = '';
	let newEmail = '';
	let newActive = true;
	let newGroup = '';

	// Flags to check if fields are touched
	let emailTouch = false;
	let passTouch = false;
	let activeTouch = false;
	let groupTouch = false;
	let editing = null;

	// fields for edit inputs
	let editEmail = '';
	let editPass = '';
	let editActive = true;
	let editGroup = [];
	async function createUser() {
		// check password
		if (!newUsername || !newPassword) {
			toast.push('Username or Password field empty', { classes: ['error-toast'], duration: 3000 });
			return 0;
		}
		const regex = new RegExp(/((?=.*\d)(?=.*[a-zA-Z])(?=.*[\W\_]).{8,10})/g);
		if (!regex.test(newPassword)) {
			toast.push(`Please ensure password is aplhanumeric with symbols from 8 to 10 characters`, {
				classes: ['error-toast'],
				duration: 8000
			});
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
			toast.push(err.response.data.message, { classes: ['error-toast'], duration: 3000 });
			return 0;
		}
		// Reset form fields
		newUsername = '';
		newPassword = '';
		newEmail = '';
		newGroups = [];
		newActive = true;
		toast.push('user created', { duration: 3000 });
		usernameInput.focus();
	}

	async function addGroup(event) {
		const groupRgex = new RegExp(/^[\w]+$/g);

		newGroup = event.detail.groupname;

		if (newGroup) {
			console.log('test');
			if (!groupRgex.test(newGroup)) {
				toast.push('Invalid group name', { classes: ['error-toast'], duration: 3000 });
				return 0;
			}
		} else {
			return 0;
		}
		try {
			const res = await axios.post(`/groups`, {
				groupname: newGroup
			});
			if (res.data.success) {
				groups = [...groups, newGroup];
				toast.push(newGroup + ' added to groups', { duration: 3000 });
			}
		} catch (error) {
			toast.push(error.response.data.message, { classes: ['error-toast'], duration: 3000 });
		}
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
		let msgBuffer = [];

		const emailRegex = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);
		const regex = new RegExp(/((?=.*\d)(?=.*[a-zA-Z])(?=.*[\W\_]).{8,10})/g);

		if (emailTouch && !emailRegex.test(editEmail)) {
			toast.push('This is not a valid email address', {
				classes: ['error-toast'],
				duration: 3000
			});
			return 0;
		} else if (passTouch && !regex.test(editPass)) {
			toast.push(`Please ensure password is alphanumeric with symbols from 8 to 10 charactes`, {
				classes: ['error-toast'],
				duration: 8000
			});
			return 0;
		}

		if (emailTouch && editEmail) {
			try {
				const res = await axios.patch('/users/updateEmail', {
					username: editingUser.username,
					email: editEmail
				});
				if (res.data.success) {
					editingUser.email = editEmail;
					msgBuffer.push('Email');
				}
			} catch (error) {
				if (error.response.data.message == 'Invalid Credentials') {
					goto('/login');
				}
				toast.push('email not changed', { classes: ['error-toast'], duration: 3000 });
			}
		}
		if (passTouch && editPass) {
			try {
				const res = await axios.patch('/users/updatePassword', {
					username: editingUser.username,
					password: editPass
				});
				if (res.data.success) {
					msgBuffer.push('Password');
				}
			} catch (error) {
				if (error.response.data.message == 'Invalid Credentials') {
					goto('/login');
				}
				toast.push('password not changed', { classes: ['error-toast'], duration: 3000 });
			}
		}
		if (groupTouch) {
			try {
				if (editingUser.username == 'admin' && !editingUser.group_names.includes('admin')) {
					toast.push('"admin" must always be in admin group', {
						classes: ['error-toast'],
						duration: 3000
					});
				} else {
					const res = await axios.put('/groups', {
						username: editingUser.username,
						grouplist: editingUser.group_names
					});
					if (res.data.success) {
						msgBuffer.push('Groups');
					}
				}
			} catch (err) {
				if (err.response.data.message == 'Invalid Credentials') {
					goto('/login');
				}
				toast.push('groups not changed', { classes: ['error-toast'], duration: 3000 });
			}
		}

		if (activeTouch) {
			try {
				if (editingUser.username == 'admin' && !editActive) {
					toast.push('"admin" must always be active', {
						classes: ['error-toast'],
						duration: 3000
					});
				} else {
					const res = await axios.patch('/users/updateActive', {
						username: editingUser.username,
						active: editActive
					});
					if (res.data.success) {
						msgBuffer.push('Active');
					}
				}
			} catch (err) {
				if (err.response.data.message == 'Invalid Credentials') {
					goto('/login');
				}
				toast.push('active not changed', { classes: ['error-toast'], duration: 3000 });
			}
		}
		if (msgBuffer.length > 0) {
			let con = '';
			for (let index = 0; index < msgBuffer.length; index++) {
				const msg = msgBuffer[index];
				con = con + msg + ', ';
				if (index == msgBuffer.length) {
					con = con + msg;
				}
			}
			con = con + 'has been updated';
			toast.push(con, { duration: 3000 });
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

<div style="margin: 10px;">
	<!-- Create New Group Button -->
	<h2>User Management</h2>

	<button
		class="outerBtn"
		on:click={() => (showModal = true)}
		style="float: right; margin-right:20px">Create New Group</button
	>

	<Modal bind:showModal on:newgroup_name={addGroup}>
		<h2 slot="header">Create group</h2>
	</Modal>

	<!-- User Table -->
	<table class="user-table">
		<thead>
			<tr>
				<th style="width: 15%;">Username</th>
				<th style="width: 15%;">Password</th>
				<th style="width: 18%;">Email</th>
				<th>Groups</th>
				<th style="width: 8%;">Active</th>
				<th style="width: 15%;">Action</th>
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
							<select bind:value={editActive} on:change={(e) => (activeTouch = true)}>
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
		<input type="text" placeholder="Username" bind:value={newUsername} bind:this={usernameInput} />
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
		<button class="outerBtn" type="submit">Create User</button>
	</form>
</div>

<style>
	.user-table {
		width: 100%;
		box-sizing: border-box;
		border-collapse: collapse;
		margin-bottom: 20px;
		max-height: 80vh;
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
		border-radius: 5px;
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
