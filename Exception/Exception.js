let util=require('util');

function zzException(code,msg){
	this.name="zzException";
	this.code = code||'err';
	this.message = msg||'Got an Error';
	Error.captureStackTrace(this);
}

util.inherits(zzException, Error);


var obj = new Object();

obj.getErrValidate100 = function(msg){
    return new zzException("403",msg||"权限校验错误,未通过权限校验!");
}

obj.getErrUserNoLogin101 = function(msg){
	return new zzException("101",msg||" the User is not login! ");
}

obj.getErrValidate900 = function(msg){
    return new zzException("900",msg||"提交数据校验失败!");
}

module.exports = obj;