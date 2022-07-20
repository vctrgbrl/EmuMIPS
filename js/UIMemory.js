const memory = document.getElementById("memory");

let lb_0 = null;
let lb_1 = null;
let lb_2 = null;
let lb_3 = null;

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
	10: 'a',
	11: 'b',
	12: 'c',
	13: 'd',
	14: 'e',
	15: 'f'
};

function Int32ToHex(int = 0) {
	let u = new Uint32Array(1);
	u[0] = int;
	let hex = u[0].toString(16);
	let a = "";
	for (let i = 0; i < 8-hex.length; i++) {
		a += "0"
	}
	return a + hex;
}

function ByteToStr(byte) {
	let u = new Uint8Array(1);
	u[0] = byte;
	let a = Math.floor(u[0]/16);
	let b = u[0] % 16;
	return hex[a] + hex[b];
}

for (let i = 0; i < 2**11; i+=12) {
	let address = Int32ToHex(i);

	let c = "";
	for (let j = 0; j < 12; j++) {
		c += ` <span id="mem_${i+j}">${ByteToStr(CPU.memory[i + j])}</span>`;
	}

	memory.innerHTML += `<li>${address + c}</li>`;
}

function WriteWordMemUI(address, value, color=true) {
	let x = (value & 0x000000FF);
	let y = (value & 0x0000FF00) >> 8;
	let z = (value & 0x00FF0000) >> 16;
	let w = (value & 0xFF000000) >> 24;
	
	let id_0 = "mem_" + (address + 0);
	let id_1 = "mem_" + (address + 1);
	let id_2 = "mem_" + (address + 2);
	let id_3 = "mem_" + (address + 3);
	
	const byteDOM_0 = document.getElementById(id_0);
	const byteDOM_1 = document.getElementById(id_1);
	const byteDOM_2 = document.getElementById(id_2);
	const byteDOM_3 = document.getElementById(id_3);
	
	byteDOM_0.textContent = ByteToStr(x);
	byteDOM_1.textContent = ByteToStr(y);
	byteDOM_2.textContent = ByteToStr(z);
	byteDOM_3.textContent = ByteToStr(w);
	
	if (lb_0 !== null)
		lb_0.classList.remove("mem");
	if (lb_1 !== null)
		lb_1.classList.remove("mem");
	if (lb_2 !== null)
		lb_2.classList.remove("mem");
	if (lb_3 !== null)
		lb_3.classList.remove("mem");

	if(color) {
		byteDOM_0.classList.add('mem');
		byteDOM_1.classList.add('mem');
		byteDOM_2.classList.add('mem');
		byteDOM_3.classList.add('mem');
	}

	lb_0 = byteDOM_0;
	lb_1 = byteDOM_1;
	lb_2 = byteDOM_2;
	lb_3 = byteDOM_3;
}

function ClearMemory() {
	for (let i = 0; i < 2**11; i++)
		CPU.memory[i] = 0;
}