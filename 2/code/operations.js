//array remove: start,[length]
var builtins={
	"!":  {1:logicalNot},
	"NOT":{1:logicalNot},
	
	"^":  {2:exponent,precedence:13},
	
	"*":  {2:multiply,precedence:12},
	"/":  {2:divide,precedence:12},
	"%":  {2:mod,precedence:12},
	"\\": {2:div,precedence:12},
	
	"+":  {2:add,precedence:11},
	"-":  {1:negate,2:subtract,precedence:11},
	
	"<<": {2:leftShift,precedence:10},
	">>": {2:rightShift,precedence:10},
	
	"TO": {2:range,3:rangeStep,precedence:9},
	"UNTIL": {2:openRange,precedence:9},
	
	">":  {2:greaterThan,precedence:8},
	"<":  {2:lessThan,precedence:8},
	">=": {2:greaterOrEqual,precedence:8},
	"<=": {2:lessOrEqual,precedence:8},
	
	"==": {2:equal,precedence:7},
	"!=": {2:notEqual,precedence:7},
	
	"&":  {2:bitwiseAnd,precedence:6},
	"~":  {1:bitwiseNot,2:bitwiseXor,precedence:5},
	"|":  {2:bitwiseOr,precedence:4},
	
	"AND":{2:logicalAnd,precedence:3},
	"XOR":{2:logicalXor,precedence:2},
	"OR": {2:logicalOr,precedence:1},
	
	"=":  {2:assign,noSimplify:true,precedence:0},
	
	MID$:    {3:mid,2:mid1},
	ASC:     {1:ascii},
	CHR$:    {1:character},
	LEN:     {1:length},
	LENGTH:  {1:length},
	NUMBER:  {1:value,2:valueBase},
	//STR$:  {1:string,2:paddedString,3:paddedStringBase},
	STRING$: {1:string,2:paddedString,3:paddedStringBase},
	RANDOM:  {1:random1,2:random2,noSimplify:true},
	SIN:     {1:sine,2:sine2},
	COS:     {1:cosine,2:cosine2},
	ANGLE:   {2:angle},
	HYPOT:   {2:hypot},
	FIND:    {2:instr2,3:instr3},
	UPPER$:  {1:ucase},
	LOWER$:  {1:lcase},
	RIGHT$:  {2:right,3:right2},
	INPUT:   {0:inputNumber},
	INPUT$:  {0:input},
	REPLACE$:{3:replace},
	TRIMEND$:{2:cutright},
	//GET:     {2:arrayGet},
	POP:     {1:arrayPop},
	REVERSE:{1:reverse},
	SORT:   {1:sort},
	MILLISECOND:{0:millisec,noSimplify:true},
	//ARRAY:{2:filledArray},
	ABS:{1:absoluteValue},
	SPLIT:{2:stringSplit},
	JOIN:{2:arrayJoin},
	TYPE:{1:type},
	CLS:  {0:clearScreen,noSimplify:true},
	//VSYNC:{0:vsync},
	//PRINT:{any:printList},
	//SET:  {3:arraySet},
	PUSH: {2:arrayPush}, //any
	OUTPUT:{any:outputList,noSimplify:true},
	STOP:{0:endProgram,noSimplify:true},
	REMOVE:{2:arrayRemove1,3:arrayRemove},
	WITHOUT:{2:without},
	//GET:{2:arrayWith},
	COLOR:{1:color,noSimplify:true},
	CEIL:{1:ceil},
	FLOOR:{1:ceil},
	SIGN:{1:sign},
};

function endProgram(){
	stop();
}

function range(a,b){
	a.expect("number");
	b.expect("number");
	var array=[];
	for(var i=a.value;i<=b.value;i++)
		array.push(new Value("number",i));
	return new Value("array",array);
}

function rangeStep(a,b,c){
	a.expect("number");
	b.expect("number");
	c.expect("number");
	var array=[];
	for(var i=a.value;i<=b.value;i+=c.value)
		array.push(new Value("number",i));
	return new Value("array",array);
}

function openRange(a,b){
	var array=[];
	for(var i=a.value;i<b.value;i++)
		array.push(new Value("number",i));
	return new Value("array",array);
}

function step(a,b){
	a.expect("array");
	b.expect("number");
	assert(b.value>0,"step value must be at least greater than 0");
	var array=[];
	for(i=0;i<a.value.length;i+=b.value)
		array.push(a.value[Math.floor(i)]);
	return new Value("array",array);
}

function assign(a,b){
	console.log("assign",a,b)
	if(a.ref){
		a.ref.set(b);
	}else{
		a.expect("array");
		b.expect("array");
		assert(b.length===a.length,"arrays different length");
		for(var i=0;i<a.value.length;i++){
			//assert(a.value[i].ref,"During variable list assignment, expected variable but got "+a.value[i].type+". Perhaps you didn't mean to use =?");
			assign(a.value[i],b.value[i]);
		}
	}
	return b;
}

function add(a,b){
	switch(a.type){
		case "number":
			b.expect("number");
			return new Value("number",a.value+b.value);
		break;case "string":
			return new Value("string",a.value+b.value.toString());
		break;case "array":
			b.expect("array");
			return new Value("array",a.value.concat(b.value));
	}
}

function subtract(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",a.value-b.value);
}

function negate(a){
	a.expect("number");
	return new Value("number",-a.value);
}

function multiply(a,b){
	b.expect("number");
	switch(a.type){
		case "number":
			return new Value("number",a.value*b.value);
		break;case "string":
			assert(b.value>=0,"negative repeat value");
			return new Value("string",a.value.repeat(b.value));
		break;case "array":
			assert(b.value>=0,"negative repeat value");
			var result=[];
			for(var i=0;i<b.value;i++)
				result=result.concat(a.copy().value); //yeah copy that shit
			return new Value("array",result);
	}
}

function divide(a,b){
	a.expect("number");
	b.expect("number");
	assert(b.value!==0,"Tried to divide '"+a.value+"' by zero.");
	return new Value("number",a.value/b.value);
}

//floor division
function div(a,b){
	a.expect("number");
	b.expect("number");
	assert(b.value!==0,"Tried to divide '"+a.value+"' by zero.");
	return new Value("number",Math.floor(a.value/b.value));
}

//mod
function mod(a,b){
	a.expect("number");
	a.expect("number");
	assert(b.value!==0,"Tried to divide '"+a.value+"' by zero.");
	return new Value("number",a.value-Math.floor(a.value/b.value)*b.value);
}

function greaterThan(a,b){
	a.expect(b.type);
	switch(b.type){
		case "number":case "string":
			return new Value("number",a.value>b.value?1:0);
		break;case "array":
			return new Value("number",a.value.length>b.value.length?1:0);
	}
}

function exponent(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",Math.pow(a.value,b.value));
}

function lessThan(a,b){
	a.expect(b.type);
	switch(b.type){
		case "number":case "string":
			return new Value("number",a.value<b.value?1:0);
		break;case "array":
			return new Value("number",a.value.length<b.value.length?1:0);
	}
}

function lessOrEqual(a,b){
	a.expect(b.type);
	switch(b.type){
		case "number":case "string":
			return new Value("number",a.value<=b.value?1:0);
		break;case "array":
			return new Value("number",a.value.length<=b.value.length?1:0);
	}
}

function greaterOrEqual(a,b){
	a.expect(b.type);
	switch(b.type){
		case "number":case "string":
			return new Value("number",a.value>=b.value?1:0);
		break;case "array":
			return new Value("number",a.value.length>=b.value.length?1:0);
	}
}

function equal(a,b){
	return new Value("number",compare(a,b)?1:0);
}

function notEqual(a,b){
	return new Value("number",!compare(a,b)?1:0);
}

function logicalAnd(a,b){
	return new Value("number",(a.truthy() && b.truthy())?1:0);
}

function logicalXor(a,b){
	return new Value("number",(a.truthy() != b.truthy())?1:0);
}

function logicalOr(a,b){
	if(a.truthy())
		return a;
	else
		return b;
}

function logicalNot(a){
	return new Value("number",a.truthy()?0:1);
}

function bitwiseNot(a){
	a.expect("number");
	return new Value("number",~a.value);
}

function bitwiseAnd(a,b){
	b.expect(a.type);
	if(a.type==="number")
		return new Value("number",a.value & b.value);
	a.expect("array");
	var list=[];
	for(var i=0;i<a.value.length;i++)
		if(!a.value[i].isIn(list) && a.value[i].isIn(b.value))
			list.push(a.value[i]);
	return new Value("array",list);
}

function bitwiseOr(a,b){
	b.expect(a.type);
	if(a.type==="number")
		return new Value("number",a.value | b.value);
	a.expect("array");
	var list=[];
	for(var i=0;i<a.value.length;i++)
		if(!a.value[i].isIn(list))
			list.push(a.value[i]);
	for(var i=0;i<b.value.length;i++)
		if(!b.value[i].isIn(list))
			list.push(b.value[i]);
	return new Value("array",list);
}

function bitwiseXor(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",a.value ^ b.value);
}

function leftShift(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",a.value<<b.value);
}

function rightShift(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",a.value>>b.value);
}