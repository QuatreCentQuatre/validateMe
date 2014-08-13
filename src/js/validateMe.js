// REQUIRE JQUERY INPUT MASK
(function($, window, document, undefined){
	//Param: $el is a form DOM element.
	var id = 1;
	var Validator = function($el, options){
		var scope = this;
		this.defaults = {
			onError: function(fields, errorFields){
				console.log(fields, errorFields);
			},
			onSuccess: function(fields){
				console.log(fields, this.name + id + ' is valid!');
			}
		};
		this.fieldDefaults = {
			name: '', //REQUIRED, String: name attribute of the field.
			type: '', //String, must be one of the types in fieldTypeDefaults.
			error: undefined, //String or DOM element: Either pass a string of the message (i.e: this field is required) or an element in the DOM (such as a hidden error message already appended).
			required:true, //Boolean: the non-required fields will be validated (only if they are not empty), which let the user the chocie to leave it empty or not.
			copy:'', //String: Name of the field element who should have the same value.
			mask:'', //String: i.e (999)999-9999, refer to http://digitalbush.com/projects/masked-input-plugin/
			pattern:undefined, //RegExp.
			placeholder:'', //String.
			filetype:'' // String: each type must be separated by a comma, for file uploads only. i.e: '.mp3,.wav'.
		};
		this.fieldTypeDefaults = {
			email   : {
				pattern : /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/
			},
			phone   : {
				mask: '(999) 999-9999',
				pattern: /^(?:\+?1)?[-. ]?\(?[2-9][0-8][0-9]\)?[-. ]?[2-9][0-9]{2}[-. ]?[0-9]{4}$/i
			},
			zipcode : {
				mask: 'a9a 9a9',
				pattern: /^[ABCEGHJKLMNPRSTVWXYZ][0-9][ABCEGHJKLMNPRSTVWXYZ]?[ ]?[0-9][ABCEGHJKLMNPRSTVWXYZ][0-9]$/i
			}
		};
		//--------Methods---------//
		this._initialize = function($el, options){
			if(!$el.exists()){
				console.warn(this.name + ": Couldn't find form");
			}
			this.$el = $el;
			this.name = 'ValidateMe-' + id;
			id++;
			this.fields = [];
			this.invalidFields = [];
			this.options = $.extend({}, this.defaults, options);
			return this;
		};
		this._initialize($el, options);

		this.addField = function(options) {
			var field = $.extend({},this.fieldDefaults, options);
			field.$el = this.$el.find('[name="'+field.name+'"]');
			// Validate all fields options
			var error = false;
			var errorLogs = [];

			if(!field.$el.exists()){
				errorLogs.push(this.name + ": Couldn't find field with name: "+ field.name);
				return;
			}

			//if the type given by the user is not null, we check to make sure its one of the supported type.
			var typeInArray = false;
			if(field.type != '') {
				for (var key in this.fieldTypeDefaults) {
					if (key == field.type) {
						typeInArray = true;
					}
				}
				if (!typeInArray) {
					errorLogs.push(this.name + ": Type must be one of the types in: ", this.fieldTypeDefaults);
					error = true;
				}
			}

			if(field.type == '') {
				if(field.$el[0].nodeName.toLowerCase() == "input"){
					field.type = field.$el[0].type.toLowerCase();
				}
				else {
					field.type = field.$el[0].nodeName.toLowerCase();
				}
			}

			if (field.error != undefined) {
				if (typeof field.error !== 'string' && typeof field.error !== "object") {
					errorLogs.push(this.name + ": Error must be String or DOM element.");
					error = true;
				}
				if (typeof field.error === "object") {
					if (!field.error.exists()) {
						errorLogs.push(this.name + ": Error must be String or DOM element.");
						error = true;
					}
				}
			}

			if (typeof field.required !== "boolean") {
				errorLogs.push(this.name + ": Required must be boolean.");
				error = true;
			}

			if (field.copy != '') {
				if(!this.$el.find('[name="'+field.copy+'"]').exists()){
					errorLogs.push(this.name + ": Couldn't find field with name: "+ field.copy);
					error = true;
				}
			}

			if (typeof field.mask !== 'string') {
				errorLogs.push(this.name + ": Mask must be a String (refer to http://digitalbush.com/projects/masked-input-plugin/).");
				error = true;
			}

			if (field.mask == "" && typeInArray) {
				if (this.fieldTypeDefaults[field.type].mask) {
					field.mask = this.fieldTypeDefaults[field.type].mask;
				}
			}
			field.firstTimeApply = true;

			if (field.pattern != undefined) {
				if (!(field.pattern instanceof RegExp)) {
					errorLogs.push(this.name + ": Pattern must be a RegExp.");
					error = true;
				}
			}

			if (field.pattern == undefined && typeInArray) {
				if (this.fieldTypeDefaults[field.type].pattern) {
					field.pattern = this.fieldTypeDefaults[field.type].pattern;
				}
			}

			if (field.placeholder != '') {
				if(typeof field.placeholder !== "string"){
					errorLogs.push(this.name + ": Placeholder must be String.");
					error = true;
				} else {
					field.$el.val(field.placeholder);
				}
			} else {
				if(field.$el.attr('placeholder') != null){
					field.placeholder = field.$el.attr('placeholder');
					field.$el.val(field.placeholder);
				}
			}

			if (field.filetype != '') {
				if(typeof field.filetype !== "string"){
					errorLogs.push(this.name + ": Filetype must be String and each type must be separated by a comma.");
					error = true;
				}
				//remove white space
				field.filetype = String(field.filetype.replace(/ /g,'')).split(',');
			}

			if (errorLogs.length > 0) {
				console.group(this.name + ' -> addField: ' + field.name);
				for(var i=0; i<errorLogs.length; i++)
					console.log(errorLogs[i]);
				console.groupEnd(this.name + ' -> addField: ' + field.name);
			}

			if (error) {
				return;
			}

			// END Validate all fields options
			field.id = field.$el.attr('id');

			field.switchType = function(type){
				if(field.type != 'password'){
					return;
				}
				field.$el.attr('type', type);
			};

			field.toggleMask = function(bool){
				if (field.mask) {
					if (bool) {
						field.$el.mask(field.mask);
					} else {
						field.$el.unmask();
					}
				}
			};

			//password switch to text if we have a placeholder, it will change back to password when we focus on the field
			if(field.type == 'password' && field.placeholder != ''){
				field.switchType("text");
			}

			field.$label = this.$el.find('label[for="' + field.id + '"]');
			if(!field.$label.exists()){
				delete field.id;
				delete field.$label;
			}

			//todo - make this an options ?
			/*if(field.$label){
			 // if no placeholder take the label if one is associated
			 if(field.placeholder == ""){
			 field.placeholder = field.$label.html();
			 }
			 }*/

			//add Rules, for some cases, they will all have the same default rule
			field.rule = (typeof rules['add' + utils.capitalize(field.type) + 'Rule'] === 'function') ? rules['add' + utils.capitalize(field.type) + 'Rule'](field) : rules['addDefaultRule'](field);

			console.log(this.name);
			field.$el.on('focus.' + this.name, field, this.focusHandler);
			field.$el.on('blur.' + this.name, field, this.blurHandler);

			this.fields.push(field);
		};

		this.validate = function(){
			this.invalidFields = [];
			$.each(this.fields, function(index, item){
				item.$el.blur();
				//Most types have the same validation criteria.
				if(item.type == 'text' || item.type == 'textarea' || item.type == 'phone' || item.type == 'email' || item.type == 'zipcode' || item.type == 'password'){
					if(item.$el.val() != item.placeholder && item.$el.val() != item.error && item.$el.val() != ""){
						item.lastValue = item.$el.val();
					}
					if(!validations['validateDefault'](item)){
						scope.invalidFields.push(item);
					}
				}
				else{
					if(!validations['validate'+utils.capitalize(item.type)](item)){
						scope.invalidFields.push(item);
					}
				}
			});
			if(this.invalidFields.length > 0) {
				if(typeof this.options.onError === 'function'){
					this.options.onError(this.fields, this.invalidFields);
				}
				return false;
			}
			else {
				if(typeof this.options.onSuccess === 'function'){
					this.emptyPlaceholders();
					this.options.onSuccess(this.fields);
				}
				return true;
			}
		};

		this.reset = function(fields){
			if(fields){
				for(var key in fields){
					$.each(this.fields, function(index, item){
						if(item.name == fields[key].name){
							privateMethods.fieldReset.call(this, item);
						}
					});
				}
			} else {
				$.each(this.fields, function(index, item){
					privateMethods.fieldReset.call(this, item);
				});
			}
		};

		this.emptyPlaceholders = function(){
			$.each(this.fields, function(index, field){
				if(field.lastValue)
					delete field.lastValue;
				if(field.$el.val() == field.placeholder){
					field.$el.val('');
				}
			});
		};

		this.fillPlaceholders = function(){
			$.each(this.fields, function(index, item){
				if(item.$el.val() == ''){
					if(item.placeholder){
						if(item.$el.attr('type') == "password"){
							privateMethods.switchPasswordType(item, "text");
						}
						item.$el.val(item.placeholder);
					}
				}
			});
		};

		var privateMethods = {
			fieldReset: function(field){
				if(field.lastValue)
					delete field.lastValue;
				if(field.type == 'text' || field.type == 'textarea' || field.type == 'email' || field.type == 'phone' || field.type == 'zipcode'|| field.type == 'password' || field.type == 'file'){
					field.$el.val("");
				}
				else if(field.type == 'checkbox' || field.type == 'radio'){
					field.$el.attr('checked', false);
				}
				else if(field.type == 'select'){
					field.$el.val(field.requiredDefault);
				}
				field.$el.trigger('blur.' + scope.name, field);
				return this;
			},
			switchPasswordType: function(item, type){
				item.$el.attr('type', type);
			}
		};

		var validations = {
			validateDefault: function(field) {
				var val = field.$el.val();
				//when the field is not required, we will validate it only if it has been filled.
				if(!field.required){
					if(val == field.requiredDefault){
						return true;
					}else if( val == field.placeholder){
						field.$el.val('');
						return true;
					}
				}

				if(field.copy != ''){
					var isValid = !!(scope.$el.find('[name="' + field.copy + '"]').val() == field.$el.val());
					if(!field.rule.test(val)){
						isValid = false;
					}
					else if(val == field.placeholder){
						isValid = false;
					}
					else if(val == field.error && typeof field.error === "string"){
						isValid = false;
					}
					else if(val == ''){
						isValid = false;
					}
					if(!isValid && field.type == 'password'){
						privateMethods.switchPasswordType(field, "password");
						var transformText = false;
						if(val == field.placeholder){
							transformText = true;
						}
						else if(val == ""){
							transformText = true;
						}

						if(transformText){
							privateMethods.switchPasswordType(field, "text");
						}
					}
					return isValid
				}else{
					if(!field.rule.test(val)){
						return false;
					}
					else if(val == field.placeholder){
						return false;
					}
					else if(val == field.error && typeof field.error === "string"){
						return false;
					}
					else if(val == ''){
						return false;
					}
					else{
						return true;
					}
				}
			},
			validateCheckbox: function(field){
				var val = false;
				$(field.$el).each(function(index, el){
					if (el.checked) {
						val = el.checked;
					}
				});
				if(!field.required){
					if(val == field.requiredDefault){
						return true;
					}
				}
				return val;
			},
			validateSelect: function(field){
				var val = field.$el.val();
				if(!field.required){
					return true;
				}
				return !!(val != field.requiredDefault);
			},
			validateRadio: function(field){
				if(!field.required){
					return true;
				}
				if(field.$el.filter(":checked").length == 0){
					return false;
				}else{
					return true;
				}
			},
			validatePassword: function(field){
				return validations.validateDefault(field);
			},
			validateFile: function(field){
				if(!field.required){
					var val = field.$el.val();
					if(val == field.requiredDefault){
						return true;
					}
				}

				var inArray = false;
				//keep only the extension of the filename
				var regexp = /(?:\.([^.]+))?$/;
				var filetype = regexp.exec(field.$el.val());
				for(var key in field.filetype){
					if(field.filetype[key] == filetype[0]){
						inArray = true;
					}
				}
				return inArray;
			}
		};
		var rules = {
			addDefaultRule: function(field){
				var regexp = new RegExp();
				if (field.pattern != undefined) {
					regexp = field.pattern;
				}

				field.requiredDefault = '';
				return regexp;
			},
			addCheckboxRule: function(field){
				field.requiredDefault = false;
				return null;
			},
			addSelectRule: function(field){
				field.requiredDefault = field.$el.find('option:first-child').val();
				return null;
			},
			addRadioRule: function(field){
				return null;
			},
			addPasswordRule: function(field){
				var regexp = new RegExp();
				if(field.pattern != undefined){
					regexp = field.pattern;
				}
				field.requiredDefault = '';
				return regexp;
			}
		};
		var utils = {
			capitalize: function(text) {
				return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
			},
			escape: function(text) {
				return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
			},
			maskToRegEx: function(obj){
				var regEx = obj.mask.regex;
				regEx = privateMethods.escape(regEx);
				regEx = regEx.replace(/9/g,'[0-9]'); // replace numeric - Represents a numeric character (0-9)
				if(obj.type == "postal"){
					regEx = regEx.replace(/a/g, obj.regExAlpha); // Represents an alpha CAPS character [ABCEGHJKLMNPRSTVWXYZ]
					regEx = new RegExp(regEx, 'i');
				}
				else {
					regEx = regEx.replace(/a/g, '[a-zA-Z]'); // Represents an alpha character (A-Z,a-z)
					regEx = egEx.replace(/\*/g, '[a-zA-Z0-9]'); // Represents an alphanumeric character (A-Z,a-z,0-9)
					regEx = new RegExp(regEx);
				}
				return regEx;
			}
		};
		this.focusHandler = function(e) {
			var field = e.data;
			if (field.$el.val() == field.placeholder || field.$el.val() == field.error || field.$el.val() == "") {
				if (field.type == "password") {
					privateMethods.switchPasswordType(field, "password");
				}
				var value = "";
				if (field.lastValue) {
					value = field.lastValue;
					delete field.lastValue;
				}
				field.$el.val(value);
				if (field.mask != "" && field.firstTimeApply) {
					field.firstTimeApply = false;
					field.toggleMask(true);
					field.$el.trigger('blur.' + this.name);
					var view = this;
					setTimeout(function(){
						field.$el.trigger('focus.' + view.name);
					}, 100);
				}
			}
		};
		this.blurHandler = function(e){
			var field = e.data;
			setTimeout(function() {
				if (field.$el.val().length == 0) {
					if (field.$el.attr('type') == "password") {
						privateMethods.switchPasswordType(field, "text");
					}
					if (field.placeholder != '') {
						field.$el.val(field.placeholder);
					}
				}
			}, 100);
		};
	};
	$.fn.exists = function(){return $(this).length = 0?false:true;};

	if(!window.Me){
		window.Me = {};
	}
	window.Me.validate = Validator;
}(jQuery, window, document));