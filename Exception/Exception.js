let util=require('util');

function zzException(code,msg){
	this.name="zzException";
	this.code = code||'err';
	this.message = msg||'Got an Error';
	Error.captureStackTrace(this);
}

util.inherits(zzException, Error);


var obj = new Object();

obj.getErrUserNoLogin101 = function(){
	return new zzException("101"," the User is not login! ");
}