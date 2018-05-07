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
	console.log(start,length)
	assert(length>=0,"domain error mids "+start+" "+length);
	return new Value("string",a.value.substr(start,length));
}

function arrayGet(a,b){
	a.expect("array");
	b.expect("number");
	assert(b.value>=0 && b.value<a.value.length,"out of bounds");
	var x=a.value[Math.floor(b.value)];
	return x.copy();
}

function arraySet(a,b,c){
	a.expect("array");
	b.expect("number");
	assert(b.value>=0 && b.value<a.value.length,"out of bounds");
	a.value[b.value]=c.copy();
}

function arrayPush(a,b){
	console.log(a);
	a.expect("array");
	a.value.push(b);
}

function arrayPop(a){
	a.expect("array");
	assert(a.value.length>0,"array empty");
	return a.value.pop();
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

function printList(list){
	var printString="";
	for(var i=0;i<list.length;i++){
		printString+=(i>0?" ":"")+list[i].toString();
	}
	print(printString+"\n");
}

function outputList(list){
	var printString="";
	for(var i=0;i<list.length;i++){
		printString+=(i>0?" ":"")+list[i].toString();
	}
	print(printString);
}

function length(a){
	assert(a.type==="string"||a.type==="array","type mismatch")
	return new Value("number",a.value.length);
}

function stringReverse(a){
	a.expect("string")
	return new Value("string",a.value.split("").reverse().join(""));
}

function arrayReverse(a){
	a.expect("array")
	return new Value("array",a.value.reverse());
}

function sort(a){
	a.expect("array");
	if(a.value.length==0)
		return new Value("array",[]);
	var type=a.value[0].type
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
	return new Value("string",String.fromCharCode(a.value & 255));
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
	var start=a.value
	var range=b.value-start+1
	return new Value("number",Math.floor(Math.random()*range)+start);
}

function sine(a){
	a.expect("number");
	return new Value("number",Math.sin(a.value*(Math.PI*2)));
}

function cosine(a){
	a.expect("number");
	return new Value("number",Math.cos(a.value*(Math.PI*2)));
}

function angle(a,b){
	a.expect("number");
	b.expect("number");
	var atan=Math.atan2(b.value,a.value)/(Math.PI*2)
	return new Value("number",atan>=0?atan:atan+1);
}

function hypot(a,b){
	a.expect("number");
	b.expect("number");
	return new Value("number",Math.sqrt(a.value**2+b.value**2));
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

function lcase(a){
	a.expect("string");
	return new Value("string",a.value.toLowerCase());
}

function clearScreen(){
	$console.value="";
}

function vsync(){
	doVsync=true;
}