
for (let i = 0; i < 2**10; i+=12) {
	let address = Int32ToHex(i);

	let c = "";
	for (let j = 0; j < 12; j++) {
		c += ` <span>${CPU.memory[i + j].toString(16)}</span>`;
	}

	$("#memory").append(`<li>${s + a + c}</li>`)
}

function WriteMemUI(address, value) {
	$("#mem-" + address).se
}