const IF_DOM = document.querySelector("#if_div");
const ID_DOM = document.querySelector("#id_div");
const EXE_DOM = document.querySelector("#exe_div");
const MEM_DOM = document.querySelector("#mem_div");
const WB_DOM = document.querySelector("#wb_div");

function UpdatePipelineUI() {
	IF_DOM.textContent = `${Disassemble(CPU.pipeline.if_id.ir)}`;
	ID_DOM.textContent = `${Disassemble(CPU.pipeline.id_ex.ir)}`;
	EXE_DOM.textContent = `${Disassemble(CPU.pipeline.ex_mem.ir)}`;
	MEM_DOM.textContent = `${Disassemble(CPU.pipeline.mem_wb.ir)}`;
	WB_DOM.textContent = `${Disassemble(CPU.pipeline.wb.ir)}`;
}