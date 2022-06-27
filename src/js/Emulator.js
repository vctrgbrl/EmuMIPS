const Emulator = {
	reg: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	memory: [0],
	pc: 0,
	ir: 0,
}

function ExecuteInstruction(instruction) {
	op = 	 instruction >> 26 & 0b111111;
	rs = 	(instruction & 0b000000_11111_00000_00000_00000_000000) >> 21
	rt = 	(instruction & 0b000000_00000_11111_00000_00000_000000) >> 16
	rd = 	(instruction & 0b000000_00000_00000_11111_00000_000000) >> 11
	shamt =	(instruction & 0b000000_00000_00000_00000_11111_000000) >> 6
	func = 	(instruction & 0b000000_00000_00000_00000_00000_111111)

	im = 	(instruction & 0b000000_00000_00000_11111_11111_111111)
	if (im & 0b10000_00000_000000)
		im |= 0b111111_11111_11111_00000_00000_000000
	addr =	(instruction & 0b000000_11111_11111_11111_11111_111111) >> 21

	switch (op) {
		case 0x00:
			switch (func) {
				case 0x20:
					Emulator.reg[rd] = Emulator.reg[rs] + Emulator.reg[rt];
					break;
				case 0x22:
					Emulator.reg[rd] = Emulator.reg[rs] - Emulator.reg[rt];
					break;
				case 0x24:
					Emulator.reg[rd] = Emulator.reg[rs] & Emulator.reg[rt];
					break;
				case 0x25:
					Emulator.reg[rd] = Emulator.reg[rs] | Emulator.reg[rt];
					break;
				case 0x00:
					Emulator.reg[rd] = Emulator.reg[rt] << shamt;
					break;
				case 0x02:
					Emulator.reg[rd] = Emulator.reg[rt] >> shamt;
					break;
				case 0x08:
					Emulator.pc = Emulator.reg[rs]; 
					break;
				default:
					break;
			}
			break;
		case 0x08:
			Emulator.reg[rt] = Emulator.reg[rs] + im;
			break;
		case 0x04:
			Emulator.pc += (Emulator.reg[rt] === Emulator.reg[rs])?im<<2:0;
			break;
		case 0x05:
			Emulator.pc += (Emulator.reg[rt] !== Emulator.reg[rs])?im<<2:0;
			break;
		case 0x23:
			// cada endereço da 'memory' guarda um byte, para carregarmos
			// uma word temos que ler 4 endereços e inverter os bytes
			// (little endian)
			let a = Emulator.memory[Emulator.reg[rs] + im + 0] << 0;
			let b = Emulator.memory[Emulator.reg[rs] + im + 1] << 8;
			let c = Emulator.memory[Emulator.reg[rs] + im + 2] << 16;
			let d = Emulator.memory[Emulator.reg[rs] + im + 3] << 24;
			Emulator.reg[rt] = a | b | c | d;
		case 0x2B:
			let x = (Emulator.reg[rt] & 0x000000FF);
			let y = (Emulator.reg[rt] & 0x0000FF00) >> 8;
			let z = (Emulator.reg[rt] & 0x00FF0000) >> 16;
			let w = (Emulator.reg[rt] & 0xFF000000) >> 24;

			Emulator.memory[Emulator.reg[rs] + im + 0] = x;
			Emulator.memory[Emulator.reg[rs] + im + 1] = y;
			Emulator.memory[Emulator.reg[rs] + im + 2] = z;
			Emulator.memory[Emulator.reg[rs] + im + 3] = w;
		case 0x02:
			Emulator.pc += addr << 2;
			break;
		case 0x03:
			Emulator.reg[31] = Emulator.pc;
			Emulator.pc += addr << 2;
			break;
		default:
			break;
	}
}