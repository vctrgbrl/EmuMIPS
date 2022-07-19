const inp = document.getElementById("file_input");
inp.addEventListener('change', async ev => {
	let ab = await inp.files[0].arrayBuffer()
	let int = new Int32Array(ab);
	LoadProgramIntoMemory(int);
	DisassemblerCreateAllLines();
})