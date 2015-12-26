/**
 * jquery-dataform jquery 插件- 数据表单 v0.2
 * 注意： 
 * 初始创建
 * 实现功能：
 * 文本域
 * 图片上传域
 * v0.2 更新内容
 * 内置插件 js 合并，（外部调用 只需要 本js）
 * 内置插件：《jquery,jquery-easyui,layer,kindeditor,jquery-imagebox》
 * 内置插件 css 引用，（外部调用 只需要 本js）
 * 外部插件 可拔插配置
 * 配置结构调整 
 * 增加表单项，表单事件 监听功能 配置
 * v0.3 更新内容
 * 调整jquery-easyui 插件加载方式，取消dataTags配置，改用easyui原始加载数据方式
 * - 并且配置默认 监听 easyui 事件方法
 * 调整radio , checkbox 远程数据加载方式
 * 读写 字段分离，field 为写入数据字段（上传数据字段），rfield为读取数据字段（源数据中的字段）
 * 新增 内嵌插件：
 * 1. 小标题域
 * 2. 勾选文本域
 * 3. 多行文本域
 * 4. 勾选输入域
 * 5. 勾选按钮域
 * v0.4 更新内容
 * 1. 技术重构
 * 2. 自带验证器
 */

;//增加 常用js 内置对象 原型方法
(function($, layer, window, document, undefined){
	//字符串 前后空格清除 方法（）
	String.prototype.trim=function(){return this.replace(/(^\s*)|(\s*$)/g,'');};
	//字符串 匹配字符 全部替换 方法（匹配字符串，替换字符串）
	String.prototype.replaceAll=function(o,n){return this.replace(new RegExp(o+"{1}",['g']),n);};
	//日期 格式化 方法（格式字符串）
	Date.prototype.format = function(fmt){
		fmt = fmt==null?"yyyy-MM-dd":fmt;
		var y = this.getFullYear();//yyyy
		var M = this.getMonth()+1>9?(this.getMonth()+1):'0'+(this.getMonth()+1);//MM
		var d = this.getDate()>9?this.getDate():'0'+this.getDate();//dd
		var D = this.getDay()>9?(this.getDay()>99?this.getDay():'0'+this.getDay()):'00'+this.getDay();//全年天数
		var H = this.getHours()>9?this.getHours():'0'+this.getHours();//HH H:24小时制；
		var m = this.getMinutes()>9?this.getMinutes():'0'+this.getMinutes();//mm
		var s = this.getSeconds()>9?this.getSeconds():'0'+this.getSeconds();//ss
		var S = this.getMilliseconds()>9?(this.getMilliseconds()>99?this.getMilliseconds():'0'+this.getMilliseconds()):'00'+this.getMilliseconds();;//SSS
//		var q = Math.floor((this.getMonth()+3)/3); //季度   
		fmt = fmt.replaceAll("Y","y").replaceAll("h","H")
		.replace(/y(?=y{4})/g,"0").replace(/M(?=M{2})/g,"0").replace(/d(?=d{2})/g,"0").replace(/D(?=D{3})/g,"0")
		.replace(/H(?=H{2})/g,"0").replace(/m(?=m{2})/g,"0").replace(/s(?=s{2})/g,"0").replace(/S(?=S{3})/g,"0")
		.replace(/y{1,4}/g,y).replace(/M{1,2}/g,M).replace(/d{1,2}/g,d).replace(/D{1,3}/g,D).replace(/H{1,2}/g,H).replace(/m{1,2}/g,m)
		.replace(/s{1,2}/g,s).replace(/S{1,3}/g,S)
		;
		return fmt;
	}

var JsPath = function(){var a=document.scripts,b=a[a.length-1],c=b.src;if(!b.getAttribute("merge"))return c.substring(0,c.lastIndexOf("/")+1)}();
//jquery-easyui 日期文本中文化
$.fn.calendar.defaults.weeks=["日","一","二","三","四","五","六"];
$.fn.calendar.defaults.months=["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"];
//jquery-easyui 验证器文本中文化
$.fn.validatebox.defaults.missingMessage = "该项为必填项";
$.fn.validatebox.defaults.rules.email.message = "请输入合法邮箱地址";
$.fn.validatebox.defaults.rules.length.message = "请输入合法长度内容";
$.fn.validatebox.defaults.rules.url.message = "请输入合法链接地址";
$.fn.combobox.defaults.missingMessage = "该项为必填项";

//jquery anchor
$.fn.anchor = function(){
	var ms = new Date().getTime();
	$(this).before("<a id='anchor_"+ms+"'></a>");
	window.location.href = "#anchor_"+ms;
	$(this).parent().trigger("click");
	$(this).prev("#anchor_"+ms)[0].remove();
}
//自定义验证器-表单验证器

/** ---声明 表单项域--- **/

//	默认数据表单 配置
$.dataform = {
	validators:{//验证器,k = type
		notnull: {//非空验证
			validator: function(value,params){
				return !$.dataform.ipu.isNull(value);
			},
			message: "该项为必填项"
		},
		integer:{//整数
			validator: function(value,params){
				RegExp_integer=new RegExp(/^\d+$/);
				return value.match(RegExp_integer)==null?false:true;    
			},
			message: '请输入整数'  
		},
		float:{//浮点数
			validator: function(value,params){
				RegExp_integer=new RegExp(/^\d+$/);
				RegExp_float=new RegExp(/^\d+.\d+$/);
				return value.match(RegExp_float)==null?(value.match(RegExp_integer)==null?false:true):true;  
	        },
	        message: '请输入合法数字'  
		},
		similar2:{//2个值比较
			validator: function(value,params){
				var result = false;
				try{
					result = value==params[0];
				}catch(e){}
				return result;  
	        },
	        message: '两次输入值不一致'  
		},
		a0:{//格式验证，数字和字母组合
			validator: function(value,params){
				RegExp_a0=new RegExp(/^[0-9a-zA-Z]*$/);
				return value.match(RegExp_a0)==null?false:true;  
	        },
	        message: '请只输入数字和字母组合'
		},
		length:{//长度验证
			validator: function(value,params){
				var result = false;
				try{
					var min = params[0];
					var max = params[1];
					if(value.length>=min&&value.length<=max){
						result = true;
					}
				}catch(e){}
				return result;  
	        },
	        message: '请输入合法长度数据'
		},
		phone:{//格式验证，手机号码(暂支持13和15开头手机号码验证)
			validator: function(value,params){
				RegExp_phone=new RegExp(/^1[35]{1}[0-9]{9}$/);
				return value.match(RegExp_phone)==null?false:true;  
	        },
	        message: '非法手机号码'
		},
		email:{//格式验证，邮箱,形如 xxx@xx.xx
			validator: function(value,params){
				RegExp_a0=new RegExp(/^[0-9a-zA-Z]*@[0-9a-zA-Z]+.[0-9a-zA-Z]+$/);
				return value.match(RegExp_a0)==null?false:true;  
	        },
	        message: '非法邮箱格式'
		},
		size:{//数组长度验证
			validator: function(value,params){
				var result = false;
				try{
					var min = params[0];
					var max = params[1];
					if(value.length>=min&&value.length<=max){
						result = true;
					}
				}catch(e){}
				return result;  
	        },
	        message: '请输入合法长度数据'
		}
	},
	ipu: {//内置处理器
		isNull: function(value){//是否空值判断
			if(value==null || value==undefined){
				return true;
			}
			if(typeof(value)=="string" && value.trim()==""){
				return true;
			}
			if(typeof(value)=="number" && isNaN(value)){
				return true;
			}
			return false;
		},
		json2str: function (data){//json 对象 转化为 json 字符串
			return JSON.stringify(data);
		},
		str2json: function(str){//json 字符串 转化为 json 对象
			return JSON.parse(str);
		},
		decodeTemplate: function(fn){//编码方法
			return fn.toString().replace(/^function\s*\(\s*\)\s*\{\s*\/\*/g, "").replace(/\*\/;?\s*\}$/g, "");
		},
		templateFunc: function(func,data){//模板化 方法 依赖 jquery-tmpl
			var t = $.dataform.ipu.decodeTemplate(func);
			var tmp = $.tmpl(t,data);
			var ohtml = tmp[0].outerHTML;
			return ohtml;
		},
		parseData: function(value,dataType,spliter){//解析数据为对应数据类型
			switch(dataType){
				case "integer":
					value = parseInt(value);
					break;
				case "float":
					value = parseFloat(value);
					break;
				case "boolean":
					if(typeof(value)=="string"){
						value = eval(value);
					}
					value = value?true:false;
					break;
				case "object":
					value = eval(value);
					break;
				case "integer[]":
					var values = value.split(spliter);
					value = [];
					for(var i in values){
						value[i] = parseInt(values[i]);
					}
					break;
				case "float[]":
					var values = value.split(spliter);
					value = [];
					for(var i in values){
						value[i] = parseFloat(values[i]);
					}
					break;
				case "boolean[]":
					var values = value.split(spliter);
					value = [];
					for(var i in values){
						value = values[i];
						if(typeof(value)=="string"){
							value = eval(value);
						}
						value = value?true:false;
						values[i] = value;
					}
					break;
				case "object[]":
					var values = value.split(spliter);
					value = [];
					for(var i in values){
						value[i] = eval(values[i]);
					}
					break;
				default://string
					break;
			}
			return value;
		},
		afterHtml5: function(dataform){//按照正常html5解析后需要做的额外事件

		},
		validator: { //内置验证处理
			register : function(dataform,item){
				var name = item.field;
				var dom = dataform.getEditor(name);
				if(dom!=null&&dom.blur!=null){
					$(dom).blur(function(){
						$.dataform.ipu.validator.validate(dataform,item);
					});
				}
			},
			validate : function(dataform,item){
				var result = true;
				var name = item.field;
				var value = dataform.getItemData(name);
				var validators = item.validators==null?[]:item.validators;
				//var dom = dataform.getDomWithName(name);
				//var dom = dataform.getEditor(name);
				
				
				for(var i=0;i<validators.length;i++){
					var params = [];
					var vali = validators[i];
					var type = vali.split("(")[0];
					
					var validator = $.dataform.validators[type];
					if(validator==null){
						return false;
					}
					var func = validator.validator;
					var message = validator.message;
					params = $.dataform.ipu.validator.params(dataform,item,vali);
					if(params.length>0){
						message = params[0]!=null?params[0]:message;
						params.shift();
					}
					result = func(value,params);
					if(!result){
						var dom = dataform.get$WithStor(name);
						if(dom!=null){
							dom = dom.parent();
							$(dom).anchor();
							layer.tips(message,dom);
						}
					}
				}
				return result;
			},
			params:function(dataform,item,vali){//dataform 验证器参数设置
				var params = [];
				var type = vali.split("(")[0];
				var r = vali.match(/\((.*)\)/); 
				var par = [];
				if(r!=null&&r.length>1){
					par = r[1];
					par = "["+par+"]";
					par = eval(par);
				}
				switch(type){
					case "notnull"://非空
						var message = par.length>0?par[0]:null;
						params.push(message);
						break;
					case "integer"://整数
						var message = par.length>0?par[0]:null;
						params.push(message);
						break;
					case "float"://浮点数
						var message = par.length>0?par[0]:null;
						params.push(message);
						break;
					case "similar2"://2个值比较
						var name = par[0];
						var v2 = dataform.getItemData(name);
						var message = par.length>1?par[1]:null;
						params.push(message);
						params.push(v2);
						break;
					case "a0"://数字字母格式
						var message = par.length>0?par[0]:null;
						params.push(message);
						break;
					case "length"://长度限制
						var min = par[0];
						var max = par[1];
						var message = par.length>2?par[2]:null;
						params.push(message);
						params.push(min);
						params.push(max);
						break;
				}
				return params;
			}
		}
	},
	defaults:{
		DPT:{//dom prototype 原型容器
			//提示域
			tipSpace:function(){/* <div class='dataform_tipbox dataform_tip'>{{html tip}}</div> */},
			//标准标签域-默认基准线为baseline对齐
			labelSpace:function(){/* <div class='dataform_labelbox'>{{html label}}</div> */},
			//基准线为 top对齐，标签
			labelTopSpace:function(){/* <div class='dataform_labelbox dataform_labelbox_top'>{{html label}}</div> */},
			// 空标签域
			labelEmptySpace:function(){/* <div class='dataform_labelbox' style='display:none;'></div> */},
			// 空白标签域
			labelBlankSpace:function(){/* <div class='dataform_labelbox'></div> */},
			//隐藏 文本域
			hiddenSpace:function(){/*
			<div class='dataform_valuebox' style="display:none;"><input name="${field}" value="${value}" type="hidden" /></div>
			*/},
			//单行文本域
			textSpace:function(){/*
			<div class='dataform_valuebox'><input name="${field}" type="text" value="${value}"/></div>
			*/},
			//多行文本域
			textareaSpace:function(){/*
			<div class='dataform_valuebox'>
				<textarea name="${field}">${value}</textarea></div>
			*/},
			//单行密码域
			passwordSpace:function(){/*
			<div class='dataform_valuebox'><input name="${field}" type="password" value="${value}"/></div>
			*/},
			//jquery input容器域
			jqueryInputSpace:function(){/*
			<div class='dataform_valuebox'><input name="${field}" type="text"/></div>
			 */},
			//	隐藏 单个图片上传 域
			ImageUploadFormSpace :function(){/*
			<form id="${id}" method="post" action="${action}" style="display:none"  enctype="multipart/form-data">
				<input type="file" name="${name}" accept="image/*"/>  
			</form>*/},
			//	图片文本 数据柄域
			imageSpace:function(){/*
			<div class='dataform_valuebox'>
				<input class="imageInput" name="${field}" type="text" value="${value}" disabled/><button class="handlerBtn" data-handler="${field}">上传</button></div>
			*/},
			//	地图 数据柄域
			mapSpace:function(){/*
			<div class='dataform_valuebox'>
				<input class="imageInput" name="${field}" type="text" value="${value}" disabled/><button class="handlerBtn" data-handler="${field}">选点</button></div>
			*/},
			//	inline-block div域
			divLineBoxSpace:function(){/*
			<div class='dataform_valuebox'>
				<div id='${field}' style='display:inline-block'></div></div>
			 */},
			//	勾选框域
			checkBoxSpace:function(){/*
			<div class='dataform_valuebox' data-checkbox='${field}'></div>
			*/},
			//	勾选框 数据模板域
			checkBoxSpace_data:function(){/*
			<div>
				{{each data}}
				<input type="checkbox" name="${field}" value="${$value[valueField]}"/><div class="linetext">${$value[textField]}</div>
				{{/each}}
			</div>
			*/},
			//	单选框域
			radioSpace:function(){/*
			<div class='dataform_valuebox' data-radio='${field}'></div>
			*/},
			//单选框 数据模板域
			radioSpace_data:function(){/*
			<div>
				{{each data}}
				<input type="radio" name="${field}" value="${$value[valueField]}"/><div class="linetext">${$value[textField] }</div>
				{{/each}}
			</div>
			*/},
			// 小标题域
			titleSpace:function(){/*
				<div class='dataform_valuebox dataform_title' id='${field}' style:"display:inline-block;">{{html value}}</div>
				*/},
			//大提示域
			btipSpace:function(){/* <div class='dataform_valuebox dataform_tip' id='${field}'>{{html value}}</div> */},
			//勾选 文本域
			scheckBoxSpace:function(){/*
					<div class='dataform_valuebox' style="font-size:18px;">
						<input name="${field}" type="checkbox" style="margin:0px 10px 0 30px;"/>{{html label}}</div>
					*/},
			//勾选输入 数据柄域
			checkInputSpace: function(){/*
				<div class='dataform_valuebox' style="font-size:18px;">
					<input name="${field}_handler" data-controller="${field}" type="checkbox" style="margin:0px 10px 0 30px;"/>${label}
					<input name="${field}" type="text" disabled="true" />{{html hlabel}}
					</div>*/},
			//勾选按钮数据柄域
			checkButtonSpace: function(){/*
				<div class='dataform_valuebox' style="font-size:18px;">
					<input name="${field}_controller" data-controller="${field}" type="checkbox" style="margin:0px 10px 0 30px;"/>${label}
					<input name="${field}" type="hidden"/>
					<button data-handler="${field}" style="width:auto;">{{html hlabel}}</button>
					</div>*/}
		},
		//showtype dom  显示类型 和 dom 原型关系,
		/* 每个 插件或者 原生部件 实现 都需要 以下5个方法
		 * 原生Dom绘制（配置到labelSpace,valueSpace） ，
		 * 初始(init方法)，设置数据（setData方法），获取数据（getData(方法），可读设置 （readonly方法）
		 * 其中 stor 代表选择器类型
		 * */ //TODO
		STD:{
			hidden: {//隐藏
				stor:"name",
				labelSpace:"labelEmptySpace",
				valueSpace:"hiddenSpace"
			},
			text: {//单行文本
				stor:"name",
				labelSpace:"labelSpace",
				valueSpace:"textSpace"
			},
			textarea: {//多行文本
				stor:"name",
				labelSpace:"labelTopSpace",
				valueSpace:"textareaSpace"
			},
			password: {//密码
				stor:"name",
				labelSpace:"labelSpace",
				valueSpace:"passwordSpace"
			},
			title: {//标题
				stor:"id",
				labelSpace: "labelEmptySpace",
				valueSpace: "titleSpace"
			},
			tip: {//提示
				stor:"id",
				labelSpace: "labelBlankSpace",
				valueSpace: "btipSpace"
			}
		},
		Styles:{//内部 挂载样式,k为 jquery 选择器，v为样式字符串 TODO
			'':'{font-family: Georgia,"Times New Roman",Times,Kai,"Kaiti SC",KaiTi,BiauKai,FontAwesome,serif;}',
			'.dataform_table':"{width:100%;}",
			'.dataform_itembox':"{width:100%;height:auto;}",
			'.dataform_labelbox,.dataform_valuebox,.dataform_tipbox':'{display:inline-block;overflow:hidden;text-overflow:ellipsis;}',
			'.dataform_labelbox':'{padding-right:10px;text-align:right;}',
			'.dataform_labelbox_top':'{vertical-align: top;}',
			'.dataform_title':"{text-align:left;font-size:18px;font-weight:bold;color:#444444;}",
			'.dataform_tip':'{font-size:14px;padding-left:5px;}',
			'.linetext' : '{display:inline-block;}',
			'button':'{font-family: Georgia,"Times New Roman",Times,Kai,"Kaiti SC",KaiTi,BiauKai,FontAwesome,serif;font-size:16px;font-weight:20px;height:26px;width:70px;margin-right:20px;float:right;}',
			//h(handler)模式 按钮样式
			'.handlerBtn':"{margin-left:20px;float:none;}",
			//easyui 样式覆盖
			'.combo .combo-text':"{vertical-align: top;}",
			//百度地图搜索栏 样式覆盖
			'#searchbarbox':'{width:100%;height:60px;background-color:rgba(0,0,0,0.1);z-index:1;position:relative;}',
			'#searchbar':'{width:284px;height:36px;margin:auto;padding:12px 0;}',
			'#searchbar input':'{display:inherit;width:220px;height:30px;line-height:30px;float:left;}',
			'#searchbar button':'{display:inherit;width:60px;height:36px;margin:0;float:left;}',
			//图片盒子 样式覆盖
			'.imagebox_container':'{width:100%;height:100%;background-color:#eee;border:1px solid #ccc;}',
			'.imagebox_toolbar':'{width:100%;height:auto;background-color:#fff;border-bottom:1px solid #ccc;}',
			'.imagebox_toolbar #imagebox_upload':'{display: inherit;width:60px;height:30px;margin:4px;float:none;}',
			'.imagebox_box':'{width:100%;height:300px;overflow:auto;position:relative;white-space:nowrap;}',
			'.imagebox_box .imagebox_item':'{margin:10px;width:80px;height:80px;display:inline-block;vertical-align:top;}',
			'.imagebox_mark_panel':'{position:absolute;z-index:9002;display:block;background-color:rgba(0,0,0,0.3);width:25px;height:25px;left:0;top:0;}',
			'.imagebox_btn_delete':'{display:inline-block;width:25px;height:25px;border:0;border-collapse:collapse;padding:0;background:url("img/icons_01.png") -167px -132px no-repeat;}'
		},
		Scripts:[
		         "../../js/kindeditor-4.1.10/kindeditor.js?t=7",
		         "../../js/kindeditor-4.1.10/lang/zh_CN.js",
		         ],//预加载 脚本
		BtnAlign:"right",//left center right
		Yes:{//确认按钮
			id:"submitBtn"+new Date().getTime(),
			show:true,
			text:"确定",
		},
		No:{//取消按钮
			id:"cancelBtn"+new Date().getTime(),
			show:true,
			text:"取消"
		},
		Readonly:false,//初始表单是否只可读
		Title:null,
		TitleTextAlign:"center",
		LabelWidth:"80px",//标签宽度
		LabelPright:"10px",//右padding
		LabelTextAlign:"right",//标签排列
		Width:"100%",//表单宽度
		Height:"100%",//表单高度
		LineHeight:"40px",//默认tr行高
		LineIheight:"38px",//表单域默认行高
		LineIwidth:"220px",//表单域默认行宽
		DateFormat:"yyyy-MM-dd",//默认日期格式
		DateTimeFormat:"yyyy-MM-dd HH:mm:ss",//默认时间格式
		Action:"",//表单提交路径
		SuccessText:"请求完成",//请求成功文本提示
		ErrorText:"请求失败",//请求失败文本提示
		ImageUpload:{//隐藏文件上传表单
			show:true,//默认第一次构建是否显示
			id:"imageupload"+new Date().getTime(),
			action:"../../file/imageupload",
			name:"file"
		},
		Spliter:",",//数据格式为数组的切割符号
		columns:[[]]	
	}
};

//1. 读取配置，构建DataForm对象
var DataForm = function(ele,options){
	var self = this;
	this.options = $.extend(true,{},$.dataform.defaults,options);
	this.options.columns = options.columns;
	var opts = this.options;
	opts.Id ="dataform_"+new Date().getTime(),//表单id
	opts.path = JsPath;//js文件加载路径
	opts.Ele = ele;//容器对象
	opts.$Ele = $(ele);//容器jquery对象
	opts.Items={};//项数据k(项field):v(项对象)
	opts.Data={};//数据
	opts.SaveData={};//存档数据
	opts.ValidateQueue=[];//验证队列
	opts.Editors={};//插件编辑器
	opts.Events={};//表单事件，不包含表单项事件
	opts.ext={//默认扩展配置
		init:function(self,row,callback){
			var opts = self.options;
			var name = row.field;
			//注册编辑器
			var editor = self.get$WithName(name);
			self.options.Editors[row.field] = editor;
			
			//TODO 绑定监听事件, 级联
			if(row.ext!=null&&row.ext.cascades!=null){
				self.get$WithName(name).change(function(e,self,row){
					for(var i in row.ext.cascades){
						var cascadeOpt = row.ext.cascades[i];
						self.cascade(row.field, cascadeOpt.to, cascadeOpt.deal, cascadeOpt.opts);
					}
				});
			}
			//hint
			if(row.hint!=null){
				self.get$WithName(name).attr("placeholder",row.hint);
			}
			if(row.showType=="hidden"){
				self.get$WithName(name).parents(".dataform_tr").last().css("display","none");
			}
			//html5 浏览器兼容后续处理
			//自定义扩展表单项执行方法
			callback?callback(self,row):null;

			//注册验证器
			if(row.validators!=null){
				$.dataform.ipu.validator.register(self,row);
				opts.ValidateQueue.unshift(name);
			}
		},
		loadData:function(self,row,callback){
			//自定义扩展表单项执行方法
			callback?callback(self,row):null;
		},
		setValue:function(self,row,value,callback){
			var name = row.field;
			self.getDomWithName(name).value = value;
			//自定义扩展表单项执行方法
			callback?callback(self,row,value):null;
		},
		getValue:function(self,row,callback){
			var spliter = row.spliter==null?self.options.Spliter:row.spliter;
			var name = row.field;
			var value = null;
			if(row.showType=="hidden"||row.showType=="text"||row.showType=="password"||row.showType=="textarea"){
				value = self.getDomWithName(name).value;
				value = $.dataform.ipu.parseData(value,row.dataType,spliter);
			}
			//自定义扩展表单项执行方法
			callback?value=callback(self,row):null;
			return value;
		},
		readonly:function(self,row,readonly,callback){
			var name = row.field;
			self.getDomWithName(name).disabled = row.disabled?true:readonly;
			//自定义扩展表单项执行方法
			callback?callback(self,row,readonly):null;
		},
		loadFilter:function(data){
			if(data!=null&&data.result!=null&&data.result.Code==200){
				return data.result.Response;
			}else{
				//请求数据失败
				alert("请求数据失败");
				return [];
			}
		}
	};
	self._createDomPrototype();
	self._initDom();

}

//2. 创建Dom原型 TODO
DataForm.prototype._createDomPrototype = function(){
	var opts = this.options;
	var self = this;
	var data = opts.columns;
	var formBox = ["<div id='"+opts.Id+"'>"];
	var table = [];
	var rowSize = 0;//行数
	var colSize = data.length;//列数
	formBox.push("<table class='dataform_table'>");
	for (var ic=0;ic<colSize;ic++){//遍历每列
		var col = data[ic];
		var tempRowSize = 0;
		table[ic] = [];
		for(var ir=0;ir<col.length;ir++){//遍历每列 行数，计算最大行数
			var item = data[ic][ir];
			if(item.field==null){
				if(item.td!=null&&item.td==true){
					table[ic].push("<td class='dataform_td'></td>");
				}else{
					table[ic].push("");
				}
				continue;
			}
			var rs = item.rowspan==null?1:item.rowspan;
			//单元格最大可跨列数为 最大列数
			item.colspan = item.colspan==null?1:(item.colspan>(colSize-ic)?(colSize-ic):item.colspan);
			tempRowSize +=item.colspan;
			item.showType = item.showType==null?"text":item.showType;
			var showType = item.showType;
			item.stor = opts.STD[showType]==null?'name':opts.STD[showType].stor;//选择器
			item.disabled = item.disabled==null?false:item.disabled;//可操作性，针对于可读设置
			item.showonly = item.showonly==null?false:item.showonly;//不作为数据参数
			item.rfield = item.rfield==null?item.field:item.rfield;//源数据字段
			item.height = item.height==null?opts.LineHeight:item.height;
			
			item.iheight = item.iheight==null?item.height:item.iheight;
			item.lheight = item.lheight==null?item.iheight:item.lheight;
			
			item.width = item.width==null?opts.LineIwidth:item.width;
			item.iwidth = item.width;
			opts.Items[item.field] = item;
			var showType = item.showType;
			var _ihtml = "";
			_ihtml += "<td "+(item.rowspan==null?"":("rowspan='"+item.rowspan+"'"))+(item.colspan==null?"":("colspan='"+item.colspan+"'"))+"><div class='dataform_itembox'>";
			
			var l = eval('opts.DPT.'+(opts.STD[showType].labelSpace==null?"labelSpace":opts.STD[showType].labelSpace));
			_ihtml += $.dataform.ipu.templateFunc(l,item);
			
			var v = eval('opts.DPT.'+(opts.STD[showType].valueSpace==null?"textSpace":opts.STD[showType].valueSpace));
			_ihtml += $.dataform.ipu.templateFunc(v,item);
			
			var t = eval('opts.DPT.'+(opts.STD[showType].tipSpace==null?"tipSpace":opts.STD[showType].tipSpace));
			_ihtml += $.dataform.ipu.templateFunc(t,item);
			
			_ihtml += "</div></td>";
			table[ic].push(_ihtml);
		}
	}
	var rowSize = table[0].length;
//	debugger
	for(var r=0;r<rowSize;r++){
		formBox.push("<tr class='dataform_tr'>");
		for(var c in table){
			formBox.push(table[c][r]);
		}
		formBox.push("</tr>");
	}
	var cancelHtml = "<button id='"+opts.No.id+"'>"+opts.No.text+"</button>";
	var submitHtml = "<button id='"+opts.Yes.id+"'>"+opts.Yes.text+"</button>";
	formBox.push("<tr class='dataform_tr'><td colspan='"+table.length+"' class='dataform_td'><div class='dataform_btnbox'>"+submitHtml+(opts.No.show?cancelHtml:"")+"</div></td></tr>");
	formBox.push("</table>");
	formBox.push("</div>");
//	ihtml += "<tr><td colspan='2'><div class='btnBox'>"+submitHtml+(opts.No.show?cancelHtml:"")+"</div></td></tr>";
//	ihtml += "</table>";
//	ihtml += "</div>";
//	debugger
	var ihtml = formBox.join("");
	opts.$Ele.append(ihtml);
}


//3. Dom样式渲染，Dom 事件监听 TODO
DataForm.prototype._initDom = function(){
	var opts = this.options;
	//确定，取消按钮点击事件监听 注册
	if(opts.Yes.show){
		this.bindSubmit({self:this},this.submit);
	}
	if(opts.No.show){
		this.bindCancel({self:this},this.cancel);
	}
	var styleTags = ["<style type='text/css'>"];
	for(var k in opts.Styles){
		styleTags.push("#"+opts.Id+" "+k);
		styleTags.push(opts.Styles[k]);
	}
	styleTags.push("#"+opts.Id+" table tr");
	styleTags.push("{height:"+opts.LineHeight+"}");//tr 行高
	
	styleTags.push("</style>");
	var styleIhtml = styleTags.join("");
	$("head").append(styleIhtml);
	//容器样式
	this.get$self().css("width",opts.Width);
	this.get$self().css("height",opts.Height);
	//行高
	this.get$self().find(".dataform_labelbox").css("width",opts.LabelWidth);
	this.get$self().find(".dataform_labelbox").css("padding-right",opts.LabelPright);
	
	//this.get$self().find(".dataform_itembox").css("height",opts.LineHeight);
	for(name in opts.Items){
		var row = opts.Items[name];
		var showType = row.showType;
		var stor = row.stor;
		var h = row.height;	//输入框容器外tr 高度
		var ih = row.iheight;//输入框容器 高度
		var lh = row.lheight;//输入框容器 行高
		var w = row.width;//输入框宽度
		var iw = w;
		var $item = this.get$WithStor(name);
		var $itemBox = $item.parents(".dataform_itembox");
		var $trBox = $itemBox.parents(".dataform_tr");
		var $labelBox = $itemBox.find(".dataform_labelbox");
		var $tipBox = $itemBox.find(".dataform_tipbox");
		var $valueBox = $itemBox.find(".dataform_valuebox");
		$trBox.css("height",h);
		$itemBox.css("height",ih);
		$labelBox.css("line-height",lh);
		$tipBox.css("line-height",lh);
		$valueBox.css("height",ih);
		$item.css("width",iw);
		if($item!=null&&$item.length>0&&
			($item[0].tagName=="INPUT" || $item[0].tagName=="SELECT" || $item[0].tagName=="TEXTAREA")){
			$item.css("height",(parseFloat(ih)-6)+"px");
		}else{
			$valueBox.css("line-height",ih);
		}
		$labelBox.height($valueBox.height());
		$tipBox.height($valueBox.height());

		opts.ext.init(this,row,opts.STD[row.showType].init);
	}
}


//监听确认按钮
DataForm.prototype.bindSubmit = function(data,callback){
	var opts = this.options;
	this.get$WithId(opts.Yes.id).unbind('click').bind('click',data,callback);
}

//监听取消按钮
DataForm.prototype.bindCancel = function(data,callback){
	var opts = this.options;
	this.get$WithId(opts.No.id).unbind('click').bind('click',data,callback);
}

//开放功能TODO

//查询表单 jquery 对象
DataForm.prototype.get$self = function(){
	var opts = this.options;
	return $("#"+opts.Id);
}
//查询表单项 controller 容器 jquery 对象
DataForm.prototype.get$controller = function(name){
	return this.get$self().find("[data-controller='"+name+"']");
}
//查询表单项 handler 容器 jquery 对象
DataForm.prototype.get$handler = function(name){
	return this.get$self().find("[data-handler='"+name+"']");
}
//查询表单项 radio 容器 jquery 对象
DataForm.prototype.get$radio = function(name){
	var opts = this.options;
	return this.get$self().find("[data-radio='"+name+"']");
}
//查询表单项 checkbox 容器 jquery 对象
DataForm.prototype.get$checkbox = function(name){
	var opts = this.options;
	return this.get$self().find("[data-checkbox='"+name+"']");
}
//查询表单项 dom 对象
DataForm.prototype.getDomWithName = function(name){
	var opts = this.options;
	return this.get$self().find("[name='"+name+"']")[0];
}
//查询表单项 dom 对象
DataForm.prototype.getDomWithId = function(name){
	var opts = this.options;
	return this.get$self().find("#"+name)[0];
}
//查询表单项 dom jquery 对象
DataForm.prototype.get$WithName = function(name){
	var opts = this.options;
	return this.get$self().find("[name='"+name+"']");
}
//查询表单项 dom jquery 对象
DataForm.prototype.get$WithId = function(name){
	var opts = this.options;
	return this.get$self().find("#"+name);
}
//查询表单项 插件编辑器
DataForm.prototype.getEditor = function(name){
	var opts = this.options;
	return opts.Editors[name];
}
//查询表单项 插件编辑器
DataForm.prototype.get$WithStor = function(name){
	var opts = this.options;
	var stor = this.getItem(name).stor;
	return this.get$self().find("["+stor+"='"+name+"']");;
}
//查询表单项 对象
DataForm.prototype.getItem = function(name){
	var opts = this.options;
	return opts.Items[name];
}
//查询表单项对象 显示类型 showType
DataForm.prototype.getItemShowType = function(name){
	return this.getItem(name).showType;
}
//设置表单项数据 TODO
DataForm.prototype.setItemData = function(name,value){
	var opts = this.options;
	opts.Data[name] = value;
	var row = this.getItem(name);
	opts.ext.setValue(this,row,value,opts.STD[row.showType].setValue);
}
//获取表单项数据
DataForm.prototype.getItemData = function(name){
	var opts = this.options;
	var row = this.getItem(name);
	var value = opts.ext.getValue(this,row,opts.STD[row.showType].getValue);
	opts.Data[name] = value;
	return value;
}
//清除表单项数据
DataForm.prototype.clearItemData = function(name){
	var opts = this.options;
	this.setItemData(name,null);
	opts.Data[name] = null;
}
//设置表单项存档数据
DataForm.prototype.setItemSaveData = function(name){
	var opts = this.options;
	var value = this.getItemData(name);
	opts.SaveData[name] = value;
}
//获取表单项存档数据
DataForm.prototype.getItemSaveData = function(name){
	var opts = this.options;
	return opts.SaveData[name];
}
//恢复表单项数据
DataForm.prototype.recoverItemData = function(name){
	var value = this.getItemSaveData(name);
	this.setItemData(value);
}
//表单项可设置 可读状态 设置,true:则不再对可读进行操纵，false:则放行
DataForm.prototype.itemDisabled=function(name,disabled){
	var row = this.getItem(name);
	row.disabled = disabled;
}
//表单项设置是否可读
DataForm.prototype.itemReadonly = function(name,readonly){
	var opts = this.options;
	var row = this.getItem(name);
	opts.ext.readonly(this,row,readonly,opts.STD[row.showType].readonly);
}

//设置表单数据 TODO
DataForm.prototype.setData = function(data){
	var opts = this.options;
	for(name in opts.Items){
		var rname = opts.Items[name].rfield;
		this.setItemData(name,data[rname]);
	}
}
//获取表单有效数据
DataForm.prototype.getData = function(){
	var opts = this.options;
	var data = {};
	for(name in opts.Items){
		var row = opts.Items[name];
		if(!row.showonly){
			var value = this.getItemData(name);
			if(value!=null){
				data[name] = value;
			}
		}
	}
	return data;
}
//清除表单数据
DataForm.prototype.clearData = function(){
	var opts = this.options;
	for(name in opts.Items){
		if(opts.Items[name].showType!="hidden"){
			this.setItemData(name,"");
		}
	}
	this.Data={};
}

//表单数据存档
DataForm.prototype.saveData = function(){
	var opts = this.options;
	for(name in opts.Items){
		this.setItemSaveData(name);
	}
}
//恢复表单数据
DataForm.prototype.recoverData = function(){
	var opts = this.options;
	var data = opts.SaveData;
	for(name in opts.Items){
		this.setItemData(data[name]);
	}
}
//表单可读状态设置,如果表单项目设置了 disabled 属性为true，那么便不再改变可读状态
DataForm.prototype.readonly = function(readonly){
	var opts = this.options;
	for(name in opts.Items){
		this.itemReadonly(name,readonly);
	}
}
//TODO 
//递交 数据绘制,兼容版本1
DataForm.prototype.renderData = function(data){
	this.setData(data);
}
//清除表单数据,兼容版本1
DataForm.prototype.clearAll = function(){
	this.clearData();
}

//所有表单项 设为 不可操作,兼容 第一版
DataForm.prototype.disableAll = function(){
	this.readonly(true);
}

//所有表单项 设为 可操作，兼容 第一版
DataForm.prototype.enableAll = function(){
	this.readonly(false);
}

//获取表单验证结果集合 TODO
DataForm.prototype.getValidRes = function(){
	var opts = this.options;
	var res = [];
	for(i in opts.ValidateQueue){//遍历验证队列
		var name = opts.ValidateQueue[i];
		var row = this.getItem(name);
		if(!$.dataform.ipu.validator.validate(this,row)){
			res.push(name);
		}
	}
	return res;
}
//获取表单验证是否通过
DataForm.prototype.isValid = function(){
	var res = this.getValidRes();
	return res.length>0?false:true;
}


//表单提交
DataForm.prototype.submit = function(e){
	var self = e.data.self;
	var opts = self.options;
	if(self.beforeSubmit()){
		var url = self.options.Action;
		var param = self.getData();
		var callback = self.afterSubmit;
		var error = self._error;
		var opt = {url:url,type:"post",
			success:function(json){
				callback(self,json);
			},
			error:function(XMLHttpRequest, textStatus, errorThrown){
				error(self,XMLHttpRequest, textStatus, errorThrown);
			}
		};
		opt.data = param==null?[]:param;
		$.ajax(opt);
	}else{
		layer.msg("请确认表单填写完整",{icon:3,shift:-6});
	}
}
//表单取消
DataForm.prototype.cancel = function(e){
	var self = e.data.self;
	var opts = self.options;
	if(self.beforeCancel()){
		
		self.afterCancel();
	}
}
//Before 表单提交
DataForm.prototype.beforeSubmit = function(){
	var opts = this.options;
	var res = this.isValid();
	var func = eval(opts.Events.beforeSubmit);
	res = func==null?res:func();
	return res;
}
//After 表单提交
DataForm.prototype.afterSubmit = function(){
}
//Before 表单取消
DataForm.prototype.beforeCancel = function(name){
	var opts = this.options;
	var res = true;
	var func = eval(opts.Events.beforeCancel);
	res = func==null?res:func();
	return res;
}
//After 表单取消
DataForm.prototype.afterCancel = function(name){
	var opts = this.options;
	var func = eval(opts.Events.afterCancel);
	func==null?null:func();
}
//设置表单事件绑定
DataForm.prototype.bind = function(e,func){
	var opts = this.options;
	opts.Events[e] = func;
}
//清除表单事件绑定
DataForm.prototype.unbind = function(e){
	var opts = this.options;
	opts.Events[e] = null;
}

//设置表单项事件绑定
DataForm.prototype.bindItem = function(name,e,func){
	this.get$WithName(name).bind(e,func);
}

//清除表单项事件绑定
DataForm.prototype.unbindItem = function(name,e){
	this.get$WithName(name).unbind(e);
}

DataForm.prototype.changeAction = function(action){
	this.options.Action = action;
}


//图片上传
DataForm.prototype._uploadImage = function(e){
	//‘this’ 指文件上传框 
	var uploadFileDom = this;
	var files = uploadFileDom.files;
	var self = e.data.self;
	var name = e.data.name;
	if(files.length==1){
		$(".dataform_panel").find("#imageBox").form('submit', {
			success: function(json){
				uploadFileDom.value="";
				json = $.dataform.ipu.str2json(json);
				if(json!=null&&json.result!=null&&json.result.Code==200){
					layer.msg("上传成功",{icon:6});
					self.setRowData(name,json.result.Response);
				}else{
					layer.msg("上传失败",{icon:5});
				}
			}
		});
	}else{
		layer.msg("请选择图片",{icon:3});
	}
}

//	点击图片上传按钮，选择图片
DataForm.prototype._choiceImage = function(e){
	var name = e.data.name;
	var self = e.data.self;
	$("#"+self.id).find("form#imageBox").find("[name='"+self.options.ImageUpload.name+"']").trigger("click");
	$("#"+self.id).find("form#imageBox").find("[name='"+self.options.ImageUpload.name+"']").unbind("change").one("change",{self:self,name:name},self._uploadImage);
}

//	点击地图 上传按钮，选择图片
DataForm.prototype._choiceMap = function(e){
	var name = e.data.name;
	var self = e.data.self;
	layer.open({
	    type: 2,
	    title: '地图管理',
	    shadeClose: false,
	    shade: 0.8,
	    area: ['90%', '90%'],
	    content: JsPath+'lib/pbaidumap.html', //iframe的Action
	    end:function(){
	    	var lon = layer.lon;
	    	var lat = layer.lat;
	    	if(lon!=null&&lat!=null){
	    		$("#"+self.id).find("[name='"+name+"']").val(lon+","+lat)
	    	}
	    }
	}); 
}

//	监听确认按钮
DataForm.prototype.bindSubmit = function(data,callback){
	var self = this;
	self.get$WithId(self.options.Yes.id).unbind('click');
	self.get$WithId(self.options.Yes.id).bind('click',data,callback);
}

//	监听取消按钮
DataForm.prototype.bindCancel = function(data,callback){
	var self = this;
	self.get$WithId(self.options.No.id).unbind('click');
	self.get$WithId(self.options.No.id).bind('click',data,callback);
}

//	ajax 请求失败 执行函数
DataForm.prototype._error = function(self,XMLHttpRequest, textStatus, errorThrown){
	layer.msg("ajax请求失败！",{icon:5,shift:-6});
}

/*	高级扩展 - 数据级联
 *  from: 被级联 者
 *  to  : 级联者
 *  deal:处理方法，方法包含参数为（self,fromItem,toItem,外部参数）
 *  opts: deal 方法 参数
 */
DataForm.prototype.cascade = function(from,to,deal,opts){
	deal(this,this.getItem(from),this.getItem(to),opts);
}
//下拉级联方法
DataForm.prototype.deal_cascade4select = function(self,fromItem,toItem,opts){
	//TODO
}
$.dataform.deal_cascade4select = DataForm.prototype.deal_cascade4select;
//百度地图选点级联方法1，根据地图选点，回填经度
DataForm.prototype.deal_cascade4baidumapLon = function(self,fromItem,toItem,opts){
	var fromName = fromItem.field;
	var toName = toItem.field;
	var data = self.getItemData(fromName);
	if(data.lon!=null){
		self.setItemData(toName,data.lon);
	}
}
$.dataform.deal_cascade4baidumapLon = DataForm.prototype.deal_cascade4baidumapLon;
//百度地图选点级联方法2，根据地图选点，回填纬度
DataForm.prototype.deal_cascade4baidumapLat = function(self,fromItem,toItem,opts){
	var fromName = fromItem.field;
	var toName = toItem.field;
	var data = self.getItemData(fromName);
	if(data.lat!=null){
		self.setItemData(toName,data.lat);
	}
}
$.dataform.deal_cascade4baidumapLat = DataForm.prototype.deal_cascade4baidumapLat;
//百度地图选点级联方法3，根据地图选点，回填地址详细
DataForm.prototype.deal_cascade4baidumapAddress = function(self,fromItem,toItem,opts){
	var fromName = fromItem.field;
	var toName = toItem.field;
	var data = self.getItemData(fromName);
	if(data.searchResult.result!=null){
		self.setItemData(toName,data.searchResult.result.sematic_description);
	}
}
$.dataform.deal_cascade4baidumapAddress = DataForm.prototype.deal_cascade4baidumapAddress;
//百度地图选点级联方法4，根据地图选点，回填 省份信息
DataForm.prototype.deal_cascade4baidumapProvince = function(self,fromItem,toItem,opts){
	var fromName = fromItem.field;
	var toName = toItem.field;
	var data = self.getItemData(fromName);
	if(data.searchResult.result!=null){
		self.setItemData(toName,data.searchResult.result.addressComponent.province);
	}
}
$.dataform.deal_cascade4baidumapProvince = DataForm.prototype.deal_cascade4baidumapProvince;
//百度地图选点级联方法5，根据地图选点，回填 城市详细
DataForm.prototype.deal_cascade4baidumapCity = function(self,fromItem,toItem,opts){
	var fromName = fromItem.field;
	var toName = toItem.field;
	var data = self.getItemData(fromName);
	if(data.searchResult.result!=null){
		self.setItemData(toName,data.searchResult.result.addressComponent.city);
	}
}
$.dataform.deal_cascade4baidumapCity = DataForm.prototype.deal_cascade4baidumapCity;
//百度地图选点级联方法6，根据地图选点，回填 县区详细
DataForm.prototype.deal_cascade4baidumapCounty = function(self,fromItem,toItem,opts){
	var fromName = fromItem.field;
	var toName = toItem.field;
	var data = self.getItemData(fromName);
	if(data.searchResult.result!=null){
		self.setItemData(toName,data.searchResult.result.addressComponent.district);
	}
	self.get$WithName(toName).trigger("change",[self,toItem]);
}
$.dataform.deal_cascade4baidumapCounty = DataForm.prototype.deal_cascade4baidumapCounty;



//	jquery 插件，只赋予对应元素第一个
$.fn.dataform = function(options) {
	if(this&&this.length>0){
		return new DataForm(this[0],options);
	}
};
//checkbox & radio 扩展
var conf4multi = {
	STD:{
		checkbox:{
			stor:'data-checkbox',
			labelSpace:"labelSpace",
			valueSpace:"checkBoxSpace",
			init:function(self,row){
				var opts = self.options;
				row.ext =row.ext ==null?{}:row.ext;
				row.ext.checkbox=row.ext.checkbox==null?{}:row.ext.checkbox;
				var url = row.ext.checkbox.url;
				var data = row.ext.checkbox.data;
				if(url!=null){
					var param = row.ext.param;
					var opt = {url:url,type:"post",
						success:function(json){
							try{
								if(json.result.Code==200){
									var data = json.result.Response;
									row.ext.checkbox.data = data;
									var conf = {field:row.field,data:data};
									conf.valueField= row.ext.checkbox.valueField==null?"value":row.ext.checkbox.valueField;
									conf.textField= row.ext.checkbox.textField==null?"text":row.ext.checkbox.textField;
									var dhtml = $.dataform.ipu.templateFunc(opts.DPT.checkBoxSpace_data,conf);
									var c = self.get$checkbox(row.field);
									c.html("").append(dhtml);
								}else{
									alert(json.result.Code+":"+json.result.Msg);
								}
							}catch(e){
								alert("数据异常，请联系管理员");
							}
						}
					};
					opt.data = param==null?[]:param;
					$.ajax(opt);
				}
				if(data!=null){
					var conf = {field:row.field,data:data};
					conf.valueField= row.ext.checkbox.valueField==null?"value":row.ext.checkbox.valueField;
					conf.textField= row.ext.checkbox.textField==null?"text":row.ext.checkbox.textField;
					var dhtml = $.dataform.ipu.templateFunc(opts.DPT.checkBoxSpace_data,conf);
					var c = self.get$checkbox(row.field);
					c.html("").append(dhtml);
				}
				var editor = self.get$WithName(row.field);
				self.options.Editors[row.field] = editor;
			},
			setValue:function(self,row,value){
				self.get$WithName(row.field).each(function(i,item){
					item.checked = false;
					for(v in value){
						if(item.value==value[v]){
							item.checked = true;
						}
					}
				});
			},
			getValue:function(self,row){
				var value = [];
				self.get$WithName(row.field).each(function(i,item){
					if(item.checked){
						value.push(item.value);
					}
				});
				return value;
			},
			readonly: function(self,row,readonly){
				self.get$WithName(row.field).each(function(i,item){
					item.disabled = readonly;
				});
			}
		},
		radio:{
			stor:'data-radio',
			labelSpace:"labelSpace",
			valueSpace:"radioSpace",
			init:function(self,row){
				var opts = self.options;
				row.ext =row.ext ==null?{}:row.ext;
				row.ext.checkbox=row.ext.checkbox==null?{}:row.ext.checkbox;
				var url = row.ext.radio.url;
				var data = row.ext.radio.data;
				if(url!=null){
					var param = row.ext.param;
					var opt = {url:url,type:"post",
						success:function(json){
							try{
								if(json.result.Code==200){
									var data = json.result.Response;
									row.ext.data = data;
									var conf = {field:row.field,data:data};
									conf.valueField= row.ext.radio.valueField==null?"value":row.ext.radio.valueField;
									conf.textField= row.ext.radio.textField==null?"text":row.ext.radio.textField;
									var dhtml = $.dataform.ipu.templateFunc(opts.DPT.radioSpace_data,conf);
									var c = self.get$radio(row.field);
									c.html("").append(dhtml);
								}else{
									alert(json.result.Code+":"+json.result.Msg);
								}
							}catch(e){
								alert("数据异常，请联系管理员");
							}
						}
					};
					opt.data = param==null?[]:param;
					$.ajax(opt);
				}
				if(data!=null){
					var conf = {field:row.field,data:data};
					conf.valueField= row.ext.radio.valueField==null?"value":row.ext.radio.valueField;
					conf.textField= row.ext.radio.textField==null?"text":row.ext.radio.textField;
					var dhtml = $.dataform.ipu.templateFunc(opts.DPT.radioSpace_data,conf);
					var c = self.get$radio(row.field);
					c.html("").append(dhtml);
				}
				var editor = self.get$WithName(row.field);
				self.options.Editors[row.field] = editor;
			},
			setValue:function(self,row,value){
				var spliter = row.spliter==null?self.options.Spliter:row.spliter;
				self.get$WithName(row.field).each(function(i,item){
					item.checked = false;
					if($.dataform.ipu.parseData(item.value,row.dataType,spliter)==value){
						item.checked = true;
					}
				});
			},
			getValue:function(self,row){
				var value = null;
				var spliter = row.spliter==null?self.options.Spliter:row.spliter;
				self.get$WithName(row.field).each(function(i,item){
					if(item.checked){
						value = item.value;
					}
				});
				value = $.dataform.ipu.parseData(value,row.dataType,spliter);
				return value;
			},
			readonly:function(self,row,readonly){
				self.get$WithName(row.field).each(function(i,item){
					item.disabled = readonly;
				});
			}
		}
	}
}

//easyui 扩展
var conf4easyui = {
	STD:{
		datebox:{
			stor:"name",
			labelSpace:"labelSpace",
			valueSpace:"jqueryInputSpace",
			init:function(self,row){
				row.ext =row.ext ==null?{}:row.ext;
				row.ext.datebox=row.ext.datebox==null?{}:row.ext.datebox;
				var conf = $.extend(true,{},row.ext.datebox);//配置
				conf.width = row.width==null?self.options.LineWidth:row.width;
				conf.width = parseFloat(conf.width);
				conf.height = row.height==null?self.options.LineHeight:row.height;
				conf.height = parseFloat(conf.height);
				conf.panelWidth = conf.width;
				conf.editable = false;
				var f = self.options.DateFormat;//系统默认日期格式
				if(row.ext&&row.ext.datebox&&row.ext.datebox.formatter){
					f = row.ext.datebox.formatter;//用户自定义日期格式
				}
				conf.formatter = function(date){
					return date.format(f);
				}
				var blur0 = conf.onHidePanel;
				var blur  = function(date){
					$.dataform.ipu.validator.validate(self,row);
			        blur0 == null?null:blur0(date);
			    }
			    
				var editor = self.get$WithName(row.field).datebox(conf);
				self.options.Editors[row.field] = editor;
				editor.datebox({onHidePanel:blur});//.onHidePanel=blur;
			},
			setValue:function(self,row,value){
				var editor = self.options.Editors[row.field];
				editor.datebox("setValue",value);
			},
			getValue:function(self,row){
				var value = null;
				var editor = self.options.Editors[row.field];
				value = editor.datebox("getValue");
				return value;
			},
			readonly:function(self,row,readonly){
				var editor = self.options.Editors[row.field];
				readonly?editor.datebox('disable'):editor.datebox('enable');
			}
		},
		datetimebox:{
			stor:'name',
			labelSpace:"labelSpace",
			valueSpace:"jqueryInputSpace",
			init:function(self,row){
				row.ext =row.ext ==null?{}:row.ext;
				row.ext.datetimebox=row.ext.datetimebox==null?{}:row.ext.datetimebox;
				var conf = $.extend(true,{},row.ext.datetimebox);//配置
				conf.width = row.width==null?self.options.LineWidth:row.width;
				conf.width = parseFloat(conf.width);
				conf.height = row.height==null?self.options.LineHeight:row.height;
				conf.height = parseFloat(conf.height);
				conf.panelWidth = conf.width;
				conf.editable = false;
				var f = self.options.DateTimeFormat;//系统默认日期格式
				if(row.ext&&row.ext.datetimebox&&row.ext.datetimebox.formatter){
					f = row.ext.datetimebox.formatter;//用户自定义日期格式
				}
				conf.formatter = function(date){
					return date.format(f);
				}
				var blur0 = conf.onHidePanel;
				var blur  = function(date){
					$.dataform.ipu.validator.validate(self,row);
			        blur0 == null?null:blur0(date);
			    }
				var editor = self.get$WithName(row.field).datetimebox(conf);
				self.options.Editors[row.field] = editor;
				editor.datetimebox({onHidePanel:blur});//.onHidePanel=blur;
			},
			setValue:function(self,row,value){
				var editor = self.options.Editors[row.field];
				editor.datetimebox("setValue",value);
			},
			getValue:function(self,row){
				var value = null;
				var editor = self.options.Editors[row.field];
				value = editor.datetimebox("getValue");
				return value;
			},
			readonly:function(self,row,readonly){
				var editor = self.options.Editors[row.field];
				readonly?editor.datetimebox('disable'):editor.datetimebox('enable');
			}
		},
		combobox:{
			stor:'name',
			labelSpace:"labelSpace",
			valueSpace:"textSpace",
			init:function(self,row){
				row.ext = row.ext==null?{}:row.ext;
				var conf = $.extend(true,{},row.ext.combobox);//配置
				conf.width = row.width==null?self.options.LineWidth:row.width;
				conf.width = parseFloat(conf.width);
				conf.height = row.height==null?self.options.LineHeight:row.height;
				conf.height = parseFloat(conf.height);
				conf.panelWidth = conf.width;
				conf.editable = conf.editable==null?false:conf.editable;
				if(conf.url!=null){
					conf.loadFilter = conf.loadFilter==null?self.options.ext.loadFilter:conf.loadFilter;
				}
				var blur0 = conf.onHidePanel;
				var blur  = function(date){
					$.dataform.ipu.validator.validate(self,row);
			        blur0 == null?null:blur0(date);
			    }
				var editor = self.get$WithName(row.field).combobox(conf);
				
				self.options.Editors[row.field] = editor;
				editor.combobox({onHidePanel:blur});//.onHidePanel=blur;
			},
			setValue:function(self,row,value){
				var editor = self.options.Editors[row.field];
				editor.combobox("setValue",value);
			},//设置数据方法，默认参数（数据）
			getValue:function(self,row){
				var editor = self.options.Editors[row.field];
				return editor.combobox('getValue');
			},//获取数据方法，默认无参数
			readonly:function(self,row,readonly){
				var editor = self.options.Editors[row.field];
				readonly?editor.combobox('disable'):editor.combobox('enable');
			}
		}
	}
};

//百度地图扩展
var conf4baidumap = {
	STD:{
		map:{
			stor:'name',
			labelSpace:"labelSpace",
			valueSpace:"mapSpace",
			init: function(self,row){
				var clickHandler = function(e){
					var self = e.data.self;
					var row = e.data.row;
					var opts = self.options;
					var path = opts.path;
					layer.open({
					    type: 2,
					    title: '地图管理',
					    shadeClose: false,
					    shade: 0.8,
					    area: ['90%', '90%'],
					    content: path + 'lib/pbaidumap.html', //iframe的url
					    end:function(){
					    	var lon = layer.lon;
					    	var lat = layer.lat;
					    	if(lon!=null&&lat!=null){
					    		self.get$WithName(row.field).val(lon+","+lat);
					    		self.setItemData(row.field,[lon,lat]);
					    		$.dataform.ipu.validator.validate(self,row);
					    	}
					    }
					}); 
				};
				//handler 样式矫正
				self.get$WithName(row.field).height(self.get$WithName(row.field).height()-6);
				self.get$handler(row.field).height(self.get$WithName(row.field).height());
				self.get$handler(row.field).bind('click',{self:self,row:row},clickHandler);
				
			},
			readonly:function(self,row,readonly){
				var name = row.field;
				self.get$handler(name)[0].disabled = row.disabled?true:readonly;
			}
		},
		bmap:{
			stor:"id",
			labelSpace:"labelTopSpace",
			valueSpace:"divLineBoxSpace",
			init:function(self,row){
				var editor = {};
				var map;
				var localSearch;
				var marker;
				var conf = {};
				var name = row.field;
				conf.width = row.width==null?"800px":row.width;
				conf.height = row.height==null?"400px":row.height;
				self.get$WithId(name).css("width",conf.width);
				self.get$WithId(name).css("height",conf.height);
				
				map = new BMap.Map(name);    // 创建Map实例
				map.centerAndZoom("嘉兴", 12);
			    map.enableScrollWheelZoom();    //启用滚轮放大缩小，默认禁用
			    map.enableContinuousZoom();    //启用地图惯性拖拽，默认禁用
			
			    map.addControl(new BMap.NavigationControl());  //添加默认缩放平移控件
			    map.addControl(new BMap.OverviewMapControl()); //添加默认缩略地图控件
			    map.addControl(new BMap.OverviewMapControl({ isOpen: true, anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));   //右下角，打开
			
			    localSearch = new BMap.LocalSearch(map);
			    localSearch.enableAutoViewport(); //允许自动调节窗体大小
			    localSearch.setSearchCompleteCallback(function (searchResult) {
			    	editor.data.searchResult = searchResult;
			    	if(searchResult!=null){
				        var poi = searchResult.getPoi(0);
				        console.info(poi);
				        map.centerAndZoom(poi.point, 16);
				        editor.moveMarker(poi.point);
				        editor.showInfo(poi);
			    	}
			    });
			    
			    editor.map = map;
			    editor.localSearch = localSearch;
			    editor.marker = marker;
			    editor.data = {};
				editor.t = new Date().getTime();
			    
			    editor.addSearchBar = function(){
					var tbs = self.get$WithId(name).find("#searchbarbox");
					var btnId = "btn"+editor.t;
					if(tbs.length==0){
						var ihtml = '<div id="searchbarbox" style="display:none;">'+
							'<div id="searchbar"><input id="text_" /><button id="'+btnId+'">查询</button></div>'+
							'</div>';
						self.get$WithId(name).append(ihtml);
						self.get$WithId(name).find("#"+btnId).bind("click",editor.searchByStationName);
						editor.showSearchBar();
					}else{
						alert("搜索栏已经存在");
					}
				}
				
			    editor.showSearchBar= function(){
					self.get$WithId(name).find("#searchbarbox").slideDown();
				}
			    
			    editor.searchByStationName = function() {
				    var keyword = self.get$WithId(name).find("#text_")[0].value;
				    console.info("keyword="+keyword);
				    localSearch.search(keyword);
				} 

			    editor.showInfo = function(e){
					//alert(e.point.lng + ", " + e.point.lat);
					$.getJSON('http://api.map.baidu.com/geocoder/v2/?ak=XejYah3HvXhp37PPNCRFPHua&callback=?&location='+e.point.lat+','+e.point.lng+'&output=json&pois=1',function(res){
						console.info("请求百度地址逆 地理编码 接口数据："+res);
						editor.data.searchResult = res;
						//等价注册 change 事件
						if(row.ext!=null&&row.ext.cascades!=null){
							for(var i in row.ext.cascades){
								var cascadeOpt = row.ext.cascades[i];
								self.cascade(row.field,cascadeOpt.to,cascadeOpt.deal,cascadeOpt.opts);
							}
						}
					});
					editor.moveMarker(e.point);
				}

			    editor.regClick = function(){
					map.addEventListener("click", editor.showInfo);
				}
				
			    editor.addMarker = function(p){
					marker = new BMap.Marker(p);  // 创建标注
					editor.marker = marker;
					map.addOverlay(marker);              // 将标注添加到地图中
					editor.regDragMarker();
				}
			    editor.moveMarker = function(p){
					if(marker==null){
						editor.addMarker(p);
					}else{
						marker.setPosition(p);
					}
				}
			    editor.dragend = function(e){
			    	editor.showInfo(e);
				}
			    editor.regDragMarker = function(){
					marker.enableDragging();
					marker.addEventListener("dragend", editor.dragend);
				}
				self.options.Editors[row.field] = editor;
				editor.addSearchBar();
				editor.regClick();
			},
			loadData:function(self,row){
			},
			setValue:function(self,row,value){
			},
			getValue:function(self,row){
				var value = {lon:null,lat:null,address:null};
				var editor = self.options.Editors[row.field];
				//获得省市区地址
				try{
					value.lon = editor.marker.getPosition().lng;
					value.lat = editor.marker.getPosition().lat;
					value.searchResult = editor.data.searchResult==null?{}:editor.data.searchResult;
				}catch(e){
					console.info("尚未搜索到poi信息");
				}
				return value;
			},
			readonly:function(self,row,readonly){
			}
		}
	}
};

//kindeditor 扩展
var conf4kindeditor = {
	STD:{
		kindeditor:{
			stor:'id',
			labelSpace:"labelTopSpace",
			valueSpace:"divLineBoxSpace",
			init:function(self,row){
				var conf = {};
				if(row.ext&&row.ext.kindEditor){
					conf = row.ext.kindEditor;
				}
				conf.resizeType= conf.resizeType==null?0:conf.resizeType;
				conf.width = row.width==null?"800px":row.width;
				conf.height = row.height==null?"800px":row.height;
				var d = self.getDomWithId(row.field);
				var editor = KindEditor.create(d,conf);
				self.options.Editors[row.field] = editor;

				var blur = function(){
					$.dataform.ipu.validator.validate(self,row);
				}
				editor.afterBlur = blur;
			},
			loadData:function(self,row){
			},
			setValue:function(self,row,value){
				var editor = self.options.Editors[row.field];
				editor.html(value);
			},//设置数据方法，默认参数（数据）
			getValue:function(self,row){
				var editor = self.options.Editors[row.field];
				return editor.html();
			},//获取数据方法，默认无参数
			readonly:function(self,row,readonly){
				var editor = self.options.Editors[row.field];
				editor.readonly(readonly);
			}
		}
	}
};

//imagebox 扩展
var conf4imagebox = {
	STD:{
		image:{
			stor:'name',
			labelSpace:"labelSpace",
			valueSpace:"imageSpace",
			init: function(self,row){
				var clickHandler = function(e){
					var self = e.data.self;
					var row = e.data.row;
					var opts = self.options;
					var ImageUpload = opts.ImageUpload;
					var iuDom = opts.$Ele.find('#'+ImageUpload.id);
					var uploadImage = function(e){
						//‘this’ 指文件上传框 
						var uploadFileDom = this;
						var files = uploadFileDom.files;
						var self = e.data.self;
						var row = e.data.row;
						if(files.length==1){
							opts.$Ele.find('#'+ImageUpload.id).form('submit', {
								success: function(json){
									uploadFileDom.value="";
									json = $.dataform.ipu.str2json(json);
									if(json!=null&&json.result!=null&&json.result.Code==200){
										layer.msg("上传成功",{icon:6});
										self.setItemData(row.field,json.result.Response);
									}else{
										layer.msg("上传失败",{icon:5});
									}
								}
							});
						}else{
							layer.msg("请选择图片",{icon:3});
						}
					}
					if(iuDom==null||iuDom.length==0){
						var ihtml = $.dataform.ipu.templateFunc(opts.DPT.ImageUploadFormSpace,ImageUpload);
						opts.$Ele.append(ihtml);
						opts.$Ele.find('#'+ImageUpload.id).find("[name='"+ImageUpload.name+"']").trigger("click");
						opts.$Ele.find('#'+ImageUpload.id).find("[name='"+ImageUpload.name+"']").unbind("change").one("change",{self:self,row:row},uploadImage);
					}else{
						opts.$Ele.find('#'+ImageUpload.id).find("[name='"+ImageUpload.name+"']").trigger("click");
						opts.$Ele.find('#'+ImageUpload.id).find("[name='"+ImageUpload.name+"']").unbind("change").one("change",{self:self,row:row},uploadImage);
					}
				}
				//样式矫正
				self.get$WithName(row.field).height(self.get$WithName(row.field).height()-6);
				self.get$handler(row.field).height(self.get$WithName(row.field).height());
				self.get$handler(row.field).bind('click',{self:self,row:row},clickHandler);
			},
			loadData:function(self,row){},
			readonly:function(self,row,readonly){
				var name = row.field;
				self.get$handler(name)[0].disabled = row.disabled?true:readonly;
			}
		},
		imagebox:{
			stor:"id",
			labelSpace:"labelTopSpace",
			valueSpace:"divLineBoxSpace",
			init:function(self,row){
				var conf = {};
				if(row.ext&&row.ext.imagebox){
					conf = row.ext.imagebox;
				}
				conf.width = row.width==null?"800px":row.width;
				conf.height = row.height==null?"400px":row.height;
				self.get$WithId(row.field).css("width",parseFloat(conf.width)+2+"px");
				self.get$WithId(row.field).css("height",conf.height);
				var k = self.get$WithId(row.field).last().imagebox(conf);
				self.options.Editors[row.field] = k;
			},
			loadData:function(self,row){
			},
			setValue:function(self,row,value){
				var e = self.options.Editors[row.field];
				e.setData(value);
			},
			getValue:function(self,row){
				var e = self.options.Editors[row.field];
				return e.getData();
			},
			readonly:function(self,row,readonly){
				var e = self.options.Editors[row.field];
				e.readonly(readonly);
			}
		}
	}
}

//其他未分类
var conf4other = {
	STD:{
		scheckbox:{
			type:"p",
			labelSpace: "labelEmptySpace",
			valueSpace: "scheckBoxSpace",
			init:function(self,row){
				self.get$WithName(row.field).css("width","auto");
				self.get$WithName(row.field).css("height","auto");
				row.ext = row.ext==null?{hvd:false}:row.ext;
				var hvd = row.ext.hvd;
				if(typeof hvd == "boolean"){
					self.itemReadonly(row.field,hvd);
				}
				if(row.value!=null){
					self.setItemData(row.field,row.value);
				}
			},
			setValue:function(self,row,value){
				self.get$WithName(row.field)[0].checked = value;
			},
			getValue:function(self,row){
				return self.get$WithName(row.field)[0].checked;
			},
			readonly: function(self,row,readonly){
				self.get$WithName(row.field)[0].disabled = readonly;
			}
		},
		checkinput:{
			type:"p",
			labelSpace:"labelEmptySpace",
			valueSpace:"checkInputSpace",
			init:function(self,row){
				self.get$WithName(row.field)[0].disabled = true;
				self.get$WithName(row.field).css("width","30px");
				self.get$WithName(row.field).css("height","26px");
				self.get$controller(row.field).change(function(){
					var ck = this.checked;
					if(ck==false){
						self.get$WithName(row.field)[0].disabled = true;
					}else{
						self.get$WithName(row.field)[0].disabled = false;
					}
				});
				self.get$WithName(row.field).blur(function(){
					var v = this.value;
					v = parseInt(v);
					if(isNaN(v)||v<0){
						self.setItemData(row.field,-1);
					}
				});
				row.ext = row.ext==null?{hvd:false}:row.ext;
				var hvd = row.ext.hvd;
				if(typeof hvd == "boolean"){
					self.get$controller(row.field)[0].disabled = hvd;
				}
				if(row.value!=null){
					self.setItemData(row.field,row.value);
				}
			},
			setValue:function(self,row,value){
				if(value==-1){
					self.get$WithName(row.field)[0].value = "";
				}else{
					self.get$WithName(row.field)[0].value = value;
				}
			},
			getValue:function(self,row){
				var value = self.get$WithName(row.field)[0].value;
				if(value==""){
					value = -1;
				}
				return value;
			},
			readonly: function(self,row,readonly){
				self.get$WithName(row.field)[0].disabled = readonly;
			}
		},
		checkbutton:{
			type:"p",
			labelSpace:"labelEmptySpace",
			valueSpace:"checkButtonSpace",
			init:function(self,row){
				self.get$handler(row.field)[0].disabled = true;
				self.get$controller(row.field).change(function(){
					var ck = this.checked;
					if(ck==false){
						self.get$handler(row.field)[0].disabled = true;
					}else{
						self.get$handler(row.field)[0].disabled = false;
					}
				});
				self.get$WithName(row.field).blur(function(){
					var v = this.value;
					v = parseInt(v);
					if(isNaN(v)||v<0){
						self.setItemData(row.field,-1);
					}
				});
				row.ext = row.ext==null?{hvd:false}:row.ext;
				var hvd = row.ext.hvd;
				if(typeof hvd == "boolean"){
					self.get$controller(row.field)[0].disabled = hvd;
				}
				self.get$handler(row.field).css("height",row.height);
			},
			setValue:function(self,row,value){},
			getValue:function(self,row){},
			readonly: function(self,row,readonly){}
		}
	}
}

$.extend(true,$.dataform.defaults,conf4easyui,conf4multi,conf4baidumap,conf4kindeditor,conf4imagebox,conf4other);

    
})(jQuery,layer,window,document);