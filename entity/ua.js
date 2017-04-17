let ustr = require ('../lib/ustr.js')

class SessionUserAccess{
    
    constructor(uid,ucookie){
 	    this.uid = uid;
 	    this.ucookie = ucookie;
 	    this.roles = null;

    }

    isLogin(){
    	return  !ustr.isnul(this.uid);
    }

    isSYS(){
    	return this.roles.has('sys')&&this.uid=='sys';
    }

    isAdmin(){
    	return this.roles.has('admin');
    }
    
    static getSysSa(){
        let sa = new SessionUserAccess('sys','sys');
        sa.roles = ['sys'];
    }
}



module.exports = SessionUserAccess;