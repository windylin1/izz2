let ustr = require ('../lib/ustr.js')

class SessionUserAccess(){
    
    constructor(uid,ucookie){
 	    this.uid = uid;
 	    this.ucookie = ucookie;
 	    this.roles = null;

    }

    function isLogin(){
    	return  !ustr.isnul(this.uid);
    }

    function isSYS{
    	return this.roles.has('sys')&&this.uid=='sys';
    }

    function isAdmin(){
    	return this.roles.has('admin');
    }
}