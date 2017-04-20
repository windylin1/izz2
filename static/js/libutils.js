/**********************************************************************************************************************************/
; (function ($) {

    // 看过jquery源码就可以发现$.fn就是$.prototype, 只是为了兼容早期版本的插件  

    // 才保留了jQuery.prototype这个形式  

    $.fn.mergeCell = function (options) {

        return this.each(function () {

            var cols = options.cols;

            for (var i = cols.length - 1; cols[i] != undefined; i--) {

                // fixbug console调试  

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
var IRIS_JS = new function () {

    var _t = this;
    //by iris 2011-09-14



    //********************************************************FOR VALIDATE
    /*
    var evt = window.event || arguments.callee.caller.arguments[0]; // 获取event对象，主要是这里啊，看这里
    var src = $(evt.srcElement || evt.target); // 获取触发事件的源对象


    ## define
		
    iris_validate_pop,--是否使用pop验证;
    ##iris_validate_type--预置类型 
    1,"required"--必填验证;不能为空,默认content:"**不能为空",(最好能取得名字),暂时未定(可再加一属性取得其显示名),也可同意定义中英文显示;
    2,"email"
    3,"date"
    4,"int"
    5,"number"
    6,"url"
    7,"contain",iris_validate_defvalue --字符串,必有什么什么字符
    8,"equal",iris_validate_defvalue --必须等于某值
    9,"chinese"
    10,"english"
    11,"length",iris_validate_defvalue
    12,"max",iris_validate_defvalue
    13,"min",iris_validate_defvalue
    14,"AjaxExist",判断是否已存在;iris_validate_defvalue---for url,默认传
		
		
    ...
    9,"DEF_FUNC" --自定义函数,返回需为bool值
		
    ##iris_validate_content --可define显示,
		
    ##iris_validate_valuetype --按照text(),or val()取值,可用于td,和textbox etc
		
    ##iris_validate_define_func
    */
    // functions validate
    //main
    this.CommonValidate = function (_container) {
        //必须保证ID的唯一性;

        var _err = 0;
        var eles = $('#' + _container).find('[iris_validate_pop=1]');

        //alert(eles.length);


        for (var i = 0; i < eles.length; i++) {
            var _e = eles.eq(i);

            //若改为不自动关闭,需要再次关闭;

            //alert(_t.CheckAttr(_e,'iris_validate_content'));

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
                if (_t.isNullOrEmpty(_tmpValue)) { _bl = true; }
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
                if (!_t.isEnglish(_tmpValue)) { _bl = true; }
                break;
            case 'chinese':
                if (!_t.isChinese(_tmpValue)) { _bl = true; }
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
                if (_t.CheckAttr(_e, 'iris_validate_define_func')) {
                    var _tmpfunc = eval(_e.attr('iris_validate_define_func'));
                    _bl = _tmpfunc(_tmpValue);
                }
                break;

        }

        return _bl;
    }

    //取得value,or html or hiddenvalue;可能会改为根据tagName,但基本上验证仍然使用text
    function CommonValidate_GetValue(_e) {
        if (!_t.CheckAttr(_e, 'iris_validate_valuetype')) {
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
            return _e.attr('iris_hide_mode') == 1 ? (_t.CheckAttr(_e, 'iris_hide_value') ? _e.attr('iris_hide_value') : '') : '';
        }

    }

    //取得提示的内容;
    this.CommonValidate_GetContent = function (_e) {
        //取得默认提示值,若使用多语言,需要自行定义,暂时不支持
        var _v = _e.attr('iris_validate_defvalue');

        if (!_t.CheckAttr(_e, 'iris_validate_content')) {
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
                    if (_t.CheckAttr(_e, 'iris_validate_define_func')) {
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
    //function required
    this.isNullOrEmpty = function (txt) {
        if ($.trim(txt) == '') {
            return true;
        }
        return false;
    }
    //function email
    this.isMail = function (name) // E-mail值检测
    {
        if (_t.isNullOrEmpty(name))
            return false;
        i = name.indexOf("@");
        j = name.lastIndexOf("@");
        if (i == -1)
            return false;
        if (i != j)
            return false;
        if (i == name.length)
            return false;
        return true;
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
        var name = $.trim(name);

        if (_t.isNullOrEmpty(name))
            return true
        if (isNaN(name))
            return false
        return true

        /*
        var name = $.trim(name);

        if (_t.isNullOrEmpty(name))
        return false;
        for (i = 0; i < name.length; i++) {
        if (name.charAt(i) < "0" || name.charAt(i) > "9")
        return false;
        }
        return true;
        */
    }
    //function isEnglish
    this.isEnglish = function (name) //英文值检测
    {
        if (_t.isNullOrEmpty(name))
            return false;
        for (i = 0; i < name.length; i++) {
            if (name.charCodeAt(i) > 128)
                return false;
        }
        return true;
    }
    //function isChinese
    this.isChinese = function (name) //中文值检测
    {
        if (_t.isNullOrEmpty(name))
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
        if (_t.isNullOrEmpty(_c)) { return false;}

        var _v1 = _v.split('-')[0];
        var _v2 = _v.split('-')[1];

        if((_t.isNullOrEmpty(_v1)||_c >= _t.getNumber(_v1)) && (_t.isNullOrEmpty(_v2)||_c <= _t.getNumber(_v2))){
            return true;
        }
        return false;
    }
    this.getInt = function (s) {
        try {
            
            return parseInt(_t.getNumber(s));
        }
        catch (err) {
            return 0;
        }
    }

    this.NewDate=function (str) {
        var a = str.replace("T"," ").replace(/-/g,"/");
        return new Date(a);
    }

    this.isDicNull= function (obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    }
    //*************************************************************
    /*
    //*************************************************************
    //用于tdClick,可见编辑,表格操作,EDIT_GRID
    /*,attr
    1,是否可修改,由操作的修改控制,但调用本方法与否,交给客户端去控制;
    2,所有该属性均加在td上;
    iris_EditGrid_Type: textbox,combo,date,popWindow
    iris_EditGrid_DataDiv,iris_EditGrid_DataID: for combo,自动取得其值;
    iris_EditGrid_isUpdate,0/1,有修改,无修改;
    iris_EditGrid_AllowEdit,0/1,不可修改/可修改
    iris_EditGrid_aftereditfunc,自定义修改后的方法

    */
    var InEditTdEleSet = function (_e, _func) {
        var _Etds = this;

        this._ele = _e;
        this._Type = _e.attr('iris_EditGrid_Type');
        this._hfMode = _e.attr('iris_hide_mode') == 1 ? 1 : 0;
        this._hfValue = _e.attr('iris_hide_mode') == 1 ? (_t.CheckAttr(_e, 'iris_hide_value') ? _e.attr('iris_hide_value') : '') : '';

        this._tmpId = _t.NewGuid();
        this._Text = _e.text();


        this._AllowEdit = _e.attr('iris_EditGrid_AllowEdit');
        this._inEdit = 0;
        this._DataDiv = '';
        this._DataID = '';

        var aftersavefunc = function (_e, _oldValue, _oldText, _newValue, _newText) {
            //alert(0);
        }

        this._AfterSaveFunc = aftersavefunc;
        if (_t.CheckAttr(_e, 'iris_EditGrid_aftereditfunc')) { this._AfterSaveFunc = eval(_e.attr('iris_EditGrid_aftereditfunc')); }


        if (_e.attr('iris_EditGrid_Type') == 'combo') {
            this._DataDiv = _e.attr('iris_EditGrid_DataDiv');
            this._DataID = _e.attr('iris_EditGrid_DataID');
        }

        this.SaveEdit = function () {


            var _newValue = '';
            var _newText = '';

            var input = _Etds._ele.find('#' + _Etds._tmpId);
            //校验;

            if (_t.CommonValidate_CheckValue(input)) {
                //如果未通过;
                alert(_t.CommonValidate_GetContent(input));
                input.focus();
                return false;
            }

            //保存
            if (_Etds._hfMode == 1) {
                //更新value,text
                if (_Etds._Type == "combo") {
                    //注意若please select,其text可能为空;??
                    _newValue = input.val();
                    _newText = input.find("option:selected").text();


                }
                else {
                    _newValue = input.attr('iris_hide_mode') == 1 ? (_t.CheckAttr(input, 'iris_hide_value') ? input.attr('iris_hide_value') : '') : '';
                    _newText = input.val();


                }
                _Etds._ele.attr('iris_hide_value', _newValue);



            }
            else {
                _newText = input.val();


            }



            //3.清空td的内容,即去掉输入框
            _Etds._ele.empty();

            _Etds._ele.html(_newText);
            _Etds._ele.attr('iris_EditGrid_isUpdate', 1);
            //5.让td重新拥有点击事件!!!切换dbclick,or click;
            _Etds._ele.click(_func);
            _Etds._inEdit = 0;

            _Etds._AfterSaveFunc(_Etds._ele, _Etds._hfValue, _Etds._Text, _newValue, _newText);
            return true;
        }

        this.CancelEdit = function () {
            //3.清空td的内容,即去掉输入框
            _Etds._ele.empty();

            _Etds._ele.html(_Etds._Text);
            //5.让td重新拥有点击事件,,!!!切换dbclick,or click;
            _Etds._ele.click(_func);



            _Etds._inEdit = 0;
        }
        this.StartEdit = function () {
            //长宽高
            var tdWidth = _Etds._ele.width() - 2;
            var tdHeight = _Etds._ele.height() - 2;

            //清空td里面的文本内容
            _Etds._ele.html(""); //也可以使用td.empty();		


            //define the input---------------------
            var input;

            //text
            if (_Etds._Type == "textbox") { input = $("<input id = '" + _Etds._tmpId + "' >"); }
            //date readonly
            if (_Etds._Type == "date") {
                input = $("<input id = '" + _Etds._tmpId + "' readonly>");
                input.datepicker();
            }
            //popWindow,use hf_value,maybe
            if (_Etds._Type == "popWindow") { input = $("<input id = '" + _Etds._tmpId + "' readonly>"); }
            //??需绑定popWindow的各种条件,及方法;



            //combo  	
            if (_Etds._Type == "combo") {
                input = $('#' + _Etds._DataDiv).find('#' + _Etds._DataID).clone(true).show();
                input.attr('id', _Etds._tmpId).val(_Etds._hfValue);
            }

            input.val(_Etds._Text);
            input.css({ "border-style": "solid", "border-width": "1px", "fontSize": "9pt", "width": tdWidth, "height": tdHeight });
            //增加验证属性
            if (_Etds._Type == "combo") {
                input.css({ "border-style": "none", "fontSize": "9pt", "width": tdWidth + 4, "height": tdHeight + 4 });
            }

            if (_t.CheckAttr(_Etds._ele, 'iris_validate_type')) { input.attr('iris_validate_type', _Etds._ele.attr('iris_validate_type')); }
            if (_t.CheckAttr(_Etds._ele, 'iris_validate_content')) { input.attr('iris_validate_content', _Etds._ele.attr('iris_validate_content')); }
            if (_t.CheckAttr(_Etds._ele, 'iris_validate_define_func')) { input.attr('iris_validate_define_func', _Etds._ele.attr('iris_validate_define_func')); }


            //event
            input.keydown(function (event) {
                //1.获取当前用户按下的键值
                //解决不同浏览器获得事件对象的差异,
                // IE用自动提供window.event，而其他浏览器必须显示的提供，即在方法参数中加上event
                var myEvent = event || window.event;
                var keyCode = myEvent.keyCode;
                //2.判断是否是回车按下
                if (keyCode == 13) {
                    //2.保存当前输入框的内容
                    if (!_Etds.SaveEdit()) {
                        return false;
                    }
                    else {
                        //move to next canedit td;
                        var _tmp = _Etds._ele.nextAll('td[iris_EditGrid_Type]:first');

                        //寻找本行元素
                        if (_tmp.length > 0) {
                            //use click;!!!
                            _tmp.trigger('click');
                        }
                        else {
                            var _nexttr = _Etds._ele.closest('tr').next('tr:visible'); //寻找可见tr元素;
                            if (_nexttr.length > 0) {
                                _tmp = _nexttr.find('td[iris_EditGrid_Type]:first');
                                if (_tmp.length > 0) {
                                    //use click;!!!
                                    _tmp.trigger('click');
                                }
                            }
                            //no row stop
                        }

                    }

                }
                //2.判断是否是ESC键按下
                if (keyCode == 27) {
                    //将input输入框的值还原成修改之前的值
                    _Etds.CancelEdit();
                    return;
                }
                //3.判断是否tab键按下
                if (keyCode == 9) {
                    //保存当前输入框的内容
                    if (!_Etds.SaveEdit()) {
                        return false;
                    }
                    else {
                        //move to next canedit td;
                        var _tmp = _Etds._ele.nextAll('td[iris_EditGrid_Type]:first');

                        //寻找本行元素
                        if (_tmp.length > 0) {
                            //use click;!!!
                            _tmp.trigger('click');
                        }
                        else {
                            var _nexttr = _Etds._ele.closest('tr').next('tr:visible'); //寻找可见tr元素;
                            if (_nexttr.length > 0) {
                                _tmp = _nexttr.find('td[iris_EditGrid_Type]:first');
                                if (_tmp.length > 0) {
                                    //use click;!!!
                                    _tmp.trigger('click');
                                }
                            }
                            //no row stop
                        }

                    }
                    return;
                }

            });
            //append the input
            _Etds._ele.append(input);  //也可以用input.appendTo(td);
            input.focus();

            //5.5 让文本框中的文字被高亮选中,当为下拉框时不需要;
            if (_Etds._Type != "combo") {
                //需要将jquery对象转化为DOM对象
                var inputDom = input.get(0);
                inputDom.select();
            }
            //6.需要移除td上的点击事件!!!切换dbclick,or click;
            _Etds._ele.unbind("click");
            _Etds._inEdit = 1;
        }



    }

    this.InEditTdEle = null;

    //iris,tdClick,必须绑定到双击,
    this.OnTdClick = function (_e, _funcName) {

        var _func = eval(_funcName);

        if (_t.InEditTdEle != null && _t.InEditTdEle._inEdit == 1) {
            //alert('not new');
            if (!_t.InEditTdEle.SaveEdit()) {
                return false;
            }
        }

        _t.InEditTdEle = null;
        _t.InEditTdEle = new InEditTdEleSet(_e, _func);
        _t.InEditTdEle.StartEdit();


    }

    //**************************************************************
    //table 操作,其他
    //添加行
    this.AddNew = function (_e) {
        var rw = _e.closest('div').find('table tr:last');
        rw.clone(true).show().insertBefore(rw);
        //alert(rw.attr('iris_test'));
    }


    this.checkAll = function (_e) {
        var tbl = _e.closest('table').find('[name=chk]').attr("checked", $(this).attr('checked'));
    }

    //by iris
    //取得本行
    this.GetRow = function (ele) {
        if (ele.is('tr')) { return ele; }
        return ele.closest('tr');
    }
    //取得本行的某元素
    this.RwFind = function (ele, str) {
        return _t.GetRow(ele).find('[name=' + str + ']');
    }



    //*************************************************************
    //functions test this class
    this.test = function (v) {
        return v + ",i am the test IRIS_JS";
    }

    //

    //*************************************************************
    /*
    通用,
    iris_hide_value,iris_hide_mode = 1用于td,text,用于储存value,而显示text;
    需要js过滤和还原以下字符( , ; | $ ' " @)
		
		
    //
    
    
		
		
		
		
    //commonly use function,判断属性是否存在
    */
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
    this.Round = function (value, num) {


        var v = _t.getNumber(value);
        if (v != 0) { v = Math.round(v * 100) / 100; }
        if (num == 0) { return Math.round(v); }

        var a, b, c, i
        a = v.toString();
        b = a.indexOf('.');
        c = a.length;


        if (b == -1) {
            a = a + ".";
            for (i = 1; i <= num; i++)
                a = a + "0";
        }
        else {
            a = a.substring(0, b + num + 1);
            for (i = c; i <= b + num; i++)
                a = a + "0";
        }
        return a;
    }


    this.CheckAttr = function (ele, str) {
        if (ele.attr(str) == undefined) { return false; }
        return true;
    }

    this.CheckIsIE = function () {
        return ! -[1, ];
    }
    //取得GUID
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    this.NewGuid = function () {
        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }

    //js对象to json string
    this.toJSONString = function (object) {
        var type = typeof object;
        if ('object' == type) {
            if (Array == object.constructor) type = 'array';
            else if (RegExp == object.constructor) type = 'regexp';
            else type = 'object';
        }
        switch (type) {
            case 'undefined':
            case 'unknown':
                return;
                break;
            case 'function':
            case 'boolean':
            case 'regexp':
                return object.toString();
                break;
            case 'number':
                return isFinite(object) ? object.toString() : 'null';
                break;
            case 'string':
                return '"' + object.replace(/(\\|\")/g, "\\$1").replace(/\n|\r|\t/g, function () {
                    var a = arguments[0];
                    return (a == '\n') ? '\\n' : (a == '\r') ? '\\r' : (a == '\t') ? '\\t' : ""
                }) + '"';
                break;
            case 'object':
                if (object === null) return 'null';
                var results = [];
                for (var property in object) {
                    var value = _t.toJSONString(object[property]);
                    if (value !== undefined) results.push(_t.toJSONString(property) + ':' + value);
                }
                return '{' + results.join(',') + '}';
                break;
            case 'array':
                var results = [];
                for (var i = 0; i < object.length; i++) {
                    var value = _t.toJSONString(object[i]);
                    if (value !== undefined) results.push(value);
                }
                return '[' + results.join(',') + ']';
                break;
        }
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


};;


function remove_cols(tbl, cols) {

    var trs = tbl.find('tr');
    for (var i = 0; i < trs.length; i++) {
        var tr = trs.eq(i);
        var tds = tr.children();
        for (var j = cols.length - 1; cols[j] != undefined; j--) {
            var col = cols[j];
           tds.eq(col).remove();
           
        }
    }
};;


//POP WINDOW 1 加载方法
//用于通用的绑定方法的加载;
function CommonOnReadyLoad() {

    //判断按钮的是否禁用情况;如果css为某,则不绑定;
    //window.history.go(1);

    $('[iris_pop_window=1]').bind('click', irisPopWindow);

    $(':input[toreadonly=1]').attr('readonly', true);


    //为grid table bind css #fefefe,fefff7
    $(".GridTbl tr:odd").css("background", "#ffffff");
    $(".GridTbl tr:even").css("background", "#e6ecf5");

    /*
    $(".GridTblS tr").each(function (i) {
        $(".GridTbl tr").mouseover(function () {
            $(this).css("background", "#f4f5dd");
        });
    });
    $(".GridTbl tr").mouseout(function () {
        $(".GridTbl tr:odd").css("background", "#ffffff");
        $(".GridTbl tr:even").css("background", "#e6ecf5");
    });
    */


    //head toggle;
    $("h3.list_title_head[fordiv] a").bind("click", function () {

        $(this).toggleClass("divdown");
        var _div = $(this).closest('h3').attr('fordiv');
        $('#' + _div).toggle();
        CallPMindexChangeFrame();

    });
    //auto toggle the should toggle;
    var _tmps = $("h3.list_title_head[fordiv][autotoggle='true']");
    $.each(_tmps, function () {
        $(this).find('a').toggleClass("divdown");
        $('#' + $(this).attr('fordiv')).toggle();
        CallPMindexChangeFrame();
    })


    //display opertions,css
    $('#Div_Operations').attr("class", "tablebtn");

    // CallPMindexChangeFrame();

};;;



