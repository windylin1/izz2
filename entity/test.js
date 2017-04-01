//used for test func.apply; with async;

var db = require('../conf/db.js');
var ustr  = require('../lib/ustr.js');

var k = 10;


var test3 = async function(){
    let t1 = 't1';
    let t2 = 't2';

    var save= async function (conn){
        await db.exec("insert into UR_RESX values('003','res_type','resName',?)",[t1],conn);

        throw new Error('ffuck.');
        
        await db.exec("insert into UR_RESX values('004','res_type','resName',?)",[t2],conn);
        return 1;
    }

    await db.transFunc(this,save);

};

module.exports = test3;