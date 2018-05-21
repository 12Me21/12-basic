function Output(element){
	this.element=element;
}

Output.prototype.print=function(text,textColor,backgroundColor){
	console.log("printing:",text);
	var html="";
	if(textColor)
		html+="<span style='color:"+escapeHTMLAttribute(textColor)+";'>";
	if(backgroundColor)
		html+="<span style='background-color:"+escapeHTMLAttribute(backgroundColor)+";'>";
	html+=escapeHTML(text);
	if(textColor)
		html+="</span>";
	if(backgroundColor)
		html+="</span>";
	this.element.innerHTML=this.element.innerHTML+html;
};

function escapeHTML(text){
	return text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/[\r\n]/g,"<br>");
}

function escapeHTMLAttribute(text){
	return text.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

//get time in format HH:MM:SS AM/PM
function currentTimeString(){
	return new Date().toLocaleString("en-US",{hour:"numeric",minute:"numeric",hour12:true,second:"numeric"});
}