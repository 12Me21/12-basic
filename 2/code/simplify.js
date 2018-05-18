//this simplifies an expression
//things like 1+1 become 2
function simplify(rpn){
	var valStack=[];
	var outStack=[];
	for(var i=0;i<rpn.length;i++){
		var token=rpn[i];
		switch(token.type){
			case "number":case "string":
				valStack.push(token);
			break;case "variable":case "index":
				Array.prototype.push.apply(outStack,valStack);
				outStack.push(token);
				valStack=[];
			break;case "function":case "operator":case "unary":
				if(builtins[token.name] && !builtins[token.name].noSimplify && builtins[token.name][token.args] && valStack.length>=token.args){
					outStack.push(builtins[token.name][token.args].apply(null,arrayRight(valStack,token.args)));
					for(var j=0;j<token.args;j++)
						valStack.pop();
				}else{
					Array.prototype.push.apply(outStack,valStack);
					outStack.push(token);
					valStack=[];
				}
			break;case "arrayLiteral":
				if(valStack.length>=token.args){
					outStack.push(new Value("array",arrayRight(valStack,token.args)));
					for(var j=0;j<token.args;j++)
						valStack.pop();
				}else{
					Array.prototype.push.apply(outStack,valStack);
					outStack.push(token);
					valStack=[];
				}
			break;default:
				assert(false,"bad "+token.type);
		}
	}
	return outStack.concat(valStack);
}