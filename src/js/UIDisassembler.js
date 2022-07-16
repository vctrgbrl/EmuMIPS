const disDOM = document.getElementById("disassembler");
let last_pc_line;
const program = [
	0x00011020,
	0x00642822,
	0x00c74024,
	0x012a5825,
	0x000c77c0,
	0x001097c2,
	0x01000008,
	0x22d88000,
	0x8f3b7fff,
	0xaf9e8000,
	0x11fffffe,
	0x15490001,
	0x08000003,
	0x0c000009
];

function Int32ToHex(int = 0) {
	let a = int.toString(16);
	let hex = "0x";
	for (let i = 0; i < 8 - a.length; i++)
		hex += "0";
	return hex + a;
}

function DisassemblerCreateLine(i) {
	const line = document.createElement("li");
	const word = ReadWord(text_region + i*4);
	line.id = 'text_' + (text_region + i*4);
	line.classList.add("line");
	line.innerHTML = `
		<div>
			${Int32ToHex(text_region + i*4)}
		</div>
		<div>
			${word}
		</div>
		<div>
			${Disassemble(word)}
		</div>`;
	disDOM.appendChild(line);
}

function LoadProgramIntoMemory(program) {
	for (let i = 0; i < program.length; i++)
		StoreWord(text_region + i*4, program[i]);
}

function DisassemblerCreateAllLines() {
	for (let i = 0; i < program.length; i++)
		DisassemblerCreateLine(i);
}

function MovePCDOM() {
	let i = Math.floor( (CPU.pc - 0x4FF)/4 );
	if (last_pc_line !== undefined) {
		last_pc_line.classList.remove("pc");
	}
	let id = "text_" + (text_region + i*4);
	let line = document.getElementById(id);
	line.classList.add("pc");
	last_pc_line = line;
}
LoadProgramIntoMemory(program);
DisassemblerCreateAllLines();