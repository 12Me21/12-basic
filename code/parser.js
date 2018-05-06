///to do
//generate the variable lists during parsing
//easy
//block scope variables?
//maybe...

//parser
//tokens->ast
//nextToken: function that returns the next token
//callback: output function
function parse(nextToken){
	//current token
	var type,word; //NOTE: word is only update right after next()ing. don't rely on it laaaaater
	//stored tokens
	var newType,newWord;
	//keep track of stored tokens
	var readNext=1;
	//false=not, 1=no paren, 2=()
	var defType=false,nextDefCommon=false,defs={};
	
	var blocks=[];
	var current={};
	var currentBlocks=[];
	
	function startBlock(){
		current.code=[];
		current.line=lineNumber;
		currentBlocks.push(current);
		current={};
	}
	function endBlock(){
		var block=currentBlocks.pop();
		currentBlocks[currentBlocks.length-1].code.push(block);
	}
	function endDef(){
		var block=currentBlocks.pop();
		defs[block.name]=block;
	}
	
	var ifThisLine=false,codeAfterThen;
	//var nextFunctionGetsOneMore=0;
	var expr=[];
	
	current.type="main";
	startBlock();
	
	do{
		try{
			readStatement();
		}catch(error){
			if(error.name==="ParseError"){
				return error.message+" on line "+lineNumber;
			//bad error!!!
			}else{
				throw error;
				return;
			}
		}
	}while(type!=="eof");;;
	
	//read a "line" of code
	function readStatement(){
		next();
		if(type!="comment" && ifThisLine && type!="linebreak")
			codeAfterThen=true;
		switch(type){
			//keywords with no arguments
			case "BREAK":
				current.type="BREAK";
				current.levels=readExpression();
			break;case "CONTINUE":
				current.type="CONTINUE";
				current.levels=readExpression();
			break;case "ELSE":
				var currentType=currentBlock().type
				if(currentType==="CASE"){
					endBlock();
					current.type="CASE";
					startBlock();
				}else{
					assert(currentBlock().type==="IF"||currentBlock().type==="ELSEIF","ELSE without IF");
					endBlock();
					current.type="ELSE";
					startBlock();
				}
			break;case "ENDSWITCH":
				var currentType=currentBlock().type
				if(currentType==="CASE")
					endBlock();
				else
					assert(currentType==="SWITCH","ENDSW without SWITCH");
				endBlock();
			break;case "ENDIF":
				var currentType=currentBlock().type
				assert(currentType==="IF" || currentType==="ELSE" || currentType==="ELSEIF","ENDIF without IF");
				endBlock();
				ifThisLine=false;
			break;case "SWITCH":
				current.type="SWITCH"
				assert(current.condition=readExpression(),"Missing argument to keyword");
				startBlock();
			break;case "CASE":
				var currentType=currentBlock().type
				if(currentType==="CASE")
					endBlock();
				else
					assert(currentType==="SWITCH","invalid CASE");
				current.type="CASE"
				assert(current.conditions=readList(readExpression),"Missing argument to keyword");
				startBlock();
			break;case "STOP":
				current.type="STOP";
			break;case "REPEAT":
				current.type="REPEAT";
				startBlock();
			//SWAP
			break;case "SWAP":
				current.type="SWAP";
				assert(current.variable=readVariable(),"Missing variable in SWAP");
				assert(readToken(","),"Missing comma in SWAP");
				assert(current.variable2=readVariable(),"Missing variable in SWAP");
			//IF, ELSEIF
			break;case "ELSEIF":
				assert(currentBlock().type=="IF"||currentBlock().type=="ELSEIF","ELSEIF without IF");
				endBlock();
				current.type="ELSEIF"
				current.condition=readExpression();
				assert(readToken("THEN"),"ELSEIF without THEN");
				startBlock();
			break;case "IF":
				current.type="IF"
				assert(current.condition=readExpression(),"Missing IF condition");
				assert(readToken("THEN"),"IF without THEN");
				startBlock();
				ifThisLine=true;
				codeAfterThen=false;
			//FOR
			break;case "FOR":
				current.type="FOR";
				assert(current.variable=readVariable(),"Missing FOR variable");
				assert(readToken("="),"Missing = in FOR");
				current.start=readExpression();
				assert(readToken("word") && word==="TO","Missing TO in FOR");
				current.end=readExpression();
				if(readToken("word") && word==="STEP")
					current.step=readExpression();
				else
					readNext=0; //heck
				startBlock();
			//WHILE <condition>
			break;case "WHILE":
				current.type="WHILE"
				assert(current.condition=readExpression(),"Missing argument to keyword");
				startBlock();
			break;case "WEND":
				assert(currentBlock().type=="WHILE","WEND without WHILE");
				endBlock();
			//do/LOOP
			break;case "DO":
				current.type="DO"
				startBlock();
			break;case "LOOP":
				assert(currentBlock().type=="DO","LOOP without DO");
				endBlock();
			//UNTIL <condition>
			break;case "UNTIL":
				assert(currentBlock().type=="REPEAT","UNTIL without REPEAT");
				assert(currentBlock().condition=readExpression(),"Missing UNTIL condition");
				endBlock();
			//NEXT
			break;case "NEXT":
				assert(currentBlock().type=="FOR","NEXT without FOR");
				readExpression();
				endBlock();
			//OUT/THEN
			break;case "OUT":case "THEN":
				assert(false,"Illegal OUT/THEN");
			//other words
			break;case "word":
				//var name=text;
				readNext=readNext-1;
				var x=readVariable(true);
				if(readToken("=")){
					current.type="assignment";
					current.variable=x;
					assert(current.value=readExpression(),"Missing value in assignment");
				}else{
					current.type="function";
					current.name=x.name;
					current.inputs=readList(readExpression);
					if(readToken("OUT"))
						current.outputs=readList(readVariable);
					else
						current.outputs=[];
				}
			//comment
			break;case "comment":
			//colon NOP
			break;case ":":
			//line break, end
			break;case "eof":
			case "linebreak":
				if(ifThisLine){
					ifThisLine=false;
					if(codeAfterThen){
						endBlock();
						console.log("ended single line IF");
					}
				}
			break;default:
				assert(false,"Expected statement, got "+type+" '"+word+"'");
		}
		if(current.type){
			current.line=lineNumber;
			currentBlocks[currentBlocks.length-1].code.push(current)//push to current block!
			current={}
		}
	}
	
	function currentBlock(){
		return currentBlocks[currentBlocks.length-1]
	}
	
	//check if next token is of a specific type
	function peekToken(wantedType){
		var prevType=type,prevWord=word;
		next();
		readNext=-1;
		newType=type;
		newWord=word;
		type=prevType;
		word=prevWord;
		return newType===wantedType;
	}
	//check if next token is of a specific type
	function peekWord(wantedWord){
		var prevType=type,prevWord=word;
		next();
		readNext=-1;
		newType=type;
		newWord=word;
		type=prevType;
		word=prevWord;
		return newType==="word" && newWord.trimLeft().toUpperCase()===wantedWord;
	}
	
	//Try to read a specific token
	function readToken(wantedType){
		next();
		if(type===wantedType){
			readNext=1;
			return true;
		}
		readNext=0;
		return false;
	}
	
	//Read list
	//reader: function to read item (readExpression etc.)
	//noNull: throw an error if a null value is found
	function readList(reader){
		var ret=[];
		var x=reader();
		if(x)
			ret.push(x);
		if(readToken(",","")){
			assert(x,"Null value not allowed");
			do
				assert(ret.push(reader()),"Null value not allowed");
			while(readToken(","));;;
		}
		return ret;
	}
	
	function readList2(reader){
		var ret=[];
		var x=reader();
		if(x)
			ret.push(x);
		if(readToken(",","")&&expr.push({type:"comma"})){
			assert(x,"Null value not allowed");
			do
				assert(ret.push(reader()),"Null value not allowed");
			while(readToken(",")&&expr.push({type:"comma"}));;;
		}
		return ret;
	}
	
	//read normal expression
	//SHould return RPN list
	function readExpression(){
		expr=[];
		//var rpn=[],stack=[];
		//rpn parse tokens as they are read?
		if(readExpression2())
			return rpnFromExpr(expr);
		return false;
	}
	
	function prec(token){
		if(token.type==="unary" || token.type==="comma")
			return Infinity;
		else
			switch(token.name){
				case "^":
					return 11;
				case "*":case "/": case "\\": case "%":
					return 10;
				case "+":case "-":
					return 9;
				case "<<":case ">>":
					return 8;
				case "<":case "<=":case ">":case ">=":
					return 7;
				case "==":case "!=":
					return 6;
				case "&":
					return 5;
				case "~":
					return 4;
				case "|":
					return 3;
				case "AND":
					return 2;
				case "XOR":
					return 1;
				case "OR":
					return 0;
			}
		console.log(token);
		assert(false,"error prec "+token.name);
	}
	function left(token){
		return 0
	}
	
	function rpnFromExpr(expr){
		console.log({...expr},"expr");
		var rpn=[],stack=[];
		for(var i=0;i<expr.length;i++){
			var token=expr[i];
			switch(token.type){
				case "number":case "string":case "variable":case "function":case "array": //see, functions are actually pushed AFTER their arguments, so we can just send them directly to the output! :D
					rpn.push(token);
				break;case "operator":case "unary":
					while(stack.length){
						var top=stack[stack.length-1]
						//console.log(top)
						if(top.type!="("&&(prec(top)>=prec(token) || (prec(top)==prec(token) && left(token)))){
							rpn.push(stack.pop());
						}else{
							break;
						}
					}
					stack.push(token);
				break;case "comma":
					while(stack.length){
						var top=stack[stack.length-1]
						//console.log(top)
						if(top.type!="("){
							rpn.push(stack.pop());
						}else{
							break;
						}
					}
				break;case "(":
					stack.push(token);
				break;case ")":
					while(1){
						var top=stack[stack.length-1]
						if(top.type!="(")
							rpn.push(stack.pop());
						else
							break;
					}
					stack.pop();
				break;default:
				assert(false,"error typ "+token.type)
			}
		}
		while(stack.length)
			rpn.push(stack.pop());
		return rpn;
	}
	
	function readExpression2(){
		var ret=false;
		next();
		switch(type){
			//function or variable
			case "word":
				var name=word;
				if(readToken("(")){
					expr.push({type:"("}); //all we needed!
					var x=readList2(readExpression2);
					assert(readToken(")"),"Missing \")\" in function call");
					expr.push({type:")"});
					expr.push({type:"function",name:name,args:x.length});
				}else
					expr.push({type:"variable",name:name});
			//number literals
			break;case "number":
				expr.push({type:"number",value:word});
			//string/label
			break;case "string":
				expr.push({type:"string",value:word});
			//operator (unary)
			break;case "unary":case "minus":case "xor":
				//unary op
				expr.push({type:"unary",name:word,args:1});
				//expr.push({type:"("}); //actual fear
				assert(readExpression2(),"Missing operator argument");
				//expr.push({type:")"});
				
			//open parenthesis
			break;case "(":
				expr.push({type:"("});
				readExpression2();
				assert(readToken(")"),"Missing \")\"");
				expr.push({type:")"});
			break;case "{":case "[":
				expr.push({type:"("});
				var x=readList2(readExpression2);
				expr.push({type:"array",args:x.length});
				assert(readToken("}")||readToken("]"),"Missing \"]\"");
				expr.push({type:")"});
				
			//other crap
			break;default:
				readNext=0;
				return false;
		}
		while(readToken("dot")){
			assert(readToken("word"),"Dot missing function");
			var name=word;
			assert(readToken("("),"Dot missing function");
			expr.push({type:"("}); //all we needed!
			var x=readList2(readExpression2);
			assert(readToken(")"),"Missing \")\" in function call");
			expr.push({type:")"});
			expr.push({type:"function",name:name,args:x.length+1});
		}
		//read infix operators
		//this might have to be WHILE not IF
		if(readToken("operator")||readToken("minus")||readToken("xor")){
			expr.push({type:"operator",name:word,args:2});
			assert(readExpression2(),"Operator missing second argument");
		}
		return true;
	}
	
	//read function definition argument
	function readArgument(){
		if(readToken("word"))
			return word;
		else
			return false;
	}
	
	//read variable declaration
	function readDeclaration(){
		var ret={};
		if(readToken("word")){
			ret.name=word;
			if(readToken("="))
				ret.value=readExpression();
			return ret;
		}
		return false;
	}
	
	//keys:
	//name: [variable name expr token list]
	//indexes: [index list]
	function readVariable(){
		next();
		return {name:word}
	}
	
	//throw error with message if condition is false
	function assert(condition,message){
		if(!condition){
			//message//+=" on line "+lineNumber;
			console.log(message);
			var error=new Error(message);
			error.name="ParseError";
			throw error;
		}
	}
	
	//I forgot how this works...
	function next(){
		if(readNext===1){
			var items=nextToken();
			type=items.type;
			word=items.word;
		}else if(readNext===-1){
			type=newType;
			word=newWord;
			readNext=1;
		//I don't think this ever happens?
		}else if(readNext===-2)
			readNext=-1;
		else
			readNext=1;
	}
	
	//handle single line IF blocks at the end of the program (temporary fix)
	if(ifThisLine){
		ifThisLine=false;
		if(codeAfterThen){
			endBlock();
			console.log("ended single line IF");
		}
	}
	
	if(currentBlocks.length>=2)
		return "Unclosed "+currentBlocks[1].type;
	//currentBlocks[1]=defs;
	return currentBlocks;
}