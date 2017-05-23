
function load_common_menu(){
    
    if($('#user_center')){
        var txt  = '<div class="content-block"> \
         <p>这是一个侧栏</p> \
            <p></p> \
            <p><a href="#" class="close-panel">关闭</a></p> \
        </div>';
        $('#user_center').append(txt);
    }
}