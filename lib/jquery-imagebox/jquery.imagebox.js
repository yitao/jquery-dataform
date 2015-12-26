/**
 * 图片盒子
 */

(function($, window, document, undefined){
	String.prototype.trim=function() {  
	    return this.replace(/(^\s*)|(\s*$)/g,'');
	};
	String.prototype.replaceAll=function(o,n) { 
	    return this.replace(new RegExp(o+"{1}",['g']),n);  
	};
	function __str2json(data){
		return JSON.parse(data);
	}
	
	$.imagebox = {
		defaults:{
			type:"s",//单图模式，d:多图模式
			model:"box",	//显示模式，single-text,single-image,box,album
			cover:"../../img/portraitbg.jpg",
			uploadPath:"../../file/imageupload",//上传图片路径
			uploadsPath:"../../file/imagesupload",//上传图片路径
			name:"file",//上传文件field名称
			names:"files",//上传文件field名称
			downloadPath:"../../file/filedownload",//下载图片路径
			removePath:"../../file/removefile",//移除图片路径
			dataType:"string",//返回数据类型，string,json
			dataPath:["result","Response"],//返回数据解析路径
			loadFilter:function(data){return data.result.Response},
			itemSide:"80px",//图片最大边长
			scrollType:"h",//滚动方式，h：横向，v:纵向
			width:"400px",//控件宽
			height:"400px"//控件高
		}
	}

	//图片盒子
	var ImageBox = function(ele,options){
		this.ele = ele;
		this.$ele = $(ele);
		this.options = $.extend(true,{},$.imagebox.defaults,options);
		this.data = [];
		this.itemClickAbled=true;
		this._createBox();
		this._renderBox();
	}
	
	//请求数据
	ImageBox.prototype._requestData = function(self,url,callback,error,param,type){
		type= type==null?"post":type;
		var opt = {url:url,type:type,
			success:function(json){
				callback(self,self.loadFilter(json));
			},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				error(self,XMLHttpRequest, textStatus, errorThrown);
			}
		};
		if(param!=null){
			opt.data = param;
		}
		$.ajax(opt);
	}
	
	//创建盒子
	ImageBox.prototype._createBox = function(){
		var self = this;
		switch(self.options.model){
			case "box":
				self._renderModelBox();
				break;
			case "single-text":
				break;
			case "single-image":
				break;
			case "album":
				break;
		}
	}
	
	//盒子模式 box
	ImageBox.prototype._renderModelBox = function(){
		var self = this;
		var ihtml = "<div class='imagebox_container'>"+
		"<div class='imagebox_toolbar'><button id='imagebox_upload'>上传</button></div>"+
		"<div class='imagebox_box'></div></div>";
		self.$ele.html(ihtml);
		var form = "";
		if(self.options.type=="s"){
			form = "<form id='imagebox_imageBox' method='post' action='"+self.options.uploadPath+"' style='display:none'  enctype='multipart/form-data'>"+
			"<input type='file' name='"+self.options.name+"' accept='image/*'/></form>";
		}
		if(self.options.type=="d"){
			form = "<form id='imagebox_imageBox' method='post' action='"+self.options.uploadsPath+"' style='display:none'  enctype='multipart/form-data'>"+
			"<input type='file' name='"+self.options.names+"' accept='image/*' multiple='multiple'/></form>";
		}
		self.$ele.find(".imagebox_container").append(form);
		var markDiv = "<div class='imagebox_mark_panel' style='display:none;'><span class='imagebox_btn_delete'></span></div>";
		self.$ele.find(".imagebox_box").append(markDiv);
	}
	//单文本模式single-text
	ImageBox.prototype._renderModelSingleText = function(){
		
	}
	//单图片模式single-image
	ImageBox.prototype._renderModelSingleImage = function(){
		
	}
	//相册模式album
	ImageBox.prototype._renderModelAlbum = function(){
		
	}
	
	//创建盒子
	ImageBox.prototype.changeModel = function(model){
		var self = this;
		
	}
	
	//递交盒子，样式渲染，事件监听
	ImageBox.prototype._renderBox = function(){
		var self = this;
		if(self.options.scrollType=="h"){//图片盒子，滚动方式
			self.$ele.find(".imagebox_box").css("white-space","nowarp");
		}else{
			self.$ele.find(".imagebox_box").css("white-space","nomarl");
		}
		self.$ele.find(".imagebox_container").width(self.options.width);
		self.$ele.find(".imagebox_container").height(self.options.height);
		var tbHeight = self.$ele.find(".imagebox_toolbar").height();
		var boxHeight = parseInt(self.options.height) - tbHeight;
		self.$ele.find(".imagebox_box").height(boxHeight+"px");
		var $mark = $(self.$ele.find(".imagebox_container").find(".imagebox_mark_panel")[0]);
		$mark.click(function(){
			var item = self.clickItem;
			self.removeItem(item);
		});
		self.$ele.find("#imagebox_upload").unbind("click").bind('click',{self:self},self._choiceImage);
	}
	
	//创建图片项
	ImageBox.prototype._createItem = function(json){
		var self = this;
		var image = json;
		if(self.options.type=="s"){
			self.data.push(image);
//			var images = ["560a2bb5acada7316cfc4705","5636e4894c9dcc25f4e92ab9","560a2bb5acada7316cfc4709","560a5984acada72fdc305866"];
//			var image = images[parseInt(Math.random()*10%images.length)];
			var ihtml = "<div class='imagebox_item' data-value='"+image+"' style='display:none;'><img  src='../../file/filedownload?_id="+image+"'/></div>";
			self.$ele.find(".imagebox_box").append(ihtml);
			var $lastItem = $(self.$ele.find(".imagebox_box").find(".imagebox_item").last());
			$lastItem.css("width",self.options.itemSide);
			$lastItem.css("height",self.options.itemSide);
			var last = $lastItem.find("img")[0];
			last.onload=function(){
				var nw = last.naturalWidth;//原始框
				var nh = last.naturalHeight;//原始高
				var iside = parseInt(self.options.itemSide);//边长
				if(nw>nh){
					$(last).css("width",self.options.itemSide);
					var mt = Math.abs(iside-nh/nw*iside)/2;
					$(last).css("margin-top",mt+"px");
				}else{
					$(last).css("height",self.options.itemSide);
					var ml = Math.abs(iside-nw/nh*iside)/2;
					$(last).css("margin-left",ml+"px");
				}
				$lastItem.css("display","inline-block");
			}
			self._renderItem();
		}
		if(self.options.type=="d"){
			var images = image;
			for(var i in images){
				var image = images[i];
				self.data.push(image);
//			var images = ["560a2bb5acada7316cfc4705","5636e4894c9dcc25f4e92ab9","560a2bb5acada7316cfc4709","560a5984acada72fdc305866"];
//			var image = images[parseInt(Math.random()*10%images.length)];
				var ihtml = "<div class='imagebox_item' data-value='"+image+"' style='display:none;'><img  src='../../file/filedownload?_id="+image+"'/></div>";
				self.$ele.find(".imagebox_box").append(ihtml);
				var $lastItem = $(self.$ele.find(".imagebox_box").find(".imagebox_item").last());
				$lastItem.css("width",self.options.itemSide);
				$lastItem.css("height",self.options.itemSide);
				var last = $lastItem.find("img")[0];
				last.onload=function(){
					var nw = last.naturalWidth;//原始框
					var nh = last.naturalHeight;//原始高
					var iside = parseInt(self.options.itemSide);//边长
					if(nw>nh){
						$(last).css("width",self.options.itemSide);
						var mt = Math.abs(iside-nh/nw*iside)/2;
						$(last).css("margin-top",mt+"px");
					}else{
						$(last).css("height",self.options.itemSide);
						var ml = Math.abs(iside-nw/nh*iside)/2;
						$(last).css("margin-left",ml+"px");
					}
					$lastItem.css("display","inline-block");
				}
				self._renderItem();
			}
		}
	}
	//图片上传
	ImageBox.prototype._uploadImage = function(e){
		//‘this’ 指文件上传框 
		var uploadFileDom = this;
		var files = uploadFileDom.files;
		var self = e.data.self;
		self.$ele.find("#imagebox_imageBox").form('submit', {
			success: function(json){
				uploadFileDom.value="";
//					self.$ele.find("[name='"+self.options.name+"']").unbind("change");
				if(self.options.dataType=="string"){
					json = __str2json(json);
				}
				json = self.options.loadFilter(json);
				self._createItem(json);
			}
		});
	}
	
//	点击图片上传按钮，选择图片
	ImageBox.prototype._choiceImage = function(e){
		var self = e.data.self;
		if(self.options.type=="s"){
			self.$ele.find("form#imagebox_imageBox").find("[name='"+self.options.name+"']").trigger("click");
			self.$ele.find("form#imagebox_imageBox").find("[name='"+self.options.name+"']").unbind("change").one("change",{self:self},self._uploadImage);
		}
		if(self.options.type=="d"){
			self.$ele.find("form#imagebox_imageBox").find("[name='"+self.options.names+"']").trigger("click");
			self.$ele.find("form#imagebox_imageBox").find("[name='"+self.options.names+"']").unbind("change").one("change",{self:self},self._uploadImage);
		}
	}
	
	//绘制图片项，点击图片项，显示工具栏
	ImageBox.prototype._renderItem = function(){
		var self = this;
		self.$ele.find(".imagebox_box").find(".imagebox_item").last().mouseenter(function(){
			$(this).css("outline","1px dotted #f00");
		});
		self.$ele.find(".imagebox_box").find(".imagebox_item").last().mouseleave(function(){
			$(this).css("outline","0");
		});
		self.$ele.find(".imagebox_box").find(".imagebox_item").last().click(function(){
			if(self.itemClickAbled){
				var $mark = $(self.$ele.find(".imagebox_container").find(".imagebox_mark_panel")[0]);
				if(self.clickItem!=null&&self.clickItem!=this){
					var p = this.offsetParent;
					var w = $(this).width(); 
					var mw = $mark.width(); 
					var h = $(this).height(); 
					var ol = this.offsetLeft;
					var ot = this.offsetTop;
					$mark.css("top",ot+"px");
					$mark.css("left",(ol+w-mw)+"px");
					$mark.css("display","block");
					self.clickItem = this;
				}else{
					self.clickItem = this;
					var s = $mark.css("display");
					if(s=="block"){
						$mark.css("display","none");
					}else{
						var p = this.offsetParent;
						var w = $(this).width(); 
						var mw = $mark.width(); 
						var h = $(this).height(); 
						var ol = this.offsetLeft;
						var ot = this.offsetTop;
						$mark.css("top",ot+"px");
						$mark.css("left",(ol+w-mw)+"px");
						$mark.css("display","block");
					}
				}
			}
		});
	}	
	
	//移除图片项
	ImageBox.prototype.removeItem = function(dom){
		var self = this;
		//TODO 请求删除图片接口
		var _id = $(dom).attr("data-value");
		self._requestData(self, self.options.removePath, function(){self.data.pop(_id);}, function(){}, {_id:_id});
		//移除UI对应元素
		$(dom).remove();
//		移除mark
		var $mark = $(self.$ele.find(".imagebox_container").find(".imagebox_mark_panel")[0]);
		$mark.css("display","none");
	}
	
	//获取数据
	ImageBox.prototype.getData = function(){
		return this.data;
	}
	
//	设置数据
	ImageBox.prototype.setData = function(value){
		for(var i in value){
			var v = value[i];
			this._createItem(v);
		}
	}
	
//	设置可读 状态
	ImageBox.prototype.readonly = function(v){
		var self = this;
		if(v==true){
			self.$ele.find("#imagebox_upload").attr("disabled","true");
		}else if(v==false){
			self.$ele.find("#imagebox_upload").removeAttr("disabled");
		}
	}
	
	
//	jquery 插件，只赋予对应元素第一个
	$.fn.imagebox = function(options) {
		if(this&&this.length>0){
			return new ImageBox(this[0],options);
		}
    };
    
})(jQuery,window,document);