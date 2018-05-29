/*! =============================================================================
#     FileName: file2Img.js
#         Desc: 将任意文件转化为图片
#               基于 http://www.zhangxinxu.com/wordpress/?p=6661 修改成网页版本
#      Creator: Ryu
#        Email: ryu@imiku.com
#      Version: 1.0
#   LastChange: 2018-05-29 15:52:14
============================================================================= */
(function(){
    var file2Img = {
        /* 检测是否支持File API */
        checkBrowser: function() {
            if (window.File && window.FileReader && window.FileList && window.Blob) {
                //  支持
                return true;
            } else {
                console('当前浏览器不支持该功能');
                return false;
            }
        },

        /* 创建临时 canvas 计数器 */
        canvasCounter: 1,

        /* 创建临时canvas */
        createCanvas: function(width, height) {
            var me = file2Img,
                canvas = document.createElement('canvas');

            me.canvasCounter++;
            canvas.id = 'canvas' + me.canvasCounter;
            canvas.width = width;
            canvas.height = height;
            canvas.style.cssText = ['display:none'].join(";");

            return canvas;
        },

        /**
         * @params { Object } 文件对像
         * @params { String } 文件编码，GB2312 | UTF-8(默认)
         * @params { Function } 回调生成对象{ canvas, size, filename, data } 
         * 
         */
        readFileToCanvas: function(file, encoding, callback) {
            var me = file2Img; 

            if(!me.checkBrowser){
                alert('当前浏览器不支持该功能');
            };

            var filename = file.name,
                reader = new FileReader();

            /* 文件编码 */
            encoding = encoding || 'UTF-8';

            /* 渲染文件 */
            reader.onload = function(e) {
                var data = e.target.result;
                var length = data.length;
                var size = Math.ceil(Math.sqrt(length));

                // 绘制canvas
                var canvas = me.createCanvas(size, size);
                var ctx = canvas.getContext('2d');

                // 获取透明像素数据
                var imgData = ctx.getImageData(0, 0, size, size);
                // 透明像素数据替换为实色数据
                var index = 0;

                for (var start=0; start<size*size; start++) {
                    var charCode = data.charCodeAt(start);
                    if (Number.isNaN(charCode) == false) {
                        var hex = (charCode + '').padStart(6, '0');
                        for (var i=0; i<6; i+=2) {
                            imgData.data[index++] = parseInt('0x' + hex.slice(i, i + 2));   
                        }
                        // 透明度
                        imgData.data[index++] = 255;
                    }
                }
                // 使用新颜色信息绘制
                ctx.putImageData(imgData, 0, 0);

                // 保存的PNG文件名
                var imgFilename = filename.split('.')[0];

                /* 回调数据 */
                callback && callback({
                    canvas: canvas,
                    data: canvas.toDataURL("image/png"),
                    type: 'png',
                    filename: imgFilename,
                    width: size,
                    height: size
                });
            };

            /* 读取文件 */
            reader.readAsText(file, 'UTF-8');
        }
    };

    // export
    if ( typeof define === "function" && define.amd ) {
        define(function() { return file2Img; });
    } else if ( typeof module !== "undefined" && module.exports ) {
        module.exports = file2Img;
    } else {
        window.file2Img = file2Img;
    }
})();
