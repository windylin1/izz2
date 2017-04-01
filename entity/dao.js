const db=require('../conf/db.js')
const _ = require('underscore')._;
const ustr = require('../lib/ustr.js');

class dao{
    async constructor(){
        this.m = new Map(); //entities;
        this.mcols = new Map();
        this.cols = new Map();

        //get m from db; 这里不应该是异步的; 暂时先这么处理;
        let ls =await db.query('select * from BASE_ENTITY',null);

        if(!ls){
            throw new Error('未定义任何实体!'); //这里应该退出程序;
        }

        for(let a of ls){
            this.m.set(a.EntityCode,a);
            this.mcols.set(a.EntityCode,null);
        }

        let ls2 = await db.query('select * from BASE_ENTITY_ATTR',null);

        if(!ls2){
            throw new Error('未定义任何实体属性');
        }

        for(let c of ls2){
            this.cols.set(c.Fid,c);

            if(!this.m.has(c.EntityCode)){ continue;}

            let arr = new Set();
            if(this.mcols.get(c.EntityCode)){
                arr = this.mcols.get(c.EntityCode);
            }

            arr.add(c.Fid);
            this.mcols.set(c.EntityCode,arr);
        }

        //递归父级对象的属性; 如果子级已经有的,以子级为准;
        let _tmp = _.pluck(_.filter(this.m.values(),function(a){return !ustr.isnul(a.EntityPCode);}),'EntityPCode');
        let _prts = new Set(_tmp);
        if(_prts){
           _prts = new Set(_.pluck(_.filter(this.m.values(),function(a){return _prts.has(a.EntityCode)&&ustr.isnul(a.EntityPCode);}),'EntityCode'));
        }

        let _prtsNew = new Set();

        while(_prts){
            for(let k of this.m.keys()){
                
                if( _prts.has(this.m.get(k).EntityPCode)){

                    let arr = this.mcols.get(k);
                    let parr = this.mcols.get(this.m.get(k).EntityPCode);

                    let arrls = dao.getlsByKey(arr,this.cols);
                    let parrls = dao.getlsByKey(parr,this.cols);

                    let arrNames =new Set(_.pluck(arrls,'FldName'));

                    let newCols =_.pluck(_.filter(parrls,function(a){return !arrNames.has(a.FldName);}),'Fid');

                    for(let a of newCols){
                        arr.add(a);
                    }
                    this.mcols.set(k,arr);

                    _prtsNew.add(k);
                }
            }
            _prts = _prtsNew;
        }

        //finish

    }
    
    function static getlsByKey(keyls,m1){
        let ls = new Array();
        for(let k of keyls){
            if(m1.has(k)){
                ls1.push(m1.get(k));
            }
        }
        return ls;
    }


    //获取某实体;
    //获取某些实体;
    

}


