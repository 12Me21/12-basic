debug=false;

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

Value.prototype.copy=function(){
	return new Value(this.type,this.value);
}

Value.prototype.toString=function(base){
	switch(this.type){
		case "number":
			return this.value.toString(base).toUpperCase();
		case "string":
			return this.value;
		case "array":
			return "{"+this.value.join(",")+"}";
		default:
			assert(false,"invalid type");
	}
}

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
}

Value.prototype.expect=function(type){
	assert(this.type===type,"type mismatch");
}

//don't use
Value.prototype.isNumber=function(){
	return this.type==="number";
}

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

var oldLog=console.log;
console.log=function(a,b,c,d,e,f){if(debug){oldLog(a,b,c,d,e,f)}} //go to hell