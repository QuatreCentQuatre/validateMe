#validateMe 2.0 

An easy way to validate forms for your website. 

---

### Version

**2.0.0**

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
Here you go ! You're now ready to use validateMe. Here how to get started !

#### HTML:
~~~
<form id="myCustomForm" method="post" action="">
	<div class="inner">
		<div class="row">
			<p>Name</p>
			<div class="input-ctn">
				<div class="input-messages-ctn">
					<div class="input-messages" me:validate:related="not-required"></div>
					<input name="name" type="text" me:validate:placeholder="Name" value="" autocomplete="off" />
				</div>
			</div>
		</div>
		<div class="row">
			<div class="btn">
			    //Class btn-submit needed for form validation
				<a class="btn-submit" href="#">Submit</a>
			</div>
		</div>
		<input class="hidden" type="submit" value="Submit"/>
	</div>
</form>
~~~

#### Javascript:

```
//Basic Form Validation
var validation = new Me.form({
    scope: this,
    prettyName: 'CustomForm',
    //Target your form
    $form: $('#myCustomForm'),
    fields:[
        //Add every input name you need (Check the demo for more exemples)
        {name: 'name'}
    ],
    onSuccess: formSuccessHandler,
    onError: formErrorHandler
});

//Exemple of formSuccessHandler
function formAjaxSuccess(data) {
    if (data.response.success == 0) {
        $.each(validation.validation.fields, function(index, field) {
            field.$el.addClass('error');
        });
    }
}

```

---

