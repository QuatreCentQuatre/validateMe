/*
 Masked Input plugin for jQuery
 Copyright (c) 2007-2013 Josh Bush (digitalbush.com)
 Licensed under the MIT license (http://digitalbush.com/projects/masked-input-plugin/#license)
 Version: 1.3.1
 */
(function(e){function t(){var e=document.createElement("input"),t="onpaste";return e.setAttribute(t,""),"function"==typeof e[t]?"paste":"input"}var n,r=t()+".mask",i=navigator.userAgent,s=/iphone/i.test(i),o=/android/i.test(i);e.mask={definitions:{9:"[0-9]",a:"[A-Za-z]","*":"[A-Za-z0-9]"},dataName:"rawMaskFn",placeholder:"_"},e.fn.extend({caret:function(e,t){var n;if(0!==this.length&&!this.is(":hidden"))return"number"==typeof e?(t="number"==typeof t?t:e,this.each(function(){this.setSelectionRange?this.setSelectionRange(e,t):this.createTextRange&&(n=this.createTextRange(),n.collapse(!0),n.moveEnd("character",t),n.moveStart("character",e),n.select())})):(this[0].setSelectionRange?(e=this[0].selectionStart,t=this[0].selectionEnd):document.selection&&document.selection.createRange&&(n=document.selection.createRange(),e=0-n.duplicate().moveStart("character",-1e5),t=e+n.text.length),{begin:e,end:t})},unmask:function(){return this.trigger("unmask")},mask:function(t,i){var u,f,l,c,h,p;return!t&&this.length>0?(u=e(this[0]),u.data(e.mask.dataName)()):(i=e.extend({placeholder:e.mask.placeholder,completed:null},i),f=e.mask.definitions,l=[],c=p=t.length,h=null,e.each(t.split(""),function(e,t){"?"==t?(p--,c=e):f[t]?(l.push(RegExp(f[t])),null===h&&(h=l.length-1)):l.push(null)}),this.trigger("unmask").each(function(){function u(e){for(;p>++e&&!l[e];);return e}function d(e){for(;--e>=0&&!l[e];);return e}function v(e,t){var n,r;if(!(0>e)){for(n=e,r=u(t);p>n;n++)if(l[n]){if(!(p>r&&l[n].test(x[r])))break;x[n]=x[r],x[r]=i.placeholder,r=u(r)}w(),S.caret(Math.max(h,e))}}function m(e){var t,n,r,s;for(t=e,n=i.placeholder;p>t;t++)if(l[t]){if(r=u(t),s=x[t],x[t]=n,!(p>r&&l[r].test(s)))break;n=s}}function g(e){var t,n,r,i=e.which;8===i||46===i||s&&127===i?(t=S.caret(),n=t.begin,r=t.end,0===r-n&&(n=46!==i?d(n):r=u(n-1),r=46===i?u(r):r),b(n,r),v(n,r-1),e.preventDefault()):27==i&&(S.val(T),S.caret(0,E()),e.preventDefault())}function y(t){var n,r,s,a=t.which,f=S.caret();t.ctrlKey||t.altKey||t.metaKey||32>a||a&&(0!==f.end-f.begin&&(b(f.begin,f.end),v(f.begin,f.end-1)),n=u(f.begin-1),p>n&&(r=String.fromCharCode(a),l[n].test(r)&&(m(n),x[n]=r,w(),s=u(n),o?setTimeout(e.proxy(e.fn.caret,S,s),0):S.caret(s),i.completed&&s>=p&&i.completed.call(S))),t.preventDefault())}function b(e,t){var n;for(n=e;t>n&&p>n;n++)l[n]&&(x[n]=i.placeholder)}function w(){S.val(x.join(""))}function E(e){var t,n,r=S.val(),s=-1;for(t=0,pos=0;p>t;t++)if(l[t]){for(x[t]=i.placeholder;pos++<r.length;)if(n=r.charAt(pos-1),l[t].test(n)){x[t]=n,s=t;break}if(pos>r.length)break}else x[t]===r.charAt(pos)&&t!==c&&(pos++,s=t);return e?w():c>s+1?(S.val(""),b(0,p)):(w(),S.val(S.val().substring(0,s+1))),c?t:h}var S=e(this),x=e.map(t.split(""),function(e){return"?"!=e?f[e]?i.placeholder:e:void 0}),T=S.val();S.data(e.mask.dataName,function(){return e.map(x,function(e,t){return l[t]&&e!=i.placeholder?e:null}).join("")}),S.attr("readonly")||S.one("unmask",function(){S.unbind(".mask").removeData(e.mask.dataName)}).bind("focus.mask",function(){clearTimeout(n);var e;n=setTimeout(function(){T=S.val();e=E();w();e==t.length?S.caret(0,e):S.caret(e)},50)}).bind("blur.mask",function(){E(),S.val()!=T&&S.change()}).bind("keydown.mask",g).bind("keypress.mask",y).bind(r,function(){setTimeout(function(){var e=E(!0);S.caret(e),i.completed&&e==S.val().length&&i.completed.call(S)},0)}),E()}))}})})(jQuery)