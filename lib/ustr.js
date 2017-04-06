var _ = require('underscore')._ ;

class ustr{
    
    constructor(){
        //this.name2 = 'name2';    
    }

    static getLongId(){
        return _.now();
    }

    static isnul(obj){
        if(obj){
            return false;
        }
        return true;
    }

    

    static ls2sqlWhere(fld,ls){
        return "";
    }

    static ls2sqlStr(ls){
        return "";
    }

    //防止sql注入;
    static encodeSqlParam(s){

    }

    static isNumber(o){
        return _.isNumber(o);
    }

    static isDate(o){
        return _.isDate(o);
    }

    static isFinite(o){
        return _.isFinite(o);
    }

    static isBool(o){
        return _.isBoolean(o);
    }

    static isStr(o){
        return _.isString(o);
    }

    static isObj(o){
        return _.isObject(o);
    }

    static isInt(o){
        return Number.isInteger(o);
    }

	static isEmail(o){
		if(!isStr(o)){
			return false;
		}
		return email.length > 6 && /^[\w\-\.]+@[\w\-\.]+(\.\w+)+$/.test(email);
	}
	
    static round(x,n=0){
        return Math.round(x * Math.pow(10, n)) / Math.pow(10, n) ;
    }

    static o2i(o,v=0){
        try{
            return parseInt(o2f(o,v));
        }
        catch(ex){
            return v;
        }
    }

    static o2f(o,v=0){
        if(!isStr(o)){
            return v;
        }
        
        try{
            let s = o.replace(/,/g,'');
            let f = parseFloat(s);
            return f;
        }
        catch(ex){
            return v;
        }
    }

    
}






module.exports = ustr;