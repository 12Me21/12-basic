try{
	//=>==>==>==>==>==>==>=//
//12-BASIC interpreter!//
//=>==>==>==>==>==>==>=//
var ip,block,ast,functions,variables,ifs,switches;
var stopped=true,interval;
var inputs=[];
var consoleColor;

var steps=1000,stepDelay=1,doVsync=false;

function run(astIn){
	ast=astIn;
	ip=[-1];
	block=[ast[0]];
	ifs=[];
	switches=[];
	functions=ast[2];
	variables=[scopeFromTemplate(ast[1])];
	stopped=false;
	inputs=$input.value.split("\n");
	console.log(inputs)
	stepLevel2();
}

function scopeFromTemplate(template){
	var scope=[]
	console.log(template)
	for(var i=0;i<template.length;i++){
		scope.push(template[i].copy());
	}
	return scope;
}

function stepLevel2(){
	if(!stopped)
		interval=window.setInterval(stepLevel1,stepDelay);
}

function stepLevel1(){
	for(var i=0;i<steps;i++){
		if(stopped)
			break;
		step();
	}
}

function currentTimeString(){
	return new Date().toLocaleString("en-US",{hour:"numeric",minute:"numeric",hour12:true,second:"numeric"});
}

function stop(error){
	console.log("trying to end")
	stopped=true;
	window.clearInterval(interval);
	consoleColor=undefined;
	print("==================== ["+currentTimeString()+"]\n");
	print(error?"ERROR: "+error:"OK");
	print("\n");
}

function enterBlock(into){
	block.push(into||current(block).code[current(ip)]);
	if(!into)
		ip[ip.length-1]++;
	ip.push(-1);
	ifs.push(0);
	switches.push(undefined);
}

function leaveBlock(){
	block.pop();
	ip.pop();
	ifs.pop();
	switches.pop();
}

function current(stack){
	return stack[stack.length-1];
}

function callFunction(name,args){
	if(builtins[name]){
		if(builtins[name][args.length]){
			return builtins[name][args.length].apply(null,args);
		}else{
			assert(builtins[name].any,"\""+name+"\" does not accept "+args.length+" arguments");
			return builtins[name].any(args);
		}
	}else{
		assert(functions[name] && functions[name].inputs.length===args.length,"user function not defined either");
		var x=functions[name].inputs;
		variables.push(scopeFromTemplate(functions[name].variables));
		for(var i=0;i<x.length;i++){
			getVarRef(x[i]).set(args[i]);
		}
		enterBlock(functions[name]);
		while(1){
			var x=step();
			if(stopped)
				break;
			if(x)
				return x;
		}
	}
}

function getVarRef(r){
	if(r.level===0)
		return variables[0][r.index]
	return variables[variables.length-1][r.index]
	
}

///////////////////////
//evaluate expression//
///////////////////////
function expr(rpn,unUsed){
	assert(rpn.constructor===Array,"Internal error: invalid expression");
	//assert(!(unUsed && rpn.length===1 && rpn[0].type==="variable" && !rpn[0].isDec),"Variable '"+rpn[0].name+"' was used on its own. This is probably a mistake.");
	var stack=[];
	for(var i=0;i<rpn.length;i++){
		switch(rpn[i].type){
			case "variable":
				var ref=getVarRef(rpn[i].variable);
				var x=ref.copy();
				x.variable=ref;
				stack.push(x);
			break;case "number":
				stack.push(new Value("number",rpn[i].value));
			break;case "string":
				stack.push(new Value("string",rpn[i].value));
			break;case "index":
				var index=stack.pop();
				var array=stack.pop();
				index.expect("number");
				index=index.value;
				assert(index>=0 && index<array.value.length,"Tried to access element "+index+" of an array with length "+array.value.length+".");
				var x=array.value[Math.floor(index)]
				if(array.variable)
					x.variable=array.variable.value[index]; //problem was here. used "array" instead of "array.variable" oops sorry :(/ damage was done while trying to fix D:
				stack.push(x);
			break;case "operator":case "function":case "unary":
				var args=rpn[i].args;
				assert(args<=stack.length,"Internal error: stack underflow");
				var retval;
				retval=callFunction(rpn[i].name,arrayRight(stack,args));
				for(var j=0;j<args;j++)
					stack.pop();
				stack.push(retval);
			break;case "array":
				var args=rpn[i].args;
				var array=new Value("array",arrayRight(stack,args));
				for(var j=0;j<args;j++)
					stack.pop();
				stack.push(array);
			break;default:
				assert(false,"Internal error: bad token "+rpn[i].type);
		}
	}
	assert(stack.length===1,"Internal error: stack not empty");
	return stack[0];
}

function print(text){
	if(consoleColor)
		$console.innerHTML=$console.innerHTML+colorSpan(text,consoleColor);
	else
		$console.innerHTML=$console.innerHTML+escapeHTML(text);
	$console.scrollTop=$console.scrollTopMax;
}

function colorSpan(text,color){
	return "<span style=\"color:"+escapeHTMLAttribute(color)+";\">"+escapeHTML(text)+"</span>";
}

function escapeHTML(text){
	return text.replace(/&/g,"&amp;").replace(/</g,"&lt;");//.replace(/[\r\n]/g,"<br>");
}
function escapeHTMLAttribute(text){
	return text.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

function jumpTo(pos){
	ip[ip.length-1]=pos;
}

function step(){
	jumpTo(current(ip)+1);
	/////////////////
	//exiting block//
	/////////////////
	while(current(ip)>=current(block).code.length){
		var now=current(block);
		switch(now.type){
			case "WHILE":
				if(expr(now.condition).truthy())
					jumpTo(0);
				else
					leaveBlock();
			break;case "DO":
				jumpTo(0);
				//...
			break;case "REPEAT":
				if(!expr(now.condition).truthy())
					jumpTo(0);
				else
					leaveBlock();
			break;case "FOR":
				var variable=expr(now.variable);
				assert(variable=variable.variable,"FOR loop needs a variable.");
				variable.expect("number");
				if(now.step!==undefined){
					var value=expr(now.step);
					value.expect("number");
					variable.value+=value.value;
				}else
					variable.value++;
				var value=expr(now.end);
				value.expect("number");
				if(variable.value<=value.value) //only works for loops that count upwards!
					jumpTo(0);
				else
					leaveBlock();
			break;case "main":
				stop();
				return;
			break;case "FUNC":
				leaveBlock();
				return true;
			break;case "IF":case "ELSE":case "ELSEIF":case "CASE":case "SWITCH":
				leaveBlock();
			break;default:
				throw "bad block"+now.type;
		}
	}
	var now=current(block).code[current(ip)];
	//////////////////
	//entering block//
	//////////////////
	switch(now.type){
		case "WHILE":
			if(expr(now.condition).truthy())
				enterBlock();
		break;case "DO":
			enterBlock();
		break;case "REPEAT":case "FUNC":
			enterBlock();
		break;case "FOR":
			var value=expr(now.start);
			value.expect("number");
			var variable=expr(now.variable);
			assert(variable=variable.variable,"FOR loop needs a variable.");
			variable.expect("number");
			variable.value=value.value;
			value=expr(now.end);
			value.expect("number");
			if(variable.value<=value.value);
				enterBlock();
		break;case "EXIT":
			var levels=now.levels;
			if(levels){
				levels=expr(now.levels);
				levels.expect("number");
				levels=Math.floor(levels.value);
				assert(levels>=1,"EXIT requires a positive number");
			}else
				levels=1;
			while(1){
				var x=current(block);
				if(x.type==="main")
					break;
				else{
					levels--;
					if(!levels){
						leaveBlock();
						break;
					}
				}
				leaveBlock();
			}
			//wow why's this part so hecking long?
		break;case "BREAK": //M U L T I - L E V E L   B R E A K !
			var levels=now.levels;
			if(levels){
				levels=expr(now.levels);
				levels.expect("number");
				levels=Math.floor(levels.value);
				assert(levels>=1,"BREAK requires a positive number");
			}else
				levels=1;
			while(1){
				var x=current(block);
				if(x.type==="main"){
					assert(false,"BREAK must be used inside a FOR, WHILE, REPEAT, or DO loop. (It is not used for SWITCH/CASE).");
				}else if(x.type==="FOR"||x.type==="WHILE"||x.type==="REPEAT"||x.type==="DO"){
					levels--;
					if(!levels){
						leaveBlock();
						break;
					}
				}
				leaveBlock();
			}
		break;case "CONTINUE":
			while(1){
				var x=current(block);
				if(x.type==="main"){
					assert(false,"CONTINUE must be used inside a FOR, WHILE, REPEAT, or DO loop");
				}else if(x.type==="FOR"||x.type==="WHILE"||x.type==="REPEAT"||x.type==="DO"){
					jumpTo(Infinity);
					break;
				}
				leaveBlock();
			}
		break;case "PRINT":
			var printString="";
			for(var i=0;i<now.value.length;i++){
				printString+=(i>0?" ":"")+expr(now.value[i]).toString();
			}
			print(printString+"\n");
		break;case "expression":
			expr(now.value,true);
		break;case "IF":
			if(expr(now.condition).truthy()){
				ifs[ifs.length-1]=true;
				enterBlock();
			}else
				ifs[ifs.length-1]=false;
		break;case "ELSE":
			if(!ifs[ifs.length-1])
				enterBlock();
		break;case "ELSEIF":
			if(!ifs[ifs.length-1]){
				if(expr(now.condition).truthy()){
					ifs[ifs.length-1]=true;
					enterBlock();
				}
			}
		break;case "RETURN":
			while(1){
				var x=current(block);
				leaveBlock();
				if(x.type==="FUNC")
					break;
			}
			if(now.value)
				return expr(now.value);
			return true;
		break;case "SWITCH":
			var condition=expr(now.condition);
			enterBlock();
			switches[switches.length-1]=condition;
			ifs[ifs.length-1]=false;
		break;case "CASE":
			if(now.conditions){
				for(var i=0;i<now.conditions.length;i++){
					var condition=expr(now.conditions[i]);
					if(equal(switches[switches.length-1],condition).truthy()){
						ifs[ifs.length-1]=true;
						enterBlock();
						break;
					}
				}
			}else if(ifs[ifs.length-1]===false)
				enterBlock();
		break;default:
			assert(false,"unsupported instruction "+now.type);
	}
}

function getNextInputValue(){
	var x=inputs.shift();
	if(x===undefined)
		return "";
	return new Value("string",x);
}

//assign variable
function setVar(variable,value,indexes){
	var type=variable.type;
	if(!value)
		value=defaultValue(type);
	if(indexes){
		var x=getVarFromIndexHalf(variable,indexes);
		x[0][x[1]]=value;
	}else{
		value.expect(type);
		variable.value=value.value;
	}
	return variable;
}

function assert(condition,message){
	if(!condition){
		console.log(current(block).code[current(ip)]);
		message=" On line "+current(block).code[current(ip)].line+"\n"+message;
		//message+=" on line "+current(block).code[current(ip)].line;
		stop(message);
		console.log(message);
		var error=new Error(message);
		error.name="RunError";
		throw error;
	}
}
}catch(e){
	alert(e)
}
