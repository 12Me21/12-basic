var consoleOut;

function run(){
	consoleOut=consoleOut || new Output($console);
	clearScreen();
	var ast=parse(tokenize($code.value));
	if(ast.constructor===String)
		$console.textContent="PARSE ERROR: "+ast;
	else
		start(ast)
}