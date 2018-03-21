/*!
 * 
 * 检测和获取浏览器flash版本
 * @Version 1.0.1
 * @return {hasFlash: hasFlash, v: flashVersion}
 *
 */

(function(window, undefined) {
    "use strict";

    var flashChecker = function() {
        /*是否安装了flash*/
        var hasFlash = 0,
            /*flash版本*/
            flashVersion = 0,
            /*是否IE浏览器*/
            isIE = (!!window.ActiveXObject) || (!!navigator.userAgent.match(/Trident.*rv\:11\./));

        if (isIE) {
            try{
                var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                if (swf) {
                    hasFlash = 1;
                    flashVersion = swf.GetVariable("$version");

                    /* 转换为数字 */
                    flashVersion = flashVersion.toString().split(',')[0];
                    flashVersion = Number(flashVersion.replace(/[^\d]+/, ''));
                }
            }catch(e){}
        } else {
            if (navigator.plugins && navigator.plugins.length > 0) {
                var swf = navigator.plugins['Shockwave Flash'];

                if (swf) {
                    var desc = swf.description.split(' ');

                    hasFlash = 1;

                    /*获取版本号，一般情况*/
                    for(var i = 0; i < desc.length; i++){
                        if(Number(desc[i]) > 0){
                            flashVersion = Number(desc[i]);
                            break;
                        }
                    }
                }
            }
        }

        return {
            hasFlash: !!hasFlash,
            ver: flashVersion
        };
    }

    if (typeof define === 'function' && define.amd) {
        define(function() {
            return flashChecker;
        });
    } else if (typeof module === 'object' && module && typeof module.exports === 'object' && module.exports) {
        module.exports = flashChecker;
    } else {
        window.flashChecker = flashChecker;
    }

})(function() {
    return this || window;
}());
