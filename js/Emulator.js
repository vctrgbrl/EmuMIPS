// Esse arquivo tem tudo à respeito da execução do programa

const text_region = 0x000;
const stack_region = 0x800;
const CPU = {
	reg: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,stack_region,0,0],
	memory: [],
	pc: text_region,
	// Pipeline Stages Registers
	pipeline: {
		if_id: { pc:0, ir:0 },
		id_ex:{
			pc: 0, ir: 0, rt: 0, shamt: 0, in_a: 0, in_b: 0, is_i: false,
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
		},
		wb: {
			pc:0, ir:0
		}
	}
}

function InstructionFetch() {
	CPU.pipeline.if_id.ir = ReadWord(CPU.pc);
	CPU.pipeline.if_id.pc = CPU.pc;
	// CPU.pc += 4;
}

function InstructionDecode() {
	let instruction = CPU.pipeline.if_id.ir;
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
	let addr =	(instruction & 0b000000_11111_11111_11111_11111_111111)

	let in_a = CPU.reg[rs];
	let in_b = CPU.reg[rt];

	let use_rs = true;
	let use_rt = false;
	
	switch (op) {
		case 0x00:
			if (func === 0x08) { // JR
				CPU.pc = CPU.reg[rs];
				break;
			}
			write_back = 1;
			wb_dest = rd;
			alu_op = func;
			use_rt = true;
			break;
		case 0x08: // ADDI
			// CPU.reg[rt] = CPU.reg[rs] + im;
			write_back = true;
			alu_op = 0x20;
			wb_dest = rt;
			in_b = imm;
			break;
		case 0x04: // BEQ
			CPU.pc += (CPU.reg[rt] === CPU.reg[rs])?imm<<2:0;
			use_rt = true;
			break;
			case 0x05: // BNQ
			CPU.pc += (CPU.reg[rt] !== CPU.reg[rs])?imm<<2:0;
			use_rt = true;
			break;
		case 0x23: // LW
			write_back = true;
			read_mem = true;
			alu_op = 0x20;
			wb_dest = rt;
			is_i = true;
			in_b = imm;
			break;
		case 0x2B: // SW
			alu_op = 0x20;
			write_mem = true;
			is_i = true;
			in_b = imm;
			break;
		case 0x02: // J
			CPU.pc = (addr << 2) + text_region;
			use_rs = false;
			break;
		case 0x03: // JAL
			wb_dest = 31;
			write_back = true;
			use_rs = false;
			in_a = CPU.pc;
			in_b = 0;
			alu_op = 0x20;
			CPU.pc = (addr << 2) + text_region;
			break;
		default:
			break;
	}

	if (use_rs)
		UpdateRegister(rs, in_a, 'id');
	if (use_rt)
		UpdateRegister(rt, in_b, 'id');
	
	CPU.pipeline.id_ex = {
		pc, ir: instruction,
		rt: CPU.reg[rt], shamt, in_a, in_b,
		alu_op, write_back, write_mem, read_mem, wb_dest
	};
}

function InstructionExecution() {
	let alu_out = 0;
	let { pc, ir, rt, shamt, in_a, in_b, alu_op,
		write_back, write_mem, read_mem, wb_dest } = CPU.pipeline.id_ex;
	
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
			alu_out = rt << shamt;
			break;
		case 0x02:
			alu_out = rt >> shamt;
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
		WriteWordMemUI(alu_out, rt);
	}
	if (read_mem) {
		let w = ReadWord(alu_out);
		wb_data = w;
		WriteWordMemUI(alu_out, w);
	}

	CPU.pipeline.mem_wb = {
		pc, ir,
		wb_dest,
		write_back,
		wb_data
	}
}

function WriteBack() {
	let { pc, ir,write_back, wb_dest, wb_data } = CPU.pipeline.mem_wb;
	if (write_back) {
		CPU.reg[wb_dest] = wb_data;
		UpdateRegister(wb_dest, wb_data, 'wb');
	}
	CPU.pipeline.wb = {
		pc, ir
	}
}

/** 
 *	Clock Principal da Pipeline
 * */ 
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