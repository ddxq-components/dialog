/**
 * dialog
 * version: 0.1
 * @requires jQuery or zepto
 */

//依赖全局变量的模块
if (!window['$']) {
    throw new Error("此库依赖全局变量$, 需要jQuery或Zepto将$注入到全局变量中");
}

var $uiMask,
    $uiTips,
    _uiTipsTimer = null,
    _allDialog = {};

var dialog = {
    /**
     * 锁住屏幕
     * $.ui.lock({
         *      opacity:0.5,
         *      clickFn:function(){
         *
         *      }
         * })
     */
    lock: function (opt) {
        opt = $.extend({
            opacity: 0.5
        }, opt);
        if (!$uiMask) {
            $uiMask = $('<div id="uiMask" class="ui-mask"></div>');
            $uiMask.appendTo("body");
        }
        if ($.isFunction(opt.clickFn)) {
            $uiMask.bind("click", opt.clickFn);
        }
        $uiMask.css({
            "opacity": opt.opacity,
            display: "block"
        });
    },
    /**
     * 解锁屏幕
     */
    unLock: function () {
        if ($uiMask) {
            $uiMask.hide();
            $uiMask.unbind();
        }
    },
    getDialog: function (dialogId) {
        return _allDialog[dialogId];
    },
    closeDialog: function (dialogId) {
        try {
            var dialogObj = this.getDialog(dialogId);
            if (!dialogObj) {
                return;
            }
            if (dialogObj.opt.lock) {
                this.unLock();
            }
            if (dialogObj.$dialog && dialogObj.$dialog.length > 0) {
                dialogObj.$dialog.hide().remove();
            }
        } catch (ex) {
            alert(ex.message);
        }
    },
    /*
     * opt= {
     * id:"id必填"
     * title: "",
     * content: "",
     * width: 200,
     * height: "auto",
     * lock: true,
     * ok: true,
     * cancel: true,
     * close: true,
     * button: ""
     * onInit: function(dialog) {}
     * }
     */
    dialog: function (opt) {
        var that = this;
        var SCREEN_W = window.innerWidth;
        if (!opt.id) {
            throw Error("id必填");
            return;
        }
        opt = $.extend({
            dialogId: "uiDialog-" + opt.id,
            title: "",
            content: "",
            width: SCREEN_W * 0.84,
            height: "auto",
            lock: true,
            ok: true,
            cancel: true,
            okBtn: '确定',
            cancelBtn: '取消',
            close: false,
            button: "",
            onInit: function () {
            }
        }, opt);

        var tmplArr = [];
        tmplArr.push('<div id="' + opt.dialogId + '" class="ui-dialog">');
        if (opt.close) {
            tmplArr.push('<a href="javascript:;" class="ui-dialog-close" title="关闭"><i class="iconfont icon-close-fill"></i></a>');
        }
        if (opt.title) {
            tmplArr.push('<div class="ui-dialog-header"><div class="ui-dialog-title"><i class="iconfont icon-alert-fill"></i> ' + opt.title + '</div></div>');
        }
        tmplArr.push('<div class="ui-dialog-content">' + opt.content + '</div>');
        if (opt.ok || opt.cancel) {
            tmplArr.push('<div class="ui-dialog-footer">');
        }
        if (opt.cancel) {
            tmplArr.push('<input type="button" class="ui-dialog-button ui-dialog-cancel" value="' + opt.cancelBtn+ '" />');
        }
        if (opt.ok) {
            tmplArr.push('<input type="button" class="ui-dialog-button ui-dialog-ok" value="' + opt.okBtn+ '" />');
        }
        if (opt.button) {
            tmplArr.push(opt.button);
        }
        if (opt.ok || opt.cancel) {
            tmplArr.push('</div>');
        }
        tmplArr.push('</div>');

        var $dialog = $("#" + opt.dialogId);
        if ($dialog.length > 0) {
            this.closeDialog(opt.id);
        }
        $dialog = $(tmplArr.join(""));
        $dialog.appendTo("body");

        _allDialog[opt.id] = {
            opt: opt,
            $dialog: $dialog
        };

        function bindFn(fn) {
            if (fn === true) {
                return function () {
                    that.closeDialog(opt.id);
                }
            } else if ($.isFunction(fn)) {
                var tmpfn = fn;
                return function () {
                    if (tmpfn.call(_allDialog[opt.id]) !== false) {
                        that.closeDialog(opt.id);
                    }
                }
            }
            return null;
        }

        $(".ui-dialog-ok", $dialog).bind("click", bindFn(opt.ok));
        $(".ui-dialog-cancel", $dialog).bind("click", bindFn(opt.cancel));
        $(".ui-dialog-close", $dialog).bind("click", bindFn(opt.close));
        if (opt.lock) {
            this.lock();
        }

        $dialog.css({
            display: "block",
            width: opt.width,
            height: opt.height,
            left: opt.left,
            top: opt.top
        });

        var ml = -$dialog.width() / 2;
        var mt = -$dialog.height() / 2;
        $dialog.css({
            marginLeft: ml,
            marginTop: mt
        });


        if ($.isFunction(opt.onInit)) {
            opt.onInit.call(_allDialog[opt.id]);
        }
    },
    alert: function (msg, fn, title) {
        this.dialog({
            id: "alert",
            title: title || false,
            lock: true,
            content: msg.toString(),
            ok: fn || true,
            cancel: false
        });
    },
    confirm: function (msg, ok, cancel, title) {
        this.dialog({
            id: 'confirm',
            title: title || '确认提示',
            lock: true,
            content: msg.toString(),
            ok: ok,
            cancel: cancel
        });
    },
    prompt: function (title, defaultVal, fn) {
        var selector = "input[name=ui-dialog-prompt]";
        this.dialog({
            id: 'prompt',
            title: title,
            lock: true,
            content: '<input class="ui-dialog-input" name="ui-dialog-prompt" type="text" value="" />',
            ok: function () {
                var val = this.$dialog.find(selector).val();
                if ($.isFunction(fn)) {
                    fn(val);
                }
            },
            cancel: true,
            onInit: function () {
                this.$dialog.find(selector).val(defaultVal);
            }
        });
    },
    succeed: function (msg, detail) {
        detail = detail || '';
        this.dialog({
            id: 'succeed',
            title: false,
            content: '<div class="ui-dialog-special-heading"><i class="succeed iconfont icon-tick-fill"></i>' + msg + '</div>'
            + (detail ? '<div class="ui-dialog-special-content">' + detail + '</div>' : ''),
            ok: false,
            cancel: false,
            close: true
        });
    },
    fail: function (msg, detail, solve, solveButton) {
        detail = detail || '';
        this.dialog({
            id: 'fail',
            title: false,
            content: '<div class="ui-dialog-special-heading"><i class="fail iconfont icon-cross-fill"></i>' + msg + '</div>'
            + (detail ? '<div class="ui-dialog-special-content">' + detail + '</div>' : ''),
            ok: solve || true,
            okBtn: solveButton
        });
    },

    /**
     * type = |text|loading|info|error|succeed|
     */
    tips: function (msg, type, time) {
        var that = this;
        if (!$uiTips) {
            $uiTips = $('<div id="uiTips" class="ui-tips"><span class="ui-tips-i"><span class="ui-tips-icon"></span><span class="ui-tips-text"></span></span></div>');
            $uiTips.appendTo("body");
            $uiTips.bind("click", function () {
                that.closeTips();
            });
        }
        $uiTips.attr("class", "ui-tips ui-tips-" + type);
        $uiTips.find('.ui-tips-icon').html(
            (type === 'info' ? '<i class="iconfont icon-alert-fill"></i>' : '') +
            (type === 'error' ? '<i class="iconfont icon-cross-fill"></i>' : '') +
            (type === 'succeed' ? '<i class="iconfont icon-tick-fill"></i>' : '')
        );
        $(".ui-tips-text", $uiTips).html(msg);
        $uiTips.show();
        clearTimeout(_uiTipsTimer);
        time = isNaN(time) ? 2 : time;
        if (time > 0) {
            _uiTipsTimer = setTimeout(function () {
                that.closeTips();
            }, time * 1000);
        }
    },
    closeTips: function () {
        if ($uiTips) {
            $uiTips.hide();
            $(".text", $uiTips).empty();
        }
    }
};

module.exports = dialog;