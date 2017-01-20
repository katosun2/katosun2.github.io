/**
 * 图片压缩，默认同比例压缩
 * @param {Object} path  
 *     pc端传入的路径可以为相对路径，但是在移动端上必须传入的路径是照相图片储存的绝对路径
 * @param {Object} obj
 *     obj 对象 有 width， height， quality(0-1)
 * @param {Object} callback
 *     回调函数有一个参数，base64的字符串数据
 */
function dealImage(path, obj, callback){
	var img = new Image();

	img.onload = function(){
		var that = this;
		// 默认按比例压缩
		var w = that.width,
			h = that.height,
			scale = w / h;

		w = obj.width || w;
		h = obj.height || (w / scale);
		var quality = 0.7;    // 默认图片质量为0.7

		//生成canvas
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		// 创建属性节点
		var anw = document.createAttribute("width");
		anw.nodeValue = w;
		var anh = document.createAttribute("height");
		anh.nodeValue = h;
		canvas.setAttributeNode(anw);
		canvas.setAttributeNode(anh); 
		ctx.drawImage(that, 0, 0, w, h);

		// 图像质量
		if(obj.quality && obj.quality <= 1 && obj.quality > 0){
			quality = obj.quality;
		}
		// quality值越小，所绘制出的图像越模糊
		var base64 = canvas.toDataURL('image/jpeg', quality);
		// 回调函数返回base64的值
		callback(base64);
	}

	img.src = path;
}

/*处理*/
var doc = document,
	img_upload = doc.getElementById('img_upload');

img_upload.addEventListener('change', function(event){
	var el = event.srcElement,
		file = el.files[0];

	console.log(file);

	/*通过文件读取*/
	var reader = new FileReader();
	reader.onload = function(e){
		dealImage(e.target.result, {width: 200, height: 200, quality:0.7}, function(base64){
			document.getElementById('img_result').src = base64;
		});
	};
	reader.readAsDataURL(file);  

}, true);
