/**********************************************************************************************************************************/
; (function ($) {

    // 看过jquery源码就可以发现$.fn就是$.prototype, 只是为了兼容早期版本的插件  
    // 才保留了jQuery.prototype这个形式  
    $.fn.mergeCell = function (options) {
        return this.each(function () {
            var cols = options.cols;
            for (var i = cols.length - 1; cols[i] != undefined; i--) {
                // console.debug(cols[i]);  
                mergeCell($(this), cols[i]);
            }
            //清理隐藏的td by iris;
            var trs = $(this).find('tbody tr');
            for (var i = 0; i < trs.length; i++) {
                var tr = trs.eq(i);
                var tds = tr.find('td');
                for (var j = cols.length - 1; cols[j] != undefined; j--) {
                    var col = cols[j];
                    if (tds.eq(col).css("display") == "none") {
                        //console.log('hide:' + (i - 1) + ',' + col);
                        tds.eq(col).remove();
                    }
                }
            }
            dispose($(this));
        });
    };

    // 如果对javascript的closure和scope概念比较清楚, 这是个插件内部使用的private方法 , // 具体可以参考本人前一篇随笔里介绍的那本书   
    function mergeCell($table, colIndex) {
        $table.data('col-content', ''); // 存放单元格内容  
        $table.data('col-rowspan', 1);  // 存放计算的rowspan值  默认为1  
        $table.data('col-td', $());     // 存放发现的第一个与前一行比较结果不同td(jQuery封装过的), 默认一个"空"的jquery对象  
        $table.data('trNum', $('tbody tr', $table).length); // 要处理表格的总行数, 用于最后一行做特殊处理时进行判断之用  
       // 我们对每一行数据进行"扫面"处理 关键是定位col-td, 和其对应的rowspan  

        $('tbody tr', $table).each(function (index) {
            // td:eq中的colIndex即列索引  
            var $td = $('td:eq(' + colIndex + ')', this);
            // 取出单元格的当前内容  
            var currentContent = $td.html();
            // 第一次时走此分支  
            if ($table.data('col-content') == '') {
                $table.data('col-content', currentContent);
                $table.data('col-td', $td);
            } else {
                // 上一行与当前行内容相同  
                if ($table.data('col-content') == currentContent) {
                    // 上一行与当前行内容相同则col-rowspan累加, 保存新值  
                    var rowspan = $table.data('col-rowspan') + 1;
                    $table.data('col-rowspan', rowspan);
                    // 值得注意的是  如果用了$td.remove()就会对其他列的处理造成影响  
                    $td.hide();
                    // 最后一行的情况比较特殊一点  
                    // 比如最后2行 td中的内容是一样的, 那么到最后一行就应该把此时的col-td里保存的td设置rowspan  
                    if (++index == $table.data('trNum'))

                        $table.data('col-td').attr('rowspan', $table.data('col-rowspan'));
                } else { // 上一行与当前行内容不同  
                    // col-rowspan默认为1, 如果统计出的col-rowspan没有变化, 不处理  
                    if ($table.data('col-rowspan') != 1) {
                        $table.data('col-td').attr('rowspan', $table.data('col-rowspan'));
                    }
                    // 保存第一次出现不同内容的td, 和其内容, 重置col-rowspan  
                    $table.data('col-td', $td);
                    $table.data('col-content', $td.html());
                    $table.data('col-rowspan', 1);
                }
            }
        });
    }
    // 同样是个private函数  清理内存之用  
    function dispose($table) {
        $table.removeData();
    }

})(jQuery);


/**********************************************************************************************************************************/
;


var LIB_JS = new function () {

    var _t = this;
    
 
    
    this.CommonValidate = function (_container) {
        //必须保证ID的唯一性;

        var _err = 0;
        var eles = $('#' + _container).find('[iris_validate_pop=1]');

        //alert(eles.length);


        for (var i = 0; i < eles.length; i++) {
            var _e = eles.eq(i);

            //若改为不自动关闭,需要再次关闭;

            //alert(_t.hasAttr(_e,'iris_validate_content'));

            //通用验证程序
            if (_t.CommonValidate_CheckValue(_e)) {
                _err = 1;
                _e.focus();
                //Stip(_e.attr('id')).show({content:CommonValidate_GetContent(_e),p:'right',kind:'error',time:2000,closeBtn:true});
                Stip(_e.attr('id')).show({ content: _t.CommonValidate_GetContent(_e), p: 'right', kind: 'error', time: 2000 });
            }

        }

        if (_err == 1) {
            return false;
        }
        else {
            return true;
        }


    }
    //check value
    this.CommonValidate_CheckValue = function (_e) {


        var _bl = false;
        var _tmpValue = CommonValidate_GetValue(_e);
        var _v = _e.attr('iris_validate_defvalue');

        //不能为空
        switch (_e.attr('iris_validate_type')) {
            case 'required':
                if (_t.isnul(_tmpValue)) { _bl = true; }
                break;
            case 'email':
                if (!_t.isMail(_tmpValue)) { _bl = true; }
                break;
            case 'date':
                if (!_t.isDate(_tmpValue)) { _bl = true; }
                break;
            case 'number':
                if (!_t.isNumber(_tmpValue)) { _bl = true; }
                break;
            case 'english':
                if (!_t.isEng(_tmpValue)) { _bl = true; }
                break;
            case 'chinese':
                if (!_t.isChs(_tmpValue)) { _bl = true; }
                break;
            case 'contain':
                if (!_t.cpContains(_tmpValue, _v)) { _bl = true; }
                break;
            case 'length':
                if (!_t.cpLength(_tmpValue, _v)) { _bl = true; }
                break;
            case 'max':
                if (!_t.cpMax(_tmpValue, _v)) { _bl = true; }
                break;
            case 'min':
                if (!_t.cpMin(_tmpValue, _v)) { _bl = true; }
                break;
            case 'int':
                if (!_t.isInt(_tmpValue)) { _bl = true; }
                break;
            case 'equal':
                if (!_t.cpEqual(_tmpValue, _v)) { _bl = true; }
                break;
            case 'btwn':
                if (!_t.cpBetween(_tmpValue, _v)) {
                    _bl = true;
                }

            case 'DEF_FUNC':
                //应先判断是否存在,
                if (_t.hasAttr(_e, 'iris_validate_define_func')) {
                    var _tmpfunc = eval(_e.attr('iris_validate_define_func'));
                    _bl = _tmpfunc(_tmpValue);
                }
                break;

        }

        return _bl;
    }

    //取得value,or html or hiddenvalue;可能会改为根据tagName,但基本上验证仍然使用text
    function CommonValidate_GetValue(_e) {
        if (!_t.hasAttr(_e, 'iris_validate_valuetype')) {
            //默认使用text,不使用value;但对于combo的,仍使用value;
            if (_e.attr('tagName') == 'td') {
                return _e.text();
            }

            return _e.val();
        }
        else if (_e.attr('iris_validate_valuetype') == '1')//1,代表取得value字段;
        {
            return _e.val();
        }
        else if (_e.attr('iris_validate_valuetype') == '2')//2,使用text字段;
        {
            return _e.text();
        }
        else if (_e.attr('iris_validate_valuetype') == '3') //使用hfValue字段;
        {
            return _e.attr('iris_hide_mode') == 1 ? (_t.hasAttr(_e, 'iris_hide_value') ? _e.attr('iris_hide_value') : '') : '';
        }

    }

    //取得提示的内容;
    this.CommonValidate_GetContent = function (_e) {
        //取得默认提示值,若使用多语言,需要自行定义,暂时不支持
        var _v = _e.attr('iris_validate_defvalue');

        if (!_t.hasAttr(_e, 'iris_validate_content')) {
            switch (_e.attr('iris_validate_type')) {
                case 'required':
                    return '字段不能为空';
                    break;
                case 'email':
                    return 'email 地址不合法';
                    break;
                case 'date':
                    return '日期格式错误';
                    break;
                case 'number':
                    return '必须录入数值类型';
                    break;
                case 'chinese':
                    return '必须录入中文 ';
                    break;
                case 'english':
                    return 'please input english value';
                    break;
                case 'contain':
                    return 'the input value must contains ' + _v;
                    break;
                case 'length':
                    return '字符长度不能超过: ' + _v;
                    break;
                case 'max':
                    return 'the input value  must smaller than: ' + _v;
                    break;
                case 'min':
                    return 'the input value  must bigger than: ' + _v;
                    break;
                case 'int':
                    return 'the input value must be an Integer';
                    break;
                case 'equal':
                    return 'the input value  must equal to: ' + _v;
                    break;
                case 'btwn':
                    var _v1 = _v.split('-')[0];
                    var _v2 = _v.split('-')[1];
                    return '数值必须在(' + _v1 + "," + _v2 + ")之间";
                    break;
                case 'DEF_FUNC':
                    if (_t.hasAttr(_e, 'iris_validate_define_func')) {
                        return 'error by user defined function '
                    }
                    return 'user function is not defined';
                    break;
                default:
                    return 'undefined validate error';
                    break;
            }
        }
        else {
            return _e.attr('iris_validate_content');
        }

    }
    
    this.isnul = function (txt) {
    if(txt==null || txt==undefined){
        return true;
    }
    else if($.trim(txt) == '') {
        return true;
    }
    return false;
    
    //function email
    this.isMail = function (name) // E-mail值检测
    {
        var szReg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        return szReg.test(mailaddress);
    }
    //function date
    this.isDate = function (dateval) {
        var arr = new Array();

        if (dateval.indexOf("-") != -1) {
            arr = dateval.toString().split("-");
        } else if (dateval.indexOf("/") != -1) {
            arr = dateval.toString().split("/");
        } else {
            return false;
        }

        //yyyy-mm-dd || yyyy/mm/dd
        if (arr[0].length == 4) {
            var date = new Date(arr[0], arr[1] - 1, arr[2]);
            if (date.getFullYear() == arr[0] && date.getMonth() == arr[1] - 1 && date.getDate() == arr[2]) {
                return true;
            }
        }
        //dd-mm-yyyy || dd/mm/yyyy
        if (arr[2].length == 4) {
            var date = new Date(arr[2], arr[1] - 1, arr[0]);
            if (date.getFullYear() == arr[2] && date.getMonth() == arr[1] - 1 && date.getDate() == arr[0]) {
                return true;
            }
        }
        //mm-dd-yyyy || mm/dd/yyyy
        if (arr[2].length == 4) {
            var date = new Date(arr[2], arr[0] - 1, arr[1]);
            if (date.getFullYear() == arr[2] && date.getMonth() == arr[0] - 1 && date.getDate() == arr[1]) {
                return true;
            }
        }

        return false;
    }

    //function isNumber
    this.isNumber = function (name) //数值检测
    {
        return _.isNumber(o);
    }
    //function isEng
    this.isEng = function (name) //英文值检测
    {
        if (_t.isnul(name))
            return false;
        for (i = 0; i < name.length; i++) {
            if (name.charCodeAt(i) > 128)
                return false;
        }
        return true;
    }
    //function isChs
    this.isChs = function (name) //中文值检测
    {
        if (_t.isnul(name))
            return false;
        for (i = 0; i < name.length; i++) {
            if (name.charCodeAt(i) > 128)
                return true;
        }
        return false;
    }
    //function cpContains
    this.cpContains = function (_c, _v) {
        if (_v != undefined) {
            if (_c.indexOf(_v) > 0) {
                return true;
            }
        }
        return false;
    }
    //function cpMax
    this.cpMax = function (_c, _v) {
        if (_v != undefined) {
            if (_t.isNumber(_c) && _t.isNumber(_v)) {
                if (_t <= _v) { return true; }

            }
        }
        return false;

    }
    //function cpMin
    this.cpMin = function (_c, _v) {
        if (_v != undefined) {
            if (_t.isNumber(_c) && _t.isNumber(_v)) {
                if (_t >= _v) { return true; }

            }
        }
        return false;
    }
    //function cpLength(_c,_v)
    this.cpLength = function (_c, _v) {
        if (_v != undefined) {
            if (_t.isNumber(_c) && _t.isNumber(_v)) {
                if (_c.length <= _v) {
                    return true;
                }
            }
        }
        return false;
    }
    //function cpEqual
    this.cpEqual = function (_c, _v) {
        if (_c == _v) {
            return true;
        }
        return false;
    }
    //function int
    this.isInt = function (_v) {
        return _t.isNumber(_v);
    }

    this.cpBetween = function (_c, _v) {
        if (!_t.isNumber(_c)) { return false; }
        if (_t.isnul(_c)) { return false;}

        var _v1 = _v.split('-')[0];
        var _v2 = _v.split('-')[1];

        if((_t.isnul(_v1)||_c >= _t.getNumber(_v1)) && (_t.isnul(_v2)||_c <= _t.getNumber(_v2))){
            return true;
        }
        return false;
    }
    this.getInt = function (s) {
        try {
            return _t.a2i(s);
        }
        catch (err) {
            return 0;
        }
    }

    this.getDate=function (str) {
        var a = str.replace("T"," ").replace(/-/g,"/");
        return new Date(a);
    }

    this.isDicNull= function (obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    }
    
    
    this.test = function (v) {
        return v + ",i am the test IRIS_JS";
    }
    
    
    this.getNumber = function (str) {

        if (!_t.isNumber(str)) {
            return 0;
        }
        else {
            if (!isNaN(parseFloat(str))) {
                return parseFloat(str);
            }
            else {
                return 0;
            }
        }
    }
    
	this.round = function () {
        var x = 0;
        var n = 0;

        x = (arguments.length>0?arguments[0]);
        n = (arguments.length>1?arguments[1]);
        
		return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
	}
    
    this.isStr = function (o) {
		return _.isString(o);
	}

	this.o2i = function(o, v = 0) {
        var o = "0";
        var v = 0;

        o = (arguments.length>0?arguments[0]);
        v = (arguments.length>1?arguments[1]);
        
		try {
			return _t.round(o2f(o, v))
		} catch (ex) {
			return v;
		}
	}

	this.o2f = function() {
        
        var o = "0";
        var v = 0;

        o = (arguments.length>0?arguments[0]);
        v = (arguments.length>1?arguments[1]);
        
        for(var i = 2; i < arguments.length; i++) {
            
        }
    
		if (!_t.isStr(o)) {
			return v;
		}

		try {
			var s = o.replace(/,/g, '');
			var f = parseFloat(s);
			return f;
		} catch (ex) {
			return v;
		}
	}


    this.hasAttr = function (ele, str) {
        if (ele.attr(str) == undefined) { return false; }
        return true;
    }

    this.isIE = function () {
        return ! -[1, ];
    }
    //取得GUID
    this.S4 =function() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }    
    
    this.newGuid = function () {
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }
    
    this.disp_pct = function(num) {
        if (num == 0) {
            return '-';
        } else {
            return num.toString() + '%';
        }
    };
    
    this.disp_num=function (num) {
        if (num == 0) {
            return '-';
        }
        else {
            return num.toString(); //这里可以使用逗号分隔；
        }
    };
    

    this.setCookie = function(name, value) {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
        document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
    };

    this.getCookie = function(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    };
    
   
   this._submit = function(formid) {

        if ($('#stdresp').length > 0) {
            $('#stdresp').val('');
        }

        _t.loadingTip('请稍候...');
        
        $('#__EVENTPOST').val('POST');
        $('#' + formid).submit();
    };

    this.loadingTip = function(content) {
        $('.ntips').remove();
        if (content) {
            $('body').append('<div class="ntips">' + content + '</div>');
        }
    };


    this.isIP(what)=function(what) {
        if (what.search(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/) == -1)
            return false;
        var fs = 0, ls = 0;
        var myArray = what.split(/\./);
        var i;
        for (i = 0; i < 4; i++) {
            if (!_t.isNumber(myArray[i]))
                return false;

            var t = _t.atoi(myArray[i]); /* 每个域值范围0-255 */
            if ((t <= 0) || (t > 255))
                return false;
        }
        return true;
    }
    
    this.trim = function(s) {
    }
    
    this.trimEnd = function(s,a){
        
    }
    this.trimStart = function(s,a){
        
    }
    this.dateAdd = function (strInterval, NumDay, dtDate) {
        var dtTmp = new Date(dtDate);
        if (isNaN(dtTmp)) dtTmp = new Date();
        switch (strInterval) {
            case "s": return new Date(Date.parse(dtTmp) + (1000 * NumDay));
            case "n": return new Date(Date.parse(dtTmp) + (60000 * NumDay));
            case "h": return new Date(Date.parse(dtTmp) + (3600000 * NumDay));
            case "d": return new Date(Date.parse(dtTmp) + (86400000 * NumDay));
            case "w": return new Date(Date.parse(dtTmp) + ((86400000 * 7) * NumDay));
            case "m": return new Date(dtTmp.getFullYear(), (dtTmp.getMonth()) + NumDay, dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
            case "y": return new Date((dtTmp.getFullYear() + NumDay), dtTmp.getMonth(), dtTmp.getDate(), dtTmp.getHours(), dtTmp.getMinutes(), dtTmp.getSeconds());
        }
    }
    
    this.dateFormat = function () {
        var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
            timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
            timezoneClip = /[^-+\dA-Z]/g,
            pad = function (val, len) {
                val = String(val);
                len = len || 2;
                while (val.length < len) val = "0" + val;
                return val;
            };

        // Regexes and supporting functions are cached through closure  
        return function (date, mask, utc) {
            var dF = dateFormat;

            // You can't provide utc if you skip other args (use the "UTC:" mask prefix)  
            if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
                mask = date;
                date = undefined;
            }

            // Passing date through Date applies Date.parse, if necessary  
            date = date ? new Date(date) : new Date;
            if (isNaN(date)) throw SyntaxError("invalid date");

            mask = String(dF.masks[mask] || mask || dF.masks["default"]);

            // Allow setting the utc argument via the mask  
            if (mask.slice(0, 4) == "UTC:") {
                mask = mask.slice(4);
                utc = true;
            }

            var _ = utc ? "getUTC" : "get",
                d = date[_ + "Date"](),
                D = date[_ + "Day"](),
                m = date[_ + "Month"](),
                y = date[_ + "FullYear"](),
                H = date[_ + "Hours"](),
                M = date[_ + "Minutes"](),
                s = date[_ + "Seconds"](),
                L = date[_ + "Milliseconds"](),
                o = utc ? 0 : date.getTimezoneOffset(),
                flags = {
                    d: d,
                    dd: pad(d),
                    ddd: dF.i18n.dayNames[D],
                    dddd: dF.i18n.dayNames[D + 7],
                    m: m + 1,
                    mm: pad(m + 1),
                    mmm: dF.i18n.monthNames[m],
                    mmmm: dF.i18n.monthNames[m + 12],
                    yy: String(y).slice(2),
                    yyyy: y,
                    h: H % 12 || 12,
                    hh: pad(H % 12 || 12),
                    H: H,
                    HH: pad(H),
                    M: M,
                    MM: pad(M),
                    s: s,
                    ss: pad(s),
                    l: pad(L, 3),
                    L: pad(L > 99 ? Math.round(L / 10) : L),
                    t: H < 12 ? "a" : "p",
                    tt: H < 12 ? "am" : "pm",
                    T: H < 12 ? "A" : "P",
                    TT: H < 12 ? "AM" : "PM",
                    Z: utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                    o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                    S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
                };

            return mask.replace(token, function ($0) {
                return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
            });
        };
    }();

    // Some common format strings  
    this.dateFormat.masks = {
        "default": "ddd mmm dd yyyy HH:MM:ss",
        shortDate: "m/d/yy",
        mediumDate: "mmm d, yyyy",
        longDate: "mmmm d, yyyy",
        fullDate: "dddd, mmmm d, yyyy",
        shortTime: "h:MM TT",
        mediumTime: "h:MM:ss TT",
        longTime: "h:MM:ss TT Z",
        isoDate: "yyyy-mm-dd",
        isoTime: "HH:MM:ss",
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };

    // Internationalization strings  
    this.dateFormat.i18n = {
        dayNames: [
            "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
            "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ],
        monthNames: [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
            "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
        ]
    };
};;


var LIB_PAGER = function (eleid, psize, func) {

    this.ele = $('#' + eleid); //ul,class="pagination pagination-sm"
    this.pre = 9;
    this.page_count = 1;
    this.page_curr = 1;
    this.page_size = parseInt(psize);

    this.showpages = [];

    this.pfunc = function () {
        var cp = $(this).attr('cp');
        func(cp);
    };

    this.defp = function (txt, cp, issel) {

        var t = $('<a href="#" cp="' + cp + '">' + txt.toString() + '</a>');
        if (issel) {
            t.css({ 'color': 'red' });
        }
        return t;
    };
    

    this.show = function (pcurr, pcount) {
        this.page_curr = parseInt(pcurr);
        //alert(pcount);
        if (pcount != this.page_count) {
            this.ele.empty();
        }

        this.page_count = parseInt(pcount);
       
        

        var ps = this.ele.find('li');

        var bl_in = false;
        for (var i = 0; i < ps.length; i++) {
            var _tele = ps.eq(i).find('a');

            if (_tele.text() == this.page_curr) {
                _tele.css({ 'color': 'red' }).unbind('click');
                bl_in = true;
            }
            else if (_tele.text() == "<<") {
                _tele.unbind('click');
                _tele.attr('cp', this.page_curr - 1).bind('click', this.pfunc);
            }
            else if (_tele.text() == '>>') {
                _tele.unbind('click');
                _tele.attr('cp', this.page_curr + 1).bind('click', this.pfunc);
            }
            else {
                _tele.unbind('click');
                _tele.css({ 'color': '' }).bind('click', this.pfunc);
            }
        }

        if (bl_in) {
            return true;
        }


        this.ele.empty();

        var p = 1;//确定first;

        if (this.page_count > this.pre && this.page_curr > 1) {
            //前箭头;
            p = this.page_curr;
            var _t = $('<li></li>').append(this.defp('<<', p - 1, 0).bind('click', this.pfunc));

            this.ele.append(_t);

        }

        //first
        if (true) {
            var _t = $('<li></li>').append(this.defp(p, p, 1));
            this.ele.append(_t);
            p++;
        }

        while (p <= (this.page_curr + this.pre) && p <= this.page_count) {

            var _t = $('<li></li>').append(this.defp(p, p, 0).bind('click', this.pfunc));
            this.ele.append(_t);
            p++;
        }


        if (this.page_count > p) {
            //...区域
            var _t = $('<li></li>').append(this.defp('...', p, 0).bind('click', this.pfunc));

            this.ele.append(_t);

            //后箭头;
            var pn = this.page_curr + 1;
            _t = $('<li></li>').append(this.defp('>>', pn, 0).bind('click', this.pfunc));

            this.ele.append(_t);
        }
    };
};


var LIB_EDITOR= function(addo, edito, delo) {
    
    this.reset = function () {
        this.finish();
    }
    this.init = function () {
        this.finish();
    }

    this.status = 0; //0,info; 1,edit; 2,add;
    this.modified = 0;

    this.to_edit = function () {
        if (this.status == 0) {

            $('#' + edito).val('保存');

            $('#' + addo).val('取消');

            if (delo) {
                $('#' + delo).attr('disabled', true);
            }
            this.status = 1;
            return true;
        }
        return false;
    }
    this.to_add = function () {
        if (this.status == 0) {
            $('#' + edito).val('保存');
            $('#' + addo).val('取消');

            if (delo) {
                $('#' + delo).attr('disabled', true);
            }
            this.status = 2;
            return true;
        }
        return false;

    }
    this.finish = function () {

        //强制结束;
        $('#' + edito).val('编辑');
        $('#' + addo).val('新建');

        if (delo) {
            $('#' + delo).attr('disabled', false);
        }

        this.status = 0;
        this.modified = 0;
    }
    this.todel = function () {
        if (this.status == 0) {

            return true;
        }
        return false;

    }

    this.cansave = function () {
        return this.status == 0 && this.modified == 1;
    }

};

var LIB_MSG = function(){
    
    this.main_showclear = function() {
        main_showerror('');
        main_showinfo('');
    }
    this.main_showinfo = function (str) {
        if (str) {
            $('#div_main_infos').html(str);
            $('#div_main_infos').show();
        }
        else {
            $('#div_main_infos').empty();
            $('#div_main_infos').hide();
        }
    }

    this.main_showerror = function(str) {
        if (str) {
            $('#div_main_errors').html(str);
            $('#div_main_errors').show();
        }
        else {
            $('#div_main_errors').empty();
            $('#div_main_errors').hide();
        }
    }

    this.stdresp_show = function() {
        var ele = $('#stdresp');
        if (ele && ele.length > 0) {
            var resp = JSON.parse(ele.val());
            _stdresp_show(resp)
        }
        return;
    }
    this._stdresp_show = function(resp) {
        var msg = "";
        if (resp.status == 1) {
            msg = resp.stdmsg;
            main_showinfo(msg);
        }
        else {
            msg = resp.errmsg;
            main_showerror(msg);
        }
        
        setTimeout(this.main_showclear, 2000);

        if (resp.directuri) {
            //alert(msg);
            window.location.href = resp.directuri;
        }
    }
}



var LIB_FORM = function (div_id,M_META,M_DATA,M_DS) {
    
    this.maindiv = $('#' + div_id);
    this.META = M_META;
    this.DATA = M_DATA;
    this.DS = M_DS;
    //validate不在这里生成,但依然支持在属性中定义的validates;
    
    //txt,sel,msel,chk,chks,radio,radios,date,datetime,md;
    
    this.initform = function(){
        
        var res = JSON.parse($('#hf_initobjs').val());
        
        for (var i = 0; i < this.META.length; i++) {

            var t = this.META[i];
         

            var ipt = '<input type="text" class="form-control input-sm" id="dtl_' + t.attr + '" ' + (t.zvalidate ? 'zvalidate="' + t.zvalidate + '" ' : "") + (t.zreqlen ? 'zreqlen="' + t.zreqlen + '" ' : "") + ' placeholder="" ' + (t.value ? "value='" + t.value + "'" : "") + '/>';

            
                              <div class="form-group">
                                
                                <label for="dtl_loginName" class="control-label fm-info-lbl" ><span style="color:red">*</span> 登录名:</label>
                                <input type="text" class="form-control input-sm" id="dtl_loginName" placeholder="" zvalidate="require">
                                <label for="dtl_loginName" class="control-label fm-valid-err" >登录名:</label>
                                
                                <div class="col-sm-4">不能与其他登录名称重复,不可更改</div>
                                
                              </div>
                              
                              
            if (t.type == "sel") {
                ipt = '<select class="form-control  input-sm" id="dtl_' + t.attr + '" ' + (t.zvalidate ? 'zvalidate="' + t.zvalidate + '" ' : "") + '>';
                if (t.ds) {

                    if (res[t.ds]) {
                        var dat = res[t.ds];
                        for (j = 0; j < dat.length; j++) {
                            ipt += "<option value='" + dat[j].sk + "'>" + dat[j].sv + "</option>";
                        }
                    }
                }
                ipt += '</select>'
            }
            else if (t.type == "chk") {
                ipt = '<div class="checkbox"><label><input type="checkbox" id="dtl_' + t.attr + '" name="dtl_' + t.attr + '" ' + (t.value ? "value='" + t.value + "'" : "") + ' /></label></div>';
            }
            else if (t.type == "chklist") {
                var _s = "";

                if (t.ds) {//datasource,dkey,dtxt
                    if (res[ds]) {
                        var dat = res[ds];
                        for (j = 0; j < dat.length; j++) {
                            _s += '<div class="checkbox"><label><input type="checkbox" id="dtl_' + t.attr + '" name="dtl_' + t.attr + '" value="' + dat[j].sk + '" txt="' + dat[j].sv + '"  />' + dat[j].sv + '</label></div>';
                        }
                    }
                }
                ipt = _s;
            }
            else if (t.type == "ud1") {
                //your own;
            }
            else if (t.type == "msel") {
                //
                ipt = '<select class="multiselect"  multiple="multiple"   id="dtl_' + t.attr + '" ' + (t.zvalidate ? 'zvalidate="' + t.zvalidate + '" ' : "") + '>';
                if (t.ds) {

                    if (res[t.ds]) {
                        var dat = res[t.ds];
                        for (j = 0; j < dat.length; j++) {
                            ipt += "<option value='" + dat[j].sk + "'>" + dat[j].sv + "</option>";
                        }
                    }
                }
                ipt += '</select>'
            }
            else if (t.type == "txt" && t.type_ext == "txtarea") {
                ipt = '<textarea rows="3" class="form-control input-sm" id="dtl_' + t.attr + '" ' + (t.zvalidate ? 'zvalidate="' + t.zvalidate + '" ' : "") + (t.zreqlen ? 'zreqlen="' + t.zreqlen + '" ' : "") + ' placeholder="" ' + (t.value ? "value='" + t.value + "'" : "") + '></textarea>';
            }

            var ss = '<div class="form-group"><label for="dtl_' + t.attr + '" class="col-sm-3 control-label">' + (t.zvalidate == 'required' ? '<span class="required">*</span>' : '') + '  ' + t.dispname + ':</label>';
            ss += '<label id="lbl_dtl_' + t.attr + '" class="col-sm-5 input_info" data-value="" ></label>';
            ss += '<div class="col-sm-5" id="div_dtl_' + t.attr + '">' + ipt + '</div>';
            ss += '<div class="col-sm-4">' + (t.remark ? t.remark : '') + '</div>';
            ss += '</div>';
            maindiv.append($(ss));

            if (t.type == "msel") {
                $('#dtl_' + t.attr).multiselect(G_MSEL_SET);
            }
        }
        
        
    }
    


}

//用于通用的绑定方法的加载;
function commonOnReady() {

};;;



