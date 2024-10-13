// let testObj = [
// 	{
// 		funnyName: "test var"
// 	},
// 	{
// 		funnyName: "test car2"
// 	}
// ];

// let i = "3.12";

// try {
// 	console.log(Number.isInteger(i));
// } catch (error) {
// 	console.log("fail");
// }
// console.log(testObj[1]["funnyName"]);

// console.log(isDateAfter("20-03-2010", "20-02-2020"));

// function isDateAfter(date1, date2) {
// 	const [day1, month1, year1] = date1.split("-");
// 	const [day2, month2, year2] = date2.split("-");

// 	if (year1 > year2) {
// 		return true;
// 	} else if (year1 === year2 && month1 > month2) {
// 		return true;
// 	} else if (year1 === year2 && month1 === month2 && day1 > day2) {
// 		return true;
// 	} else {
// 		return false;
// 	}
// }

// let [val] = await pool.execute(
// 	"select exists(select 1 from application where app_acronym = ?) as app_exists",
// 	[app_acronym]
// );
// if (val[0].app_exists) {
// 	res.status(200).send("pass");
// } else {
// 	res.status(200).send("fail");
// }

const seen = new Set();
const duplicates = [1, 2, 3, 4, 5, 5];

for (const element of duplicates) {
	console.log(element);
	seen.add(element);
}
console.log(JSON.stringify(seen.values()));
