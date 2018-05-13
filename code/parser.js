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
	var type,word;
	//stored tokens
	var newType,newWord;
	//keep track of stored tokens
	var readNext=1;
	//false=not, 1=no paren, 2=()
	var defs={};
	
	var noEquals,noTo;
	
	var current={};
	var currentBlocks=[];
	var globals={};
	var variables=globals;
	
	//enter code block
	function startBlock(){
		current.code=[];
		current.line=lineNumber;
		currentBlocks.push(current);
		current={};
	}
	//leave code block
	function endBlock(){
		var block=currentBlocks.pop();
		currentBlocks[currentBlocks.length-1].code.push(block);
	}
	//leave code block + create function
	function endDef(){
		var block=currentBlocks.pop();
		defs[block.name]=block;
	}
	
	//control single line IF statement
	var ifThisLine=false,codeAfterThen;
	
	var expr=[];
	
	current.type="main";
	startBlock();
	
	//main
	do{
		try{
			readStatement();
		}catch(error){
			if(error.name==="ParseError")
				return error.message+" on line "+lineNumber;
			//bad error!!!
			else{
				throw error;
			}
		}
	}while(type!=="eof");;;
	
	//read a "line" of code
	function readStatement(){
		next();
		if(type!="comment" && ifThisLine && type!="linebreak")
			codeAfterThen=true;
		switch(type){
			//SWITCH/CASE/ENDSWITCH
			case "SWITCH":
				current.type="SWITCH";
				assert(current.condition=readExpression(),"Missing argument to keyword");
				startBlock();
			break;case "CASE":
				var currentType=currentBlock().type;
				if(currentType==="CASE")
					//end previous case (no break required!)
					endBlock();
				else
					//This is if it's the first CASE after SWITCH
					assert(currentType==="SWITCH","invalid CASE");
				//start block
				current.type="CASE";
				assert(current.conditions=readList(readExpression),"Missing argument to keyword");
				startBlock();
			break;case "ENDSWITCH":
				assert(currentBlock().type==="CASE","ENDSWITCH without SWITCH/CASE");
				endBlock();
				endBlock();
			//REPEAT/UNTIL
			break;case "REPEAT":
				current.type="REPEAT";
				startBlock();
			break;case "UNTIL":
				assert(currentBlock().type=="REPEAT","UNTIL without REPEAT");
				assert(currentBlock().condition=readExpression(),"Missing UNTIL condition");
				endBlock();
			//IF/ELSEIF/ELSE/ENDIF
			break;case "IF":
				current.type="IF";
				assert(current.condition=readExpression(),"Missing IF condition");
				assert(readToken("THEN"),"IF without THEN");
				startBlock();
				ifThisLine=true;
				codeAfterThen=false;
			break;case "ELSEIF":
				assert(currentBlock().type=="IF"||currentBlock().type=="ELSEIF","ELSEIF without IF");
				endBlock();
				current.type="ELSEIF";
				current.condition=readExpression();
				assert(readToken("THEN"),"ELSEIF without THEN");
				startBlock();
			break;case "ELSE":
				var currentType=currentBlock().type;
				//SWITCH
				if(currentType==="CASE"){
					//end previous CASE
					endBlock();
					//start new CASE
					current.type="CASE";
					startBlock();
				//IF
				}else{
					assert(currentBlock().type==="IF"||currentBlock().type==="ELSEIF","ELSE without IF");
					//end previous IF/ELSEIF section
					endBlock();
					//start ELSE section
					current.type="ELSE";
					startBlock();
				}
			break;case "ENDIF":
				var currentType=currentBlock().type;
				assert(currentType==="IF" || currentType==="ELSEIF" || currentType==="ELSE","ENDIF without IF");
				endBlock();
				ifThisLine=false;
			//FOR/NEXT
			break;case "FOR":
				current.type="FOR";
				noEquals=true;
				assert(current.variable=readExpression(),"Missing FOR variable");
				noEquals=false;
				console.log(type,word)
				assert(readToken("="),"Missing = in FOR");
				noTo=true;
				current.start=readExpression();
				noTo=false;
				assert(readToken("TO"),"Missing TO in FOR");
				current.end=readExpression();
				if(readToken("word") && word==="STEP")
					current.step=readExpression();
				else
					readNext=0; //heck
				startBlock();
			break;case "NEXT":
				assert(currentBlock().type=="FOR","NEXT without FOR");
				readExpression();
				endBlock();
			//WHILE/WEND
			break;case "WHILE":
				current.type="WHILE";
				assert(current.condition=readExpression(),"Missing argument to keyword");
				startBlock();
			break;case "WEND":
				assert(currentBlock().type=="WHILE","WEND without WHILE");
				endBlock();
			//do/LOOP
			break;case "DO":
				current.type="DO";
				startBlock();
			break;case "LOOP":
				assert(currentBlock().type=="DO","LOOP without DO");
				endBlock();
			//BREAK/CONTINUE
			break;case "BREAK":
				current.type="BREAK";
				current.levels=readExpression();
			break;case "CONTINUE":
				current.type="CONTINUE";
			//FUNC/ENDFUNC/RETURN
			break;case "FUNC":
				current.type="FUNC";
				assert(readToken("word"),"missing function name");
				current.name=word;
				//current.variables={};
				//variables=current.variables;
				current.inputs=readList(readDeclaration);
				startBlock();
			break;case "ENDFUNC":
				assert(currentBlock().type==="FUNC","ENDFUNC without FUNC");
				//variables=globals;
				endDef();
			break;case "RETURN":
				current.type="RETURN";
				current.value=readExpression();
			break;case "PRINT":
				current.type="PRINT";
				current.value=readList(readExpression);
			//comment
			break;case "comment":case ":":
			//line break, end
			break;case "eof":case "linebreak":
				if(ifThisLine){
					ifThisLine=false;
					if(codeAfterThen){
						endBlock();
						console.log("ended single line IF");
					}
				}
			break;default:
				readNext--;
				assert(current.value=readExpression(),"no expr when expected");
				current.type="expression";
		}
		if(current.type){
			current.line=lineNumber;
			currentBlocks[currentBlocks.length-1].code.push(current);//push to current block!
			current={};
		}
	}
	
	function readDeclaration(){
		if(readToken("word")){
			var x=(variables[word] || (variables[word]=new Value(typeFromName(word))));
			return x;
		}else
			return false;
	}
	
	//keys:
	//name: [variable name expr token list]
	//indexes: [index list]
	function readVariable(){
		next();
		var name=word;
		var variable=(variables[name] || (variables[name]=new Value(typeFromName(name))));
		return {name:name,variable:variable};
	}
	
	function currentBlock(){
		return currentBlocks[currentBlocks.length-1];
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
				//value operators
				case "^":
					return 11;
				case "*":case "/": case "\\": case "%":
					return 10;
				case "+":case "-":
					return 9;
				case "<<":case ">>":
					return 8;
				//
				case "TO":case "UNTIL":
					return 7.5;
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
				case "=":
					return -1; //ha!/
			}
		assert(false,"error prec "+token.name);
	}
	
	//I should... um
	function left(token){
		return 0;
	}
	
	function rpnFromExpr(expr){
		var rpn=[],stack=[];
		for(var i=0;i<expr.length;i++){
			var token=expr[i];
			switch(token.type){
				case "number":case "string":case "variable":case "function":case "array":case "index": //see, functions are actually pushed AFTER their arguments, so we can just send them directly to the output! :D
					rpn.push(token);
				break;case "operator":case "unary":case "=":
					while(stack.length){
						var top=stack[stack.length-1];
						if(top.type!="("&&(prec(top)>=prec(token) || (prec(top)==prec(token) && left(token)))){
							rpn.push(stack.pop());
						}else{
							break;
						}
					}
					stack.push(token);
				break;case "comma":
					while(stack.length){
						if(stack[stack.length-1].type!="("){
							rpn.push(stack.pop());
						}else{
							break;
						}
					}
				break;case "(":
					stack.push(token);
				break;case ")":
					while(1){
						var top=stack[stack.length-1];
						if(top.type!="(")
							rpn.push(stack.pop());
						else
							break;
					}
					stack.pop();
				break;default:
				assert(false,"error typ "+token.type);
			}
		}
		while(stack.length)
			rpn.push(stack.pop());
		return rpn;
	}
	
	function readExpression2(){
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
				}else{
					var x=(variables[name] || (variables[name]=new Value(typeFromName(name))));
					expr.push({type:"variable",variable:x});
				}
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
			break;case "[": //case "{":
				expr.push({type:"("});
				var x=readList2(readExpression2);
				
				assert(readToken("}")||readToken("]"),"Missing \"]\"");
				expr.push({type:")"});
				expr.push({type:"array",args:x.length});
			//other crap
			break;default:
				readNext=0;
				return false;
		}
		//read [index] and .function
		while(1)
			if(readToken("[")){
				expr.push({type:"("});
				assert(readExpression2(),"Missing index");
				assert(readToken("]"),"Missing \"]\"");
				expr.push({type:")"});
				expr.push({type:"index",args:"2"});
			}else if(readToken("dot")){
				assert(readToken("word"),"Dot missing function");
				var name=word;
				assert(readToken("("),"Dot missing function");
				expr.push({type:"("}); //all we needed!
				var x=readList2(readExpression2);
				assert(readToken(")"),"Missing \")\" in function call");
				expr.push({type:")"});
				expr.push({type:"function",name:name,args:x.length+1});
			}else
				break;
		//read infix operator + expression
		if(readToken("operator")||readToken("minus")||readToken("xor")||(!noEquals&&readToken("="))||(!noTo&&readToken("TO"))){
			console.log("operator!!",word)
			expr.push({type:"operator",name:word,args:2});
			assert(readExpression2(),"Operator missing second argument");
		}
		return true;
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
	
	if(currentBlocks.length>1)
		return "Unclosed "+currentBlocks[1].type;
	return [currentBlocks[0],variables,defs];
}