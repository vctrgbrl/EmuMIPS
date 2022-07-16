const text_region = 0x4FF;
const CPU = {
	reg: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	memory: [],
	pc: text_region,
	// Pipeline Stages Registers
	pipeline: {
		if_id: { pc:0, ir:0 },
		id_ex: { pc:0, ir:0, reg_out_a: 0, reg_out_b: 0, imm:0, flags: {
			alu_op: 0,
			write_mem: 0,
			read_mem: 0,
			write_back: 0
		}},
		ex_mem: { pc:0, ir:0, reg_out_a: 0, reg_out_b: 0, imm:0, flags: {
			alu_op: 0,
			write_mem: 0,
			read_mem: 0,
			write_back: 0
		}},
		mem_wb: {}
	}
}

function ExecuteInstruction() {

	switch (op) {
		case 0x00:
			switch (func) {
				case 0x20:
					CPU.reg[rd] = CPU.reg[rs] + CPU.reg[rt];
					break;
				case 0x22:
					CPU.reg[rd] = CPU.reg[rs] - CPU.reg[rt];
					break;
				case 0x24:
					CPU.reg[rd] = CPU.reg[rs] & CPU.reg[rt];
					break;
				case 0x25:
					CPU.reg[rd] = CPU.reg[rs] | CPU.reg[rt];
					break;
				case 0x00:
					CPU.reg[rd] = CPU.reg[rt] << shamt;
					break;
				case 0x02:
					CPU.reg[rd] = CPU.reg[rt] >> shamt;
					break;
				case 0x08:
					CPU.pc = CPU.reg[rs]; 
					break;
				default:
					break;
			}
			break;
		case 0x08:
			CPU.reg[rt] = CPU.reg[rs] + im;
			break;
		case 0x04:
			CPU.pc += (CPU.reg[rt] === CPU.reg[rs])?im<<2:0;
			break;
		case 0x05:
			CPU.pc += (CPU.reg[rt] !== CPU.reg[rs])?im<<2:0;
			break;
		case 0x23:
			CPU.reg[rt] = ReadWord(CPU.reg[rs] + im);
			break;
		case 0x2B:
			StoreWord(CPU.reg[rs] + im, CPU.reg[rt]);
			break;
		case 0x02:
			CPU.pc += addr << 2;
			break;
		case 0x03:
			CPU.reg[31] = CPU.pc;
			CPU.pc += addr << 2;
			break;
		default:
			break;
	}
}

function InstructionFetch() {
	CPU.pipeline.if_id.ir = ReadWord(CPU.pc);
	CPU.pipeline.if_id.pc = CPU.pc;
	CPU.pc += 4;
}

function InstructionDecode() {
	instruction = CPU.pipeline.if_id.ir;

	let write_back = false;
	let wb_dest = 0;
	let read_mem = false;
	let alu_op = 0;
	let write_mem = false;

	// Instruction Decode / Register Reading
	let op = 	 instruction >> 26 & 0b111111;
	let rs = 	(instruction & 0b000000_11111_00000_00000_00000_000000) >> 21
	let rt = 	(instruction & 0b000000_00000_11111_00000_00000_000000) >> 16
	let rd = 	(instruction & 0b000000_00000_00000_11111_00000_000000) >> 11
	let shamt =	(instruction & 0b000000_00000_00000_00000_11111_000000) >> 6
	let func = 	(instruction & 0b000000_00000_00000_00000_00000_111111)
	
	let imm = 	(instruction & 0b000000_00000_00000_11111_11111_111111)
	if (imm & 0b10000_00000_000000)
		imm |= 0b111111_11111_11111_00000_00000_000000
	let addr =	(instruction & 0b000000_11111_11111_11111_11111_111111) >> 21
	
	switch (op) {
		case 0x00:
			write_back = 1;
			wb_dest = rd;
			alu_op = func;
			break;
		case 0x08: // ADDI
			// CPU.reg[rt] = CPU.reg[rs] + im;
			write_back = 1;
			wb_dest = rt;
			break;
		case 0x04: // BEQ
			CPU.pc += (CPU.reg[rt] === CPU.reg[rs])?im<<2:0;
			break;
		case 0x05: // BNQ
			CPU.pc += (CPU.reg[rt] !== CPU.reg[rs])?im<<2:0;
			break;
		case 0x23: // LW
			write_back = 1;
			read_mem = 1;
			alu_op = 0x20;
			wb_dest = rt;
			break;
		case 0x2B: // SW
			alu_op = 0x20;
			write_mem = 1;
			break;
		case 0x02: // J
			CPU.pc += addr << 2;
			break;
		case 0x03: // JAL
			CPU.reg[31] = CPU.pc;
			CPU.pc += addr << 2;
			break;
		default:
			break;
	}

	CPU.pipeline.id_ex = {
		...CPU.pipeline.if_id,
		rs, rt, rd, shamt, imm, addr,
		flags: { alu_op, write_back, write_mem, read_mem }
	};
}

function InstructionExecution() {
	let alu_out = 0;
	let in_a = CPU.pipeline.id_ex.reg_out_a;
	let in_b = CPU.pipeline.id_ex.reg_out_b;
	
	if (!CPU.pipeline.id_ex.is_r)
		in_b = CPU.pipeline.id_ex.imm;

	
	switch (CPU) {
		case 0x20:
			alu_out = rs + rt;
			break;
		case 0x22:
			alu_out = rs - rt;
			break;
		case 0x24:
			alu_out = rs & rt;
			break;
		case 0x25:
			alu_out = rs | rt;
			break;
		case 0x00:
			alu_out = rs << shamt;
			break;
		case 0x02:
			alu_out = rt >> shamt;
			break;
		default:
			break;
	}

	CPU.pipeline.ex_mem = {
		flags: CPU.pipeline.id_ex.flags,
		rt, alu_out
	}
}

function AccessMemory() {
	if (CPU.pipeline.ex_mem.write_mem) {
		StoreWord(alu_out,rt);
	}
	if (CPU.pipeline.ex_mem.flags.read_mem) {

	}
}

function PipelineClock() {
	AccessMemory();
	// UpdateMemory(?)
	InstructionExecution();
	//
	InstructionDecode();
	//
	InstructionFetch();
	//
}

function ReadWord(address) {
	let a = CPU.memory[address + 0] << 0;
	let b = CPU.memory[address + 1] << 8;
	let c = CPU.memory[address + 2] << 16;
	let d = CPU.memory[address + 3] << 24;
	return a | b | c | d;
}

function StoreWord(address, word) {
	let x = (word & 0x000000FF);
	let y = (word & 0x0000FF00) >> 8;
	let z = (word & 0x00FF0000) >> 16;
	let w = (word & 0xFF000000) >> 24;

	CPU.memory[address + 0] = x;
	CPU.memory[address + 1] = y;
	CPU.memory[address + 2] = z;
	CPU.memory[address + 3] = w;
}

for (let i = 0; i < 2**11; i++) {
	CPU.memory.push(0);
}