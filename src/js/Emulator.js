const text_region = 0x4FF;
const CPU = {
	reg: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	memory: [],
	pc: text_region,
	// Pipeline Stages Registers
	pipeline: {
		if_id: { pc:0, ir:0 },
		id_ex:{
			pc: 0, ir: 0, rs: 0, rt: 0, rd: 0, shamt: 0, imm: 0, addr: 0, is_i: false,
			alu_op: 0, write_back: false, write_mem:false, read_mem: false, wb_dest: 0
		},
		ex_mem: {
			pc: 0, ir: 0,
			wb_dest: 0, 
			rt: 0, alu_out: 0, write_mem: false, read_mem: false, write_back: false
		},
		mem_wb: {
			pc: 0, ir: 0,
			wb_dest: 0,
			wb_data: 0,
			write_back: false
		}
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
	// CPU.pc += 4;
}

function InstructionDecode() {
	instruction = CPU.pipeline.if_id.ir;
	let pc = CPU.pipeline.if_id.pc;

	let write_back = false;
	let wb_dest = 0;
	let read_mem = false;
	let alu_op = 0;
	let write_mem = false;
	let is_i = false;

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
			write_back = true;
			alu_op = 0x20;
			wb_dest = rt;
			is_i = true;
			break;
		case 0x04: // BEQ
			CPU.pc += (CPU.reg[rt] === CPU.reg[rs])?imm<<2:0;
			break;
		case 0x05: // BNQ
			CPU.pc += (CPU.reg[rt] !== CPU.reg[rs])?imm<<2:0;
			break;
		case 0x23: // LW
			write_back = true;
			read_mem = true;
			alu_op = 0x20;
			wb_dest = rt;
			is_i = true;
			break;
		case 0x2B: // SW
			alu_op = 0x20;
			write_mem = true;
			is_i = true;
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
		pc, ir: instruction,
		rs, rt, rd, shamt, imm, addr, is_i,
		alu_op, write_back, write_mem, read_mem, wb_dest
	};
}

function InstructionExecution() {
	let alu_out = 0;
	let { pc, ir, rs, rt, rd, shamt, imm, addr, alu_op, is_i,
		write_back, write_mem, read_mem, wb_dest } = CPU.pipeline.id_ex;
	
	let in_a = CPU.reg[rs];
	let in_b = CPU.reg[rt];

	if (is_i) {
		in_b = imm;
	}
	
	switch (alu_op) {
		case 0x20:
			alu_out = in_a + in_b;
			break;
		case 0x22:
			alu_out = in_a - in_b;
			break;
		case 0x24:
			alu_out = in_a & in_b;
			break;
		case 0x25:
			alu_out = in_a | in_b;
			break;
		case 0x00:
			alu_out = CPU.reg[rt] << shamt;
			break;
		case 0x02:
			alu_out = CPU.reg[rt] >> shamt;
			break;
		default:
			break;
	}

	CPU.pipeline.ex_mem = {
		pc, ir, wb_dest, rt, alu_out, write_mem, read_mem, write_back
	}
}

function AccessMemory() {
	let { pc, ir, wb_dest, write_back, rt, alu_out, write_mem, read_mem } = CPU.pipeline.ex_mem;
	let wb_data = alu_out;
	if (write_mem) {
		StoreWord(alu_out,rt);
	}
	if (read_mem) {
		let w = ReadWord(alu_out);
		wb_data = w;
	}

	CPU.pipeline.mem_wb = {
		pc, ir,
		wb_dest,
		write_back,
		wb_data
	}
}

function WriteBack() {
	let { write_back, wb_dest, wb_data } = CPU.pipeline.mem_wb;
	if (write_back)
		CPU.reg[wb_dest] = wb_data;
}

function PipelineClock() {
	WriteBack();
	MoveStageDOM(4, CPU.pipeline.mem_wb.pc);
	
	AccessMemory();
	MoveStageDOM(3, CPU.pipeline.ex_mem.pc);
	// UpdateMemory(?)
	InstructionExecution();
	MoveStageDOM(2, CPU.pipeline.id_ex.pc);
	//
	InstructionDecode();
	MoveStageDOM(1, CPU.pipeline.id_ex.pc);
	//
	InstructionFetch();
	MoveStageDOM(0, CPU.pipeline.if_id.pc);
	CPU.pc += 4;
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