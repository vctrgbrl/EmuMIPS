const inp = document.getElementById("file_input");
const runDOM = document.getElementById("run_stop");
let hasFile = false;
let interval = null;

inp.addEventListener('change', async ev => {
	let ab = await inp.files[0].arrayBuffer()
	let int = new Uint32Array(ab);
	ClearMemory();
	LoadProgramIntoMemory(int);
	DisassemblerCreateAllLines();
	hasFile = true;
})

function DebuggerStep(event) {
	if (!hasFile) {
		alert("Sem Arquivo selecionado");
		return;
	}
	PipelineClock();
	UpdatePipelineUI();
}

function DebuggerRun(ev) {
	if (!hasFile) {
		alert("Sem Arquivo selecionado");
		return;
	}
	if (interval === null) {
		runDOM.textContent = "Stop";
		interval = setInterval(DebuggerStep, 1000);
	}
	else {
		clearInterval(interval);
		interval = null;
		runDOM.textContent = "Run";
	}
}

function DebuggerReset(ev) {
	CPU.reg = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
	CPU.pc = text_region;
	CPU.pipeline =  {
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
		}
	}
	for (let i = 0; i < text_region; i++)
		CPU.memory[i] = 0;
}