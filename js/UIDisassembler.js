const disDOM = document.getElementById("disassembler");
let last_stage_line = [];
let stages = ['if', 'id', 'exe', 'mem', 'wb'];
// const program = [
// 	0x00011020,
// 	0x00642822,
// 	0x00c74024,
// 	0x012a5825,
// 	0x000c77c0,
// 	0x001097c2,
// 	0x01000008,
// 	0x22d88000,
// 	0x8f3b7fff,
// 	0xaf9e8000,
// 	0x11fffffe,
// 	0x15490001,
// 	0x08000003,
// 	0x0c000009
// ];
let loaded_program;

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
			${Int32ToHex(word)}
		</div>
		<div>
			${Disassemble(word)}
		</div>`;
	disDOM.appendChild(line);
}

function LoadProgramIntoMemory(program) {
	loaded_program = program
	let x, y, z, w;
	for (let i = 0; i < program.length; i++) {
		StoreWord(text_region + i*4, program[i]);
		// x = (program[i] & 0x000000FF);
		// y = (program[i] & 0x0000FF00) >> 8;
		// z = (program[i] & 0x00FF0000) >> 16;
		// w = (program[i] & 0xFF000000) >> 24;
		WriteWordMemUI(text_region + i*4, program[i], false);
		// WriteMemUI(text_region + i*4 + 1, y);
		// WriteMemUI(text_region + i*4 + 2, z);
		// WriteMemUI(text_region + i*4 + 3, w);
	}
}

function DisassemblerCreateAllLines() {
	for (let i = 0; i < loaded_program.length; i++)
		DisassemblerCreateLine(i);
}

function MoveStageDOM(stage, ix) {
	let i = Math.floor( (ix - 0x4FF)/4 );

	if (last_stage_line[stage] !== undefined) {
		last_stage_line[stage].classList.remove(stages[stage]);
	}

	let id = "text_" + (ix);
	let line = document.getElementById(id);
	if (line === null)
		return
	line.classList.add(stages[stage]);
	last_stage_line[stage] = line;
}
// LoadProgramIntoMemory(program);
// DisassemblerCreateAllLines();