const memory = document.getElementById("memory");

const hex = {
	0: '0',
	1: '1',
	2: '2',
	3: '3',
	4: '4',
	5: '5',
	6: '6',
	7: '7',
	8: '8',
	9: '9',
	10: 'A',
	11: 'B',
	12: 'C',
	13: 'D',
	14: 'E',
	15: 'F'
};

function ByteToStr(byte) {
	let a = Math.floor(byte/16);
	let b = byte % 16;
	return hex[a] + hex[b];
}

for (let i = 0; i < 2**11; i+=12) {
	let address = Int32ToHex(i);

	let c = "";
	for (let j = 0; j < 12; j++) {
		c += ` <span>${ByteToStr(CPU.memory[i + j])}</span>`;
	}

	memory.innerHTML += `<li>${address + c}</li>`;
}

function WriteMemUI(address, value) {
	// $("#mem-" + address).se
}