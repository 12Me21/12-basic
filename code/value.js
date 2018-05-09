function Value(type,value){
	assert(type==="number"||type==="string"||type==="array","invalid type when creating value");
	this.type=type;
	if(value===undefined)
		this.value=defaultValue(type);
	else{
		//	value=parseFloat("0"+value)||0;
		this.value=value;
	}
}

Value.prototype.copy=function(){ // DEEPEST FUCKING COPY
	if(this.type==="array"){
		var FUCK=[];
		for(var i=0;i<this.value.length;i++)
			FUCK.push(this.value[i].copy());
		return new Value(this.type,FUCK);
	}
	return new Value(this.type,this.value);
};

Value.prototype.toString=function(base){
	switch(this.type){
		case "number":
			return this.value.toString(base).toUpperCase();
		case "string":
			return this.value;
		case "array":
			return "["+this.value.join(",")+"]";
		default:
			assert(false,"invalid type");
	}
};

Value.prototype.truthy=function(){
	switch(this.type){
		case "number":
			return this.value!==0;
		case "string":
			return this.value!=="";
		case "array":
			return this.value.length!==0;
		default:
			assert(false,"invalid type");
	}
};

Value.prototype.expect=function(type){
	assert(this.type===type,"type mismatch. Expected "+type+", got "+this.type+" instead");
};

function defaultValue(type){
	switch(type){
		case "number":
			return 0;
		case "string":
			return "";
		case "array":
			return [];
		default:
			assert(false,"invalid type ");
	}
}

function compare(a,b){
	if(a.type!==b.type)
		return false;
	switch(a.type){
		case "number":case "string":
			return a.value===b.value;
		break;case "array":
			if(a.value.length!=b.value.length)
				return false;
			for(var i=0;i<a.value.length;i++)
				if(!compare(a.value[i],b.value[i]))
					return false;
			return true;
	}
}

function typeFromName(name){
	assert(name.constructor===String,"internal error: no variable name");
	switch(name.substr(-1)){
		case '$':
			return "string";
		case '#':
			return "array";
		default:
			return "number";
	}
}

function arrayRight(array,elements){
	return elements?array.slice(-elements):[];
}
//var oldLog=console.log;
//console.log=function(a,b,c,d,e,f){if(debug){oldLog(a,b,c,d,e,f)}} //go to hell