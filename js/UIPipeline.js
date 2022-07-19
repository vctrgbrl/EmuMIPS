const IF_DOM = document.querySelector("#if_div");
const ID_DOM = document.querySelector("#id_div");
const EXE_DOM = document.querySelector("#exe_div");
const MEM_DOM = document.querySelector("#mem_div");
const WB_DOM = document.querySelector("#wb_div");

function UpdateIF() {
	IF_DOM.innerHTML = `<span>${Disassemble(CPU.pipeline.if.ir)}</span>`;
}

function UpdateID() {
	ID_DOM.innerHTML = ``
}