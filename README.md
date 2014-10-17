#validateMe 2.0 

An easy way to validate forms for your website. 

---

### Dependencies

**jQuery-1.10 ++** (http://jquery.com/download/)

**jQuery Mask Input 1.3.1** (http://digitalbush.com/projects/masked-input-plugin/)

---

### Getting Started

Place the **validateMe.js** file in your default JavaScript vendor directory. Link the script before the end of your **body** and after **jquery.js**.

```
<script src="js/vendor/jquery-1.10.2.min.js"></script>
<script src="js/vendor/jquery.maskedinput.min.js"></script>
<script src="js/vendor/validateMe.js"></script>
```
Here you go ! You're now ready to use validateMe. Here most commons method used.

```
//Debugger for mobile.
Me.log.setOptions({mobile:true});

//Disable logMe console
Me.log.disable();
	
//Re-enable logMe console
Me.log.enable();

```

---

### Methods

Here the list of methods of logMe with a small description.

#### Constructor
- __construct : inital method
- __dependencies : check any depency support and send some errors

#### Public
- setOptions(object) : pass new options
- getOptions : receive the current options
- enable : activate logs
- disable : disable logs
- toggleDebugger(boolean) : will toggle debugger
- fixConsole : will force a redraw of the methods (will be called after setOptions)
