let last_dom = {
	'if': null,
	'id': null,
	'exe': null,
	'mem': null,
	'wb': null,
}

function UpdateRegister(register, value, stage) {
	let id = "reg_" + register;
	const regDOM = document.getElementById(id);
	if (last_dom[stage] !== null)
		last_dom[stage].classList.remove(stage);
	regDOM.classList.add(stage);
	last_dom[stage] = regDOM;
	regDOM.lastChild.textContent = value;
}