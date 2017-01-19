// 抓取上传图片，转换代码结果，显示图片的dom
var doc = document,
	img_upload =  doc.getElementById('img_upload'),
	base64_code = doc.getElementById('base64_code'),
	img_area = doc.getElementById('img_area');


var readFile = function(){
	var file = this.files[0];
	var reader = new FileReader();

	reader.onload = function(){
		base64_code.innerHTML = this.result; 

		/*如果是图片文件则输出来*/
		if(/image\/\w+/.test(file.type)){ 
			/*alert("请确保文件为图像类型"); */
			img_area.innerHTML = '<div>图片img标签展示：</div><img src="' + this.result + '" alt=""/>'; 
			return false; 
		}
	}

	// html5的接口FileReader.readAsDataURL()可以将任意文件转换成base64编码格式，
	// 并且再以data：URL的形式展现出来。
	reader.readAsDataURL(file);
};

// 添加功能出发监听事件
img_upload.addEventListener('change', readFile, false);
