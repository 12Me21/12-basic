function IndirectVariableReference(level,index,name){
	this.level=level;
	this.index=index;
	this.name=name;
}

IndirectVariableReference.prototype.getFrom=function(vars){
	if(this.level===0)
		return vars[0][this.index];
	return vars[vars.length-1][this.index];
};

IndirectVariableReference.prototype.matchRef=function(vars,directRef){
	if(this.level===0)
		return vars[0][this.index];
	vars[vars.length-1][this.index]=directRef;
};

function Variable(type,value){
	this.type=type;
	if(value)
		this.value=value;
	else
		switch(this.type){
			case "dynamic":case "unset":
				this.value=new Value("number");
			break;default:
				this.value=new Value(this.type);
		}
}

Variable.prototype.set=function(value){
	switch(this.type){
		case "dynamic":
			this.value.type=value.type;
			this.value.value=value.value;
		break;case "unset":
			this.type=value.type;
			this.value.type=value.type;
			this.value.value=value.value;
		break;default:
			value.expect(this.type);
			this.value.type=value.type;
			this.value.value=value.value;
	}
};

function th(n){return n+=[,"st","nd","rd"][n%100>>3^1&&n%10]||"th"}