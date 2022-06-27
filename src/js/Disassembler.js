const Disassembler = {
	regs: [
		"$zero", 
		"$at", 
		"$v0",
		"$v1",
		"$a0",
		"$a1",
		"$a2", 
		"$a3", 
		"$t0", 
		"$t1", 
		"$t2",
		"$t3",
		"$t4",
		"$t5",
		"$t6",
		"$t7",
		"$s0",
		"$s1",
		"$s2",
		"$s3",
		"$s4",
		"$s5",
		"$s6",
		"$s7",
		"$t8",
		"$t9",
		"$k0",
		"$k1",
		"$gp",
		"$sp",
		"$fp",
		"$ra",
	],
	inst: {
		0x00: {
			0x20: "add",
			0x22: "sub",
			0x24: "and",
			0x25: "or",
			0x00: "sll",
			0x02: "srl",
			0x08: "jr"
		},
		0x08: "addi",
		0x04: "beq",
		0x05: "bne",
		0x23: "lw",
		0x2B: "sw",
		0x02: "j",
		0x03: "jal"
	},
	r_set: new Set([0x00]),
	i_set: new Set([0x08, 0x04, 0x05, 0x23, 0x2B]),
	j_set: new Set([0x02, 0x03])
}

function Disassemble(instruction) {
	// op = (instruction & 0b111111_00000_00000_00000_00000_000000) >> 26
	op = instruction >> 26 & 0b111111;
	
	if (Disassembler.r_set.has(op)) {
		rs = 	(instruction & 0b000000_11111_00000_00000_00000_000000) >> 21
		rt = 	(instruction & 0b000000_00000_11111_00000_00000_000000) >> 16
		rd = 	(instruction & 0b000000_00000_00000_11111_00000_000000) >> 11
		shamt =	(instruction & 0b000000_00000_00000_00000_11111_000000) >> 6
		func = 	(instruction & 0b000000_00000_00000_00000_00000_111111)

		if (func === 0x00 || func === 0x02)
			return `${Disassembler.inst[op][func]} ${Disassembler.regs[rd]}, ${Disassembler.regs[rt]}, ${shamt}`
		if (func === 0x08)
			return `${Disassembler.inst[op][func]} ${Disassembler.regs[rs]}`
		return `${Disassembler.inst[op][func]} ${Disassembler.regs[rd]}, ${Disassembler.regs[rs]}, ${Disassembler.regs[rt]}`
	} 
	
	else if (Disassembler.i_set.has(op)) {
		rs = (instruction & 0b000000_11111_00000_00000_00000_000000) >> 21
		rt = (instruction & 0b000000_00000_11111_00000_00000_000000) >> 16
		im = (instruction & 0b000000_00000_00000_11111_11111_111111)

		if (im & 0b10000_00000_000000)
			im |= 0b111111_11111_11111_00000_00000_000000
		
		return `${Disassembler.inst[op]} ${Disassembler.regs[rt]}, ${Disassembler.regs[rs]}, ${im}`
		
	} else if (Disassembler.j_set.has(op)) {
		addr = (instruction & 0b000000_11111_11111_11111_11111_111111) >> 21
		return `${Disassembler.inst[op]} ${addr}`
	}
}