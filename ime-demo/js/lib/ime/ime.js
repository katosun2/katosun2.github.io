/**
 * 模拟键盘输入法 v1.2.1
 * for chrome,safari,firfox
 *
 * Author Ryu
 *
 * 用法：
 * var ime = IME({
 *  输入框的外容器，默认documnet全局
 *  putWrap: $(document),
 *  键盘外容器
 *  imeWrap: $('#ime'),
 *  需要支持模拟输入的输入框合集，仅支持type="text|password"和textarea, 默认如下
 *  targets: ['input[type="text"]', 'input[type="text"]', 'textarea'],
 *  是否循环选择，默认false
 *  isCycle: false,
 *  点击事件，默认click，如果觉得慢可以用touchstart
 *  eventName: 'click',
 *  回调更新值，删除或添加都会回调
 *  result: function(key, val){},
 *  计算按钮值
 *  ok: function(){}
 * });
 *
 */
(function(){
    var count = 0,
	tpl = [
		'<!--S mod_ime -->',
		'<div class="mod_ime" id="mod_ime_${count}">',
		'<div class="ime_m">',
		'<table width="100%" border="0" cellspacing="0" cellpadding="0">',
		'<tbody>',
		'<tr>',
		'<td><span data-key="up">↑</span></td>',
		'<td><span data-key="7">7</span></td>',
		'<td><span data-key="8">8</span></td>',
		'<td><span data-key="9">9</span></td>',
		'<td><span data-key="del">Del</span></td>',
		'</tr>',
		'<tr>',
		'<td><span data-key="down">↓</span></td>',
		'<td><span data-key="4">4</span></td>',
		'<td><span data-key="5">5</span></td>',
		'<td><span data-key="6">6</span></td>',
		'<td><span data-key="clear">C</span></td>',
		'</tr>',
		'<tr>',
		'<td><span data-key="left" @click="moveLeft()">←</span></td>',
		'<td><span data-key="1">1</span></td>',
		'<td><span data-key="2">2</span></td>',
		'<td><span data-key="3">3</span></td>',
		'<td><span data-key="-"><strong>－</strong></span></td>',
		'</tr>',
		'<tr>',
		'<td><span data-key="right" @click="moveRight()">→</span></td>',
		'<td><span data-key="0">0</span></td>',
		'<td><span class="ime_pot" data-key="."><strong>·</strong></span></td>',
		'<td><span data-key="e">e</span></td>',
		'<td><span data-key="ok">=</span></td>',
		'</tr>',
		'</tbody>',
		'</table>',
		'</div>',
		'</div>',
		'<!--E mod_ime -->'].join('');


    var IME = function(){
        if(!(this instanceof IME)){
            return new IME(arguments[0]);
        }

        /*定义目标*/
        this.target = null;
        /*初始化位置*/
        this.curPos = 0;
        /*所有的输入框*/
        this.puts = [];
        /*设置参数*/
        this.setOpts(arguments[0] || {});

        /*绑定*/
        this.init();

        return this;
    };

    IME.prototype = {
        setOpts:function(opts){
            var fun = function(){};
            this.opts = {
                vueObj: null,
                /*输入框的外容器*/
                putWrap: $(document),
                /*模拟键盘外容器Id*/
                imeWrap: $('body'),
                /*仅支持input,textarea*/
                targets: ['input[type="password"]', 'input[type="text"]', 'textarea'],
                /*是否循环*/
                isCycle: false,
                /*值*/
                result: function(key, val){},
                /*事件名称*/
                eventName: 'click',
                /*计算*/
                ok: null
            };

            /*赋值变量*/
            if(opts){
                for (var property in opts) {
                    this.opts[property] = opts[property];
                }
            }
        },

        /*重新定义change方法*/
        change: function(){
            var ime = this,
                _vue = ime.opts.vueObj,
                changeFunc,
                params;

            if(ime.target){
                changeFunc = ime.target.getAttribute('data-change');
                if(changeFunc){
                    /*获取参数值*/
                    params = changeFunc.match(/\((.*)\)/);
                    if(params){
                        params = params[1].split(/\s*,\s*/);
                    }

                    /*获取函数名*/
                    changeFunc = changeFunc.replace(/\(.*\)$/,'');

                    /*执行函数*/
                    if(params){
                        _vue[changeFunc].apply(null, params);
                    }else{
                        _vue[changeFunc]();
                    }
                }
            }

			return ime;
        },

        /*设置vue的值*/
        setVueKey: function(key, val){
            var ime = this,
                _vue = ime.opts.vueObj;

            if(!key){
                return;
            }

            if(_vue){
                _vue.$set(_vue.$data, key, val);
            }

			return ime;
        },

        /*变更样式*/
        focusTargetStyle: function(){
            var ime = this,
                targets = ime.puts;

            /*删除所有样式*/
            targets.removeClass('ime-focus').parent().removeClass('put_out_focus');

			if(ime.target){
				/*添加样式*/
				$(ime.target).addClass('ime-focus').parent().addClass('put_out_focus');
			}

			return ime;
        },

        /*获取光标的位置*/
        getCursortPosition: function(ctrl) {
            var doc = document,
                sel,
                caretPos = 0;

			if(ctrl){
				/*for IE*/
				if (doc.selection) {
					ctrl.focus();
					sel = doc.selection.createRange();
					sel.moveStart ('character', -ctrl.value.length);
					caretPos = sel.text.length;
				}

				/*for chrome, firefox*/
				else if (ctrl.selectionStart || ctrl.selectionStart == '0'){
					caretPos = ctrl.selectionStart;
				}
			}

            return caretPos;
        },

        /*设置光标位置函数*/
        setCaretPosition: function(ctrl, pos, word){
            var ime = this,
                range;

			if(ctrl){
				if(ctrl.setSelectionRange){
					ctrl.focus();
					ctrl.setSelectionRange(pos, pos);
				}
				else if (ctrl.createTextRange) {
					range = ctrl.createTextRange();
					range.collapse(true);
					range.moveEnd('character', pos);
					range.moveStart('character', pos);
					range.select();
				}

				/*定位虚拟光标*/
				ime.flashCusor(ctrl, pos, $(ime.target).val().split(''));
			}

			return ime;
        },

        /*输入字符*/
        addWord: function(key, keyCode){
            var ime = this,
                oldVal = '',
                target = $(ime.target),
                word = [];

			if(ime.target){
				/*获取原值*/
				oldVal = $.trim(target.val());

				/*将字符转为数组*/
				word = oldVal.split('');

				/*获取位置*/
				ime.curPos = ime.getCursortPosition(ime.target);

				/*插入字符到指定光标位置*/
				word.splice(ime.curPos, 0, keyCode);

				/*新的光标位置*/
				ime.curPos++;

				/*写入内容*/
				target.val(word.join(''));

				/*重新设置光标位置*/
				ime.setCaretPosition(ime.target, ime.curPos, word.join(''));

				ime.target.focus();

				/*回调值*/
				if(ime.opts.result){
					ime.opts.result(ime.target, word.join(''));
				}

				/*设置vue值*/
				ime.setVueKey(ime.target.id, word.join(''));
			}

			return ime;
        },

        /*删除字符*/
        delWord: function(key){
            var ime = this,
                oldVal = '',
                target = $(ime.target),
                word = [];

            if(target.get(0)){
                /*获取原值*/
                oldVal = target.val();

                /*将字符转为数组*/
                word = oldVal.split('');

                /*获取位置*/
                ime.curPos = ime.getCursortPosition(ime.target);

                /*新的光标位置*/
                ime.curPos--;

                /*最小值判断*/
                /*如果位置是初始，则不需要处理*/
                if(ime.curPos < 0){
                    return;
                }

                /*删除到指定光标位置字符*/
                word.splice(ime.curPos, 1);

                /*写入内容*/
                target.val(word.join(''));

                /*重新设置光标位置*/
                ime.setCaretPosition(ime.target, ime.curPos, word.join(''));

                /*回调值*/
                if(ime.opts.result){
                    ime.opts.result(ime.target, word.join(''));
                }

                /*设置vue值*/
                ime.setVueKey(ime.target.id, word.join(''));
            }

			return ime;
        },

        /*上一个输入框*/
        up: function(){
            var ime = this,
                oldVal = '',
                word = [],
                target,
                len = ime.puts.length,
                index = 0;

            if(len > 0){
                if(ime.target){
                    target = $(ime.target);

                    /*获取当前输入框序号*/
                    index = ime.puts.index(target);

                    /*上一个序号*/
                    index--;
                    if(index < 0){
                        index = ime.opts.isCycle ? len - 1 : 0;
                    }
                }

                /*新的对象*/
                ime.target = ime.puts.get(index);
                /*定义样式*/
                ime.focusTargetStyle();
                /*获取原值*/
                oldVal = $(ime.target).val();
                /*将字符转为数组*/
                word = oldVal.split('');
                /*新的长度*/
                ime.curPos = word.length;
                /*重新设置光标位置*/
                ime.setCaretPosition(ime.target, ime.curPos, word.join(''));
                ime.target.focus();
            }

			return ime;
        },

        /*下一个输入框*/
        down: function(){
            var ime = this,
                oldVal = '',
                word = [],
                target,
                len = ime.puts.length,
                index = len - 1;

            if(len > 0){
                if(ime.target){
                    target = $(ime.target);

                    /*获取当前输入框序号*/
                    index = ime.puts.index(target);

                    /*上一个序号*/
                    index++;
                    if(index > len - 1){
                        index = ime.opts.isCycle ? 0 : len - 1;
                    }
                }

                /*新的对象*/
                ime.target = ime.puts.get(index);
                /*定义样式*/
                ime.focusTargetStyle();
                /*获取原值*/
                oldVal = $(ime.target).val();
                /*将字符转为数组*/
                word = oldVal.split('');
                /*新的长度*/
                ime.curPos = word.length;
                /*重新设置光标位置*/
                ime.setCaretPosition(ime.target, ime.curPos, word.join(''));
                ime.target.focus();
            }
        },

        /*重新聚焦*/
        resetFocus: function(){
			var ime = this;

			if(ime.target){
				ime.target.blur();
				ime.target.focus();
			}

			return ime;
        },

        /*光标左移动*/
        moveLeft: function(){
            var ime = this,
                target = $(ime.target);

            if(target.get(0)){
                /*获取位置*/
                ime.curPos = ime.getCursortPosition(ime.target);

                /*新的光标位置*/
                ime.curPos--;

                /*最小值判断*/
                /*如果位置是初始，则不需要处理*/
                if(ime.curPos < 0){
                    return;
                }

                /*重新设置光标位置*/
                ime.setCaretPosition(ime.target, ime.curPos, $(ime.target).val().split(''));
            }

			return ime;
        },

        moveRight: function(){
            var ime = this,
                target = $(ime.target),
                word = [];

            if(target.get(0)){
                /*获取输入框的值*/
                word = target.val().split('');

                /*获取位置*/
                ime.curPos = ime.getCursortPosition(ime.target);

                /*最大值判断*/
                /*如果位置是最大，则不需要处理*/
                if(ime.curPos  === word.length){
                    return;
                }

                /*新的光标位置*/
                ime.curPos++;

                /*重新设置光标位置*/
                ime.setCaretPosition(ime.target, ime.curPos, word.join(''));
            }

			return ime;
        },

        /*
         * 闪动光标位置
         *
         * @params { Object } 当前焦点中的input
         * @params { Number } 光标位置
         * @params { Array } 字符串数组
         *
         */
        flashCusor: function(ctrl, pos, word){
            var ime = this,
                target = $(ctrl),
                outSpan = target.parent(),
				dc = document,
                popDiv = dc.getElementById('tempWord'),
                /*最大长度*/
                maxLeft = target.width();

            /*判断是否已存在*/
            if(!popDiv){
				/*创建内容层*/
                popDiv= dc.createElement('span');
                popDiv.id = "tempWord";
                popDiv.className = 'tempWord';
				popDiv.style.visibility = 'hidden';
                document.body.appendChild(popDiv);
            }

            /*计算光标位置*/
            word.length = pos;
            popDiv.innerHTML = word.join('');
            left = popDiv.offsetWidth;

            /*如果光标超出最大值，临时处理*/
            left = left > maxLeft ? maxLeft : left;

            /*TODO 超出边界处理，暂时没想到方法实现...*/

            outSpan.find('.cursor').css({
                left: left - 2
            });

			return ime;
        },

        /*清空*/
        clear: function(){
            var ime = this,
                target = $(ime.target),
                word = [];

            if(target.get(0)){
                /*写入内容*/
                target.val(word.join(''));

                /*回调值*/
                if(ime.opts.result){
                    ime.opts.result(ime.target, word.join(''));
                }

                /*设置vue值*/
                ime.setVueKey(ime.target.id, word.join(''));

                /*定位虚拟光标*/
                ime.flashCusor(ime.target, 0, []);
            }

			return ime;
        },

        /*插入HTML*/
        setHTML: function(){
            var ime = this,
                newTpl = '';

            /*实例添加*/
            count++;

            /*替换实例序号*/
            newTpl = tpl.replace(/\$\{count\}/g, count);

            /*插入html*/
            $(ime.opts.imeWrap).append(newTpl);
        },

        /*绑定*/
        bind: function(){
            var ime = this;

            /*绑定键盘*/
            $('#mod_ime_' + count).on(this.opts.eventName, 'span', function(e){
                var key = $(this),
                    oldVal = '',
                    keyCode = key.attr('data-key'),
                    word = [];

                switch(keyCode) {
                    case 'del':
                        /*删除*/
                        ime.delWord(key);
                        break;
                    case 'up':
                        ime.up();
                        break;
                    case 'down':
                        ime.down();
                        break;
                    case 'clear':
                        ime.clear();
                        break;
                    /*光标左移动*/
                    case 'left':
                        ime.moveLeft();
                        break;
                    /*光标右移动*/
                    case 'right':
                        ime.moveRight();
                        break;
                    case 'ok':
                        /*定义change方法*/
                        ime.change();
                        /*清空对象*/
                        ime.target = null;
                        /*定义样式*/
                        ime.focusTargetStyle();
                        if(ime.opts.ok){
                            ime.opts.ok();
                        }
                        break;
                    default:
                        /*输入字符*/
                        ime.addWord(key, keyCode);
                        break;
                }

                //非默认
                if(e.stopPropagation){
                    e.stopPropagation();
                } else{
                    e.cancelBubble = true;
                }

                /*return ime;*/
            });

            ime.opts.putWrap.on('click touchstart', ime.opts.targets.join(','), function(e){
                /*定义change方法*/
                ime.change();
                /*获取对象*/
                ime.target = this;
                /*定义样式*/
                ime.focusTargetStyle();

                /*获取位置*/
                ime.curPos = ime.getCursortPosition(ime.target);

                /*定位虚拟光标*/
                ime.flashCusor(ime.target, ime.curPos, $(ime.target).val().split(''));

                if(e.stopPropagation){
                    e.stopPropagation();
                } else{
                    e.cancelBubble = true;
                }
            });

            $(document).on('click', '*', function(){
                var el = this,tagName = el.tagName;
                if(tagName == 'INPUT' || tagName == 'TEXTAREA'){
                    return;
                }

				/*TODO*/
                /*$('input').removeClass('ime-focus').parent().removeClass('put_out_focus');

                /*定义change方法*/
                ime.change();
                /*清空对象*/
                ime.target = null;
                /*定义样式*/
				ime.focusTargetStyle();
            });
        },

        /*初始化*/
        init: function(){
            var ime = this;

            /*插入HTML*/
            ime.setHTML();

            /*获取所有的输入框*/
            ime.puts = ime.opts.putWrap.find(ime.opts.targets.join(','));

            /*绑定*/
            ime.bind();
        }
    };
    return (window.IME = IME);
})();
