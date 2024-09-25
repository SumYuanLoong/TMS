import { axios } from '$lib/config';
import { title } from '$lib/stores.js';

export const load = async ({ parent }) => {
	title.set('App List');
	//insert something to find if user is "PL" group and "PM" group
	await parent();
	try {
		const res = await axios.get('/tms/apps/all');
		if (res.data.success) {
			const apps = res.data.applist;
			return { apps }; // the bracket are needed
		}
	} catch (error) {
		console.log(error.response);
	}
};

export const ssr = false;
