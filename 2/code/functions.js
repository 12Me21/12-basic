function mid(a,b,c){
	a.expect("string");
	b.expect("number");
	c.expect("number");
	var start=b.value;
	var length=c.value;
	if(start<0){
		length-=-start;
		start=0;
	}
	assert(length>=0,"domain error mids "+start+" "+length);
	return new Value("string",a.value.substr(start,length));
}

function absoluteValue(a){
	a.expect("number");
	return new Value("number",Math.abs(a.value));
}

function type(a){
	return new Value("string",a.type);
}

function stringSplit(a,b){
	a.expect("string");
	b.expect("string");
	var split=a.value.split(b.value)
	var array=[];
	for(i=0;i<split.length;i++)
		array.push(new Value("string",split[i]));
	return new Value("array",array);
}

function arrayJoin(a,b){
	a.expect("array");
	b.expect("string");
	return new Value("string",a.value.join(b.value));
}

function arrayWith(a,b){
	a.expect("array");
	b.expect("array");
	var array=[];
	for(var i=0;i<b.value.length;i++)
		array.push(a.value[b.value[i].value]);
	return new Value("array",array)
}

function arrayPush(a,b){
	a.expect("array");
	assert(a.ref,"invalid push");
	a.ref.value.push(b);
}

function arrayPop(a){
	a.expect("array");
	assert(a.ref,"need variable for POP");
	assert(a.value.length>0,"array empty");
	return a.ref.value.pop();
}

function right(a,b){
	a.expect("string");
	b.expect("number");
	assert(b.value>=0,"domain error");
	return new Value("string",a.value.substr(a.value.length-b.value));
}

function cutright(a,b){
	a.expect("string");
	b.expect("number");
	assert(b.value>=0,"domain error");
	return new Value("string",a.value.slice(0,-b.value));
}

function right2(a,b,c){
	a.expect("string");
	b.expect("number");
	c.expect("number");
	assert(b.value>=0,"domain error");
	return new Value("string",a.value.substr(a.value.length-b.value-c.value,b.value));
}

function without(a,b){
	a.expect("array");
	switch(b.type){
		case "number":
			return new Value("array",a.value.filter(function(v,i){return i!=b.value}));
		case "array":
			var indexes=[];
			for(var i=0;i<b.value.length;i++){
				b.value[i].expect("number");
				indexes.push(b.value[i].value);
			}
			return new Value("array",a.value.filter(function(v,i){return indexes.indexOf(i)==-1}));
		default:
			b.expect("array");
	}
}

function mid1(a,b){
	a.expect("string");
	b.expect("number");
	var start=b.value;
	//assert(start>=0,"domain error mids "+start);
	return new Value("string",a.value.charAt(start));
}

function replace(a,b,c){
	a.expect("string");
	b.expect("string");
	c.expect("string");
	return new Value("string",a.value.split(b.value).join(c.value));
}

function outputList(list){
	var printString="";
	for(var i=0;i<list.length;i++){
		printString+=(i>0?" ":"")+list[i].toString();
	}
	print(printString);
}

function length(a){
	assert(a.type==="string"||a.type==="array","type mismatch");
	return new Value("number",a.value.length);
}

function reverse(a){
	switch(a.type){
		case "string":
			return new Value("string",a.value.split("").reverse().join(""));
		case "array":
			return new Value("array",a.value.reverse());
		default:
			assert(false,"type mismatch");
	}
}

function arrayRemove1(array,position){
	array.expect("array");
	assert(array.variable,"expected variable");
	position.expect("number");
	position=position.value|0
	x=(array.variable.value[position]);
	array.variable=new Value("array",array.variable.value.splice(position,1));
	return x;
}

function arrayRemove(array,position){
	array.expect("array");
	assert(array.variable,"expected variable");
	position.expect("number");
	position=position.value|0
	return (array.variable.value[position])
	array.variable=new Value(array.variable.value.splice(position,1));
	
}

function arrayReverse(a){
	a.expect("array");
	return new Value("array",a.value.reverse());
}

function sort(a){
	a.expect("array");
	if(a.value.length===0)
		return new Value("array",[]);
	var type=a.value[0].type;
	assert(type==="number"||type==="string","type mismatch");
	for(var i=0;i<a.value.length;i++){
		a.value[i].expect(type);
	}
	return new Value("array",a.value.sort(sortCompare));
}

function millisec(){
	return new Value("number",Date.now());	
}

function sortCompare(a, b) {
  if (a<b) {
    return -1;
  }
  if (a>b) {
    return 1;
  }
  // a must be equal to b (WRONG)
  return 0;
}

function endProgram(){
	
}

function ascii(a){
	a.expect("string");
	assert(a.value.length>0,"empty string in ASC");
	return new Value("number",a.value.charCodeAt(0));
}

function character(a){
	a.expect("number");
	return new Value("string",String.fromCharCode(a.value));
}

//this should be more strict!
function value(a){
	a.expect("string");
	return new Value("number",parseFloat(a.value)||0);
}

function input(){
	return getNextInputValue();
}

function inputNumber(){
	return new Value("number",parseFloat(getNextInputValue())||0);
}

//this should be more strict!
function valueBase(a,b){
	a.expect("string");
	b.expect("number");
	if(b.value==10)
		return new Value("number",parseFloat(a.value)||0);
	else
		return new Value("number",parseInt(a.value,b.value)||0);
}

//this should be more strict!
function string(a){
	a.expect("number");
	return new Value("string",a.toString());
}

function ceil(a){
	a.expect("number");
	return new Value("number",Math.ceil(a.value));
}

//this should be more strict!
function paddedString(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("string",("0".repeat(b.value)+a.toString()).substr(-b.value));
}

function paddedStringBase(a,b,c){
	a.expect("number");
	b.expect("number");
	c.expect("number");
	return new Value("string",("0".repeat(b.value)+a.toString(c.value)).substr(-b.value));
}

function random1(a){
	a.expect("number");
	return new Value("number",Math.floor(Math.random()*a));
}

function random2(a,b){
	a.expect("number");
	b.expect("number");
	var start=a.value;
	var range=b.value-start+1;
	return new Value("number",Math.floor(Math.random()*range)+start);
}

function floor(a){
	a.expect("number");
	return new Value("number",Math.floor(a.value));
}

function sign(a){
	a.expect("number");
	return new Value("number",Math.sign(a.value));
}

function sine(a){
	a.expect("number");
	var angle=wrap(a.value,1);
	if(angle===0||angle===1/2)
		return new Value("number",0);
	return new Value("number",Math.sin(angle*(Math.PI*2)));
}

function cosine(a){
	a.expect("number");
	var angle=wrap(a.value,1);
	if(angle===1/4||angle===3/4)
		return new Value("number",0);
	return new Value("number",Math.cos(angle*(Math.PI*2)));
}

function wrap(a,b){
	return a-Math.floor(a/b)*b;
}

function angle(a,b){
	a.expect("number");
	b.expect("number");
	var atan=Math.atan2(b.value,a.value)/(Math.PI*2);
	return new Value("number",atan>=0?atan:atan+1);
}

function hypot(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",Math.sqrt(Math.pow(a.value,2)+Math.pow(b.value,2)));
}

function sine2(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",Math.sin(a.value*(Math.PI*2))*b.value);
}

function cosine2(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",Math.cos(a.value*(Math.PI*2))*b.value);
}

function instr2(a,b){
	a.expect("string");
	b.expect("string");
	return new Value("number",a.value.indexOf(b.value));
}

function instr3(a,b,c){
	c.expect("number");
	a.expect("string");
	b.expect("string");
	return new Value("number",a.value.indexOf(b.value,c.value));
}

function ucase(a){
	a.expect("string");
	return new Value("string",a.value.toUpperCase());
}

function color(a){
	a.expect("string");
	consoleColor=a.value;
}

function lcase(a){
	a.expect("string");
	return new Value("string",a.value.toLowerCase());
}

function clearScreen(){
	console.log("clearing")
	$console.textContent="";
}

function vsync(){
	doVsync=true;
}