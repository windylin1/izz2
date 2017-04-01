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
}

module.exports = ustr;