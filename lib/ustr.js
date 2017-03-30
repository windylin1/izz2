var _ = require('underscore')._ ;

class ustr{
    
    constructor(){
        //this.name2 = 'name2';    
    }

    static getLongId(){
        return _.now();
    }
}

module.exports = ustr;