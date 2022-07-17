function Step() {
	MovePCDOM();
	PipelineClock();
}

function HandleFileDrop(ev) {
	ev.preventDefault();
	console.log(ev);
	if (ev.dataTransfer.items) {
		// Use DataTransferItemList interface to access the file(s)
		for (let i = 0; i < ev.dataTransfer.items.length; i++) {
		  // If dropped items aren't files, reject them
		  if (ev.dataTransfer.items[i].kind === 'file') {
			const file = ev.dataTransfer.items[i].getAsFile();
			console.log('... file[' + i + '].name = ' + file.name);
		}
		}
	}
}

function HandleFileDragOver(ev) {
	ev.preventDefault();
	// console.log(ev);
}
const inp = document.getElementById("file_input");
inp.addEventListener('change', async ev => {
	let ab = await inp.files[0].arrayBuffer()
	let int = new Int32Array(ab);
	LoadProgramIntoMemory(int);
	DisassemblerCreateAllLines();
})