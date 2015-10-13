m-dialog
==========
简易版wap对话框
此库依赖全局变量$, 需要jQuery或Zepto将提前$注入到全局变量中。
----------

## 使用说明

```
var $ = require('zepto');
var dialog = require('dialog');

dialog.lock(opt)
dialog.unLock()
dialog.getDialog(dialogId)
dialog.closeDialog(dialogId)
dialog.dialog(opt)
dialog.alert(msg, fn, title)
dialog.confirm(msg, ok, cancel, title)
dialog.prompt(title, defaultVal, fn)
dialog.succeed(msg, detail)
dialog.fail(msg, detail, solve, solveButton)
dialog.tips(msg, type, time)
dialog.closeTips()
```