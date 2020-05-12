validateMe
========
ValidateMe helps you handle simple validations for any form.

Version - 3.0.0
- Refactor for ES6
- Demo updated

Dependencies

- jQuery (https://jquery.com/)

## How to implement

First, you'll need to link jQuery and validateMe file in your project 
```html
<script type="text/javascript" src="/path/to/directory/node_modules/jquery/dist/jquery.js"></script>
<script type="text/javascript" src="/path/to/directory/me-validate.js"></script>
```
Here you go ! You're now ready to use validateMe.



Then in your script, you'll need to declare a new instance of a validation class and then assign all fields you want to have validation on.
```javascript
let validation = new Me.validate({
    $el: $('form'),
    onValidationError: function(fields){...},
    onValidationSuccess: function(fields, errorFields){...},
});

validation.addField({name: 'no-placeholder'});
validation.addField({name: 'not-required', required:false});
validation.addField({name: 'postal', type:'zipcode'});
validation.addField({name: 'phone', type:'phone'});
validation.addField({name: 'email', type:'email'});
validation.addField({name: 'email-copy', type:'email', copy:'email'});
validation.addField({name: 'password'});
validation.addField({name: 'checkbox'});
validation.addField({name: 'radio'});
```

When you instanciate a new validation, you need to pass an object with 3 required key.
- **$el** : Needs to be a jQuery element
- **onValidationError** : This will be the callback function when error occurs
- **onValidationSuccess** : This will be the callback function when success occurs

When adding a field into validation, there's some params thant you need to specify in an object. Here's the list of possible params. You can find then at the bottom of the page.

- name: (String) [Required] Name attribute of the field
- type: (String) [email, phone, zipcode]
- required: (Bool) If needs to be filled and validate
- copy: (String) Name of the field element to compare value with
- regex: (RegExp) RegExp to compare value with
- validation: (Function) Function to create custom validation. Need to return boolean.
- default_ok: (Boolean) If the default option of the select can be a valid option.
- file_size: (Number) Filesize allowed in kb
- file_type: (Array) Types allowed. Exemple: ['.png', '.jpg']

Before submitting the form, you'll be able to call a simple function that will validate all field added. All you need to do is add this line of code
```javascript
validation.validate();
```

If any error are found, the onValidationError callback function will be called. Otherwise, onValidationSuccess function will be called.

If you need to show errors to the user, you'll be able to put some custom code and access fields and error fields to handle all of that by yourself.

## Functions
Here's a list of all function

###addField(field)
Parameters:
 - field (Object) (See field params for possible options)
 
This function will add your field to the validation.

###removeField(name)
Parameters:
 - name (String)
  
This function will remove your field from the validation.

###getField(name)
Parameters:
 - name (String)
  
This function will return the wanted field based on its name.

###validate()
This function will validate all fields added previously.

###reset()
This function reset all value of the form to initial value.


## Field Params

- name: (String) [Required] Name attribute of the field
- type: (String) [email, phone, zipcode]
- required: (Bool) If needs to be filled and validate
- copy: (String) Name of the field element to compare value with
- regex: (RegExp) RegExp to compare value with
- validation: (Function) Function to create custom validation. Need to return boolean.
- default_ok: (Boolean) If the default option of the select can be a valid option.
- file_size: (Number) Filesize allowed in kb
- file_type: (Array) Types allowed. Exemple: ['.png', '.jpg']

