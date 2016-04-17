;(function(win, lib) {
    var doc = win.document;
    var docEl = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var dpr = 1;
    var scale = 1;
    var tid = null;    
    function refreshRem(){
        var width = docEl.getBoundingClientRect().width;
            width *= dpr;
        var rem = width / 10;
        docEl.style.fontSize = rem + 'px';
    }
    win.addEventListener('resize', function() {
        tid && clearTimeout(tid);
        tid = setTimeout(refreshRem, 300);
    }, false);

    if (doc.readyState === 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
    } else {
        doc.addEventListener('DOMContentLoaded', function(e) {
            doc.body.style.fontSize = 12 * dpr + 'px';
        }, false);
    }
    refreshRem();
})(this);