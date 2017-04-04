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

    static encodeSqlParam(s){

    }
}






module.exports = ustr;