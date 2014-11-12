/*
 * validateMe
 * Library to validate forms
 * Requires : Jquery, Jquery Inputmask
 */

(function($, window, document, undefined) {
    //Param: $el is a form DOM element.
    var ValidateMeInstanceID = 1;
    var ValidateMeName = "ValidateMe-";
    var ValidateMe = function($el, options) {
        this.id      = ValidateMeInstanceID;
        this.name    = ValidateMeName + String(this.id) + ":: ";
        this.$form   = $el;
        this.__construct(options);
        ValidateMeInstanceID ++;
    };

    var p = ValidateMe.prototype;
    p.debug   = false;

    p.id      = null;
    p.name    = null;
    p.options = null;
    p.$form   = null;

    p.fieldDefaults = {
        name        : null,  //REQUIRED, String: name attribute of the field.
        type        : null,  //String, must be one of the types in fieldTypeDefaults.
        errors      : [],    //Array of element to add error class
        handlePlaceholder: false,
        required    : true,  //Boolean: the non-required fields will be validated (only if they are not empty), which let the user the chocie to leave it empty or not.
        default_ok  : false, //Boolean
        copy	    : null,  //String: Name of the field element who should have the same value.
        mask	    : null,  //String: i.e (999)999-9999, refer to http://digitalbush.com/projects/masked-input-plugin/
        pattern	    : null,  //RegExp.
        filetype    : null   //String: each type must be separated by a comma, for file uploads only. i.e: '.mp3,.wav'.
    };

    p.fieldTypeDefaults = {
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

    p.__construct = function(options) {
        if (!this.$form.length > 0) {
            console.warn(this.name + "Couldn't find associated form ", this.$form);
            return this;
        }
        this.fields = [];
        this.meOpts(options);
        return this;
    };

    p.meOpts = function(options) {
        var defaults = {
            scope: this,
            onError: function(fields, errorFields){
                console.log(fields, errorFields);
            },
            onSuccess: function(fields){
                console.log(fields, this.name + ' is valid!');
            }
        };
        var settings = $.extend({}, defaults, options || {});
        var proprietiesArray = [];
        var scope = this;
        $.each(settings, function(index, value) {
            if ($.inArray(index, proprietiesArray) != -1) {
                scope[index] = value;
                delete settings[index];
            }
        });
        this.options = settings;
    };

    p.addField = function(fieldOptions) {
        var fieldError = false;
        var errorLogs = [];

        // merge field options to defaults
        var field = $.extend({}, this.fieldDefaults, fieldOptions || {});

        // find element that have field.name
        field.$el = this.$form.find('[name="'+field.name+'"]');
        if (field.$el.length == 0) {
            fieldError = true;
            errorLogs.push(this.name + "Couldn't find field with associated name ", field.name);
        }

        //if the type given by the user is not null, we check to make sure its one of the supported type.
        if (field.type) {
            var inArray = false;
            for (var key in this.fieldTypeDefaults) {
                if (key == field.type) {
                    inArray = true;
                }
            }
            if (!inArray) {
                fieldError = true;
                errorLogs.push(this.name + "The type you want is not supported. Please refer to documentation.", this.fieldTypeDefaults);
            }
        }

        // verify if required is wanted that it is a boolean
        if (typeof field.required !== "boolean") {
            fieldError = true;
            errorLogs.push(this.name + "Parammeter 'required' must be boolean.");

        }

        // check if that field need to be a copy of another element and if that other element exist
        if (field.copy && this.$form.find('[name="' + field.copy + '"]') == 0) {
            fieldError = true;
            errorLogs.push(this.name + "Couldn't find field that need to be copied with associated name ", field.copy);
        }

        // we looking if they need a mask and fit type of http://digitalbush.com/projects/masked-input-plugin/
        if (field.mask && typeof field.mask !== 'string') {
            fieldError = true;
            errorLogs.push(this.name + "Mask must be a String (refer to http://digitalbush.com/projects/masked-input-plugin/).");
        }

        // we look if pattern is a regexp
        if (field.pattern && !(field.pattern instanceof RegExp)) {
            fieldError = true;
            errorLogs.push(this.name + "Pattern must be a RegExp.");
        }

        // check if filetype is a string and correctly formated
        if (field.filetype && typeof field.filetype !== "string") {
            fieldError = true;
            errorLogs.push(this.name + "Filetype must be String and each type must be separated by a comma.");
        }

        if (field.$el.length > 0) {
            field.id          = field.$el.attr('id') || null;
            field.$skin       = (this.$form.find('#skinme-' + field.id).length > 0) ? this.$form.find('#skinme-' + field.id) : null;
            field.$label      = (this.$form.find('label[for="' + field.id + '"]').length > 0) ? this.$form.find('label[for="' + field.id + '"]') : null;
            field.$related    = (this.$form.find('[me\\:validate\\:related="' + field.name + '"]').length > 0) ? this.$form.find('[me\\:validate\\:related="' + field.name + '"]') : null;
            field.placeholder = field.$el.attr('me:validate:placeholder') || null;
            field.error       = field.$el.attr('me:validate:error') || null;

            //add type if isn't set
            if (!field.type) {
                field.type = (field.$el[0].nodeName.toLowerCase() == "input") ? field.$el[0].type.toLowerCase() : field.$el[0].nodeName.toLowerCase();
            }

            // check if placeholder is set on element and if you have a related
            if (field.placeholder && typeof field.placeholder !== "string") { // if placeholder has been set in scripts
                fieldError = true;
                errorLogs.push(this.name + "Placeholder must be String.");
            }

            // check if you have an error for that field
            if(field.error && typeof field.error !== 'string') {
                fieldError = true;
                errorLogs.push(this.name + "Error must be String.");
            }
        }

        if (fieldError) {
            console.group(this.name + 'addField: ' + field.name);
            for(var i = 0; i < errorLogs.length; i++) {
                console.log(errorLogs[i]);
            }
            console.groupEnd(this.name + 'addField: ' + field.name);
            return;
        }

        // add $copy to element if there is
        field.$copy = (this.$form.find('[name="' + field.copy + '"]').length > 0) ? this.$form.find('[name="' + field.copy + '"]') : null;
        if (field.$copy) {
            field.$copy[0].$copied = field.$el;
        }

        // remove whitespace in filetype if needed
        if (field.filetype) {
            field.filetype = String(field.filetype.replace(/ /g,'')).split(',');
        }

        if (field.handlePlaceholder) {
            // apply placeholder if there is no $related
            if (!field.$related && field.placeholder && typeof field.placeholder === "string") {
                field.$el.attr('placeholder', field.placeholder);
            }
        }

        //add Rules, for some cases, they will all have the same default rule
        field.rule = (typeof rules[field.type + "Rule"] === "function") ? rules[field.type + "Rule"].call(this, field) : rules["defaultRule"].call(this, field);

        // add events (click on related, focus and blur on fields)
        if (field.$related) field.$related.on('click.' + this.name, field, $.proxy(events.clickRelatedHandler, this));

        field.$el.on('focus.' + this.name, field, $.proxy(events.focusHandler, this));
        field.$el.on('blur.'  + this.name, field, $.proxy(events.blurHandler, this));

        // add fields to this validation
        this.fields.push(field);

        // trigger first blur to set to initial state
        privates.fill.call(this, field);
    };

	p.removeField = function(fieldToRemove) {
		var rfield = null;
		var rindex = null;
		$.each(this.fields, function(index, field) {
			if (fieldToRemove.name == field.name) {
				rindex = index;
				rfield = field;
			}
		});
		if (rfield) {
			if (rfield.$related) rfield.$related.off('click.' + this.name);
			rfield.$el.off('focus.' + this.name);
			rfield.$el.off('blur.'  + this.name);


			this.fields.splice(rindex, 1);
		}
	};

    /**
     * Method to call when you want to validate your form
     **/
    p.validate = function() {
        var scope = this;
        this.invalidFields = [];
        $.each(this.fields, function(index, field) {
            // activate the blur so all field will be bring back to their inital state
            field.$el.trigger('blur.' + scope.name, field);

            // Validate each field depending on its type
            if (field.type == 'text' || field.type == 'textarea' || field.type == 'phone' || field.type == 'email' || field.type == 'zipcode' || field.type == 'password') {
                if (field.$el.val() != field.placeholder && field.$el.val() != field.error) {
                    field.enteredValue = field.$el.val();
                }
            }

            var validation = (typeof validations[field.type + "Validation"] === "function") ? validations[field.type + "Validation"].call(scope, field) : validations["defaultValidation"].call(scope, field);
            if (!validation) {
                if (field.error) {
                    if (field.$related) {
                        field.$related.css({display:'block'});
                        field.$related.html(field.error);
                    } else {
                        field.$el.val(field.error);
                    }
                }
                scope.invalidFields.push(field);
            }
        });

        // check if there is error in fields
        var response = false;
        if (this.invalidFields.length > 0) {
            if (typeof this.options.onError === 'function') {
                this.options.onError.call(this.options.scope, this.fields, this.invalidFields);
            }
        } else {
            response = true;
            if (typeof this.options.onSuccess === 'function') {
                this.options.onSuccess.call(this.options.scope, this.fields);
            }
        }
        return response;
    };

    p.reset = function() {
        $.each(this.fields, function(index, item) {
            privates.reset.call(this, item);
        });
    };

    p.fillPlaceholders = function() {
        var scope = this;
        $.each(this.fields, function(index, item) {
            privates.fill.call(scope, item);
        });
    };

    p.toString = function(){
        return "[" + this.name + "]";
    };

    var events = {
        clickRelatedHandler: function(e) {
            e.preventDefault();
            var field = e.data;
            field.$el.trigger('focus.' + this.name, field);
        },
        focusHandler: function(e) {
            var field = e.data;
            if (field.$related && field.$el.val() == field.$el[0].defautValue) {
                field.$related.css({display:'none'});
            } else {
                if (field.$el.val() == field.placeholder || field.$el.val() == field.error) {
                    var value = (field.enteredValue) ? field.enteredValue : "";
                    delete field.enteredValue;
                    field.$el.val(value);
                }
            }
        },
        blurHandler: function(e) {
            var scope = this;
            var field = e.data;
            // timeout to let mask get out
            setTimeout(function() {
                privates.fill.call(scope, field);
            }, 100);
        }
    };

    var rules = {
        defaultRule: function(field) {
            field.$el[0].defautValue = "";
            var regexp = (field.pattern) ? field.pattern : new RegExp();
            if (field.mask) {field.$el.mask(field.mask);}
            //if (field.mask && !field.pattern) {regexp = privates.maskToRegEx.call(this, field);}
            return regexp;
        },
        emailRule: function(field) {
            field.$el[0].defautValue = "";
            var regexp = (field.pattern) ? field.pattern : this.fieldTypeDefaults.email.pattern;
            if (field.mask) {field.$el.mask(field.mask);}
            return regexp;
        },
        phoneRule: function(field) {
            field.$el[0].defautValue = "";
            var regexp = (field.pattern) ? field.pattern : this.fieldTypeDefaults.phone.pattern;
            var mask   = (field.mask) ? field.mask : this.fieldTypeDefaults.phone.mask;
            field.$el.mask(mask);
            return regexp;
        },
        zipcodeRule: function(field){
            field.$el[0].defautValue = "";
            var regexp = (field.pattern) ? field.pattern : this.fieldTypeDefaults.zipcode.pattern;
            var mask   = (field.mask) ? field.mask : this.fieldTypeDefaults.zipcode.mask;
            field.$el.mask(mask);
            return regexp;
        },
        selectRule: function(field) {
            field.$el[0].defautValue = field.$el.find('option:first-child').val();
            return null;
        },
        checkboxRule: function(field) {
            field.$el[0].defautValue = false;
            return null;
        },
        radioRule: function(field) {
            field.$el[0].defautValue = false;
            return null;
        },
        fileRule: function(field) {
            field.$el[0].defautValue = "";
            return null;
        }
    };

    var validations = {
        defaultValidation: function(field) {
            var val   = field.$el.val();
            var valid = true;

            var needToValid = false;
            if (field.required) {needToValid = true;}
            if (!field.required && field.placeholder != val && field.error != val && field.$el[0].defautValue != val) {needToValid = true;}
            if (!field.required && field.$copy && field.$copy.val() != field.$copy[0].defautValue) {needToValid = true;}
            if (!field.required && field.$el[0].$copied && field.$el[0].$copied.val() != field.$el[0].$copied[0].defautValue) {needToValid = true;}

            if (needToValid) {
                if (!field.rule.test(val)) {valid = false;} // validate rule
                if (field.placeholder && field.placeholder == val) {valid = false;} // validate placeholder
                if (field.error && field.error == val) {valid = false;} // validate error
                if (!field.default_ok && field.$el[0].defautValue == val) {valid = false;} // validate empty
                if (field.$el[0].$copied && field.$el[0].$copied.val() != val) {valid = false;} // validate copy
                if (field.$copy && field.$copy.val() != val) {valid = false;} // validate copy
            }
            return valid;
        },
        selectValidation: function(field) {
            var val   = (field.$el.val()) ? field.$el.val() : '';
            var valid = true;

            if (field.required && !field.default_ok && field.$el[0].defautValue == val) {valid = false;}
            return valid;
        },
        checkboxValidation: function(field) {
            var valid = true;

            if (field.required && field.$el.filter(":checked").length == 0) {valid = false;}
            return valid;
        },
        radioValidation: function(field) {
            var valid = true;

            if (field.required && field.$el.filter(":checked").length == 0) {valid = false;}
            return valid;
        },
        fileValidation: function(field) {
            var val   = field.$el.val();
            var valid = true;

            var inArray = false;
            var regexp = /(?:\.([^.]+))?$/;
            var filetype = regexp.exec(val);
            for (var key in field.filetype) {if (field.filetype[key] == filetype[0]) {inArray = true;}}

            if (field.required && !inArray) {valid = false;}
            return valid;
        }
    };

    var privates = {
        fill: function(field) {
            if (field.placeholder && field.$el.val() == field.$el[0].defautValue) {
                if (field.$related) {
                    field.$related.css({display:'block'});
                    field.$related.html(field.placeholder);
                } else {
                    field.$el.val(field.placeholder);
                }
            }
        },
        reset: function(field) {
            if (field.enteredValue) {delete field.enteredValue;}

            field.$el.removeClass('error');
            if (field.$skin) {field.$skin.removeClass('error');}
            if (field.$label) {field.$label.removeClass('error');}
            if (field.$related) {field.$related.removeClass('error');}
            if (field.errors.length > 0) {
                $.each(field.errors, function(index, $item) {
                    $item.removeClass('error');
                });
            }

            if (field.type == 'text' || field.type == 'textarea' || field.type == 'email' || field.type == 'phone' || field.type == 'zipcode'|| field.type == 'password' || field.type == 'select' || field.type == 'file') {
                field.$el.val(field.defaultValue);
            } else if (field.type == 'checkbox' || field.type == 'radio') {
                field.$el.attr('checked', false);
            }
			field.$el.trigger('change', 'ValidateMe');

            privates.fill.call(this, field);
        },
        maskToRegEx: function(obj) {
            var regEx = obj.mask.regex;
            regEx = utils.escape.call(this, regEx);
            regEx = regEx.replace(/9/g,'[0-9]'); // replace numeric - Represents a numeric character (0-9)
            if (obj.type == "postal") {
                regEx = regEx.replace(/a/g, obj.regExAlpha); // Represents an alpha CAPS character [ABCEGHJKLMNPRSTVWXYZ]
                regEx = new RegExp(regEx, 'i');
            } else {
                regEx = regEx.replace(/a/g, '[a-zA-Z]'); // Represents an alpha character (A-Z,a-z)
                regEx = regEx.replace(/\*/g, '[a-zA-Z0-9]'); // Represents an alphanumeric character (A-Z,a-z,0-9)
                regEx = new RegExp(regEx);
            }
            return regEx;
        }
    };

    var utils = {
        capitalize: function(text) {
            return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
        },
        escape: function(text) {
            return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
        }
    };

    if(!window.Me){
        window.Me = {};
    }
    window.Me.validate = ValidateMe;
}(jQuery, window, document));


/*
 * FormMe
 * Librairy to handle form easily
 * Requires : Jquery, ValidateMe
 */

(function($, window, document, undefined) {
    //Param: $el is a form DOM element.
    var FormMeInstanceID = 1;
    var FormMeName = "FormMe-";
    var FormMe = function(options) {
        this.id      = FormMeInstanceID;
        this.name    = FormMeName + String(this.id) + ":: ";
        this.__construct(options);
        FormMeInstanceID ++;
    };

    var p = FormMe.prototype;
    p.debug          = false;

    p.id             = null;
    p.name           = null;
    p.options        = null;

    p.$form          = null;
    p.$messages      = null;
    p.$btn 	         = null;

    p.skin_enabled   = false;
    p.ajax_form      = true;

    p.action_url     = null;
    p.fields         = null;
    p.disabled       = null;
    p.accepted_empty = null;

    p.__construct = function(options) {
        this.meOpts(options);
        if (!this.$form.length > 0) {
            console.warn(this.name + "Couldn't find associated form ", this.$form);
            return this;
        }
        this.addFields();
        this.addEvents();
        return this;
    };

    p.meOpts = function(options) {
        var settings = $.extend({}, options || {});
        var proprietiesArray = ['debug', 'scope', 'prettyName', '$form', '$btn', 'skin_enabled', 'ajax_form', 'action_url', 'fields', 'disabled', 'accepted_empty', 'onValidationError', 'onValidationSuccess', 'onAllSuccess', 'onSuccess', 'onAllError', 'onError'];
        var scope = this;
        $.each(settings, function(index, value) {
            if ($.inArray(index, proprietiesArray) != -1) {
                scope[index] = value;
                delete settings[index];
            }
        });
        this.options = settings;
    };

    p.addFields = function(array) {
		var scope = this;
		if (!array) {
			if (this.skin_enabled) { if (window.Me && Me.skin) {this.skin = new Me.skin(this.$form);} else {console.warn('if you want to skin you need SkinMe.');}}
			this.validation = new Me.validate(this.$form, {scope:this, debug:this.debug, onError:this.onValidationError, onSuccess:this.onValidationSuccess});
			$.each(this.fields, function(index, value) {
				scope.validation.addField(value);
			});
		} else {
			$.each(array, function(index, value) {
				scope.validation.addField(value);
			});
		}
    };

	p.removeFields = function(array) {
		var scope = this;
		$.each(array, function(index, value) {
			scope.validation.removeField(value);
		});
	};

    p.addEvents = function() {
        this.$messages  = (this.$form.find('.form-messages').length > 0) ? this.$form.find('.form-messages') : null;
        this.action_url = (this.action_url) ? this.action_url : this.$form.attr('action');
        this.$btn       = (this.$btn) ? this.$btn : this.$form.find('.btn-submit');

        if (this.$btn.length > 0) {this.$btn.on('click.validation', $.proxy(this.clickSubmitHandler, this));}
        this.$form.on('submit.validation', $.proxy(this.submitHandler, this));
    };

    p.clickSubmitHandler = function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.$form.submit();
    };

    p.submitHandler = function(e) {
        if (this.ajax_form) {e.preventDefault();}

        var response = true;
        if (this.validation.validate()) {response = false;}
        if (!this.ajax_form) {return response;}
        return this;
    };

    p.onValidationError = function(fields, errorFields) {

        var field = null;
        for (var fieldKey = 0; fieldKey < fields.length; fieldKey++) {
            field = fields[fieldKey];
            field.$el.removeClass('error');
            if (field.$skin) {field.$skin.removeClass('error');}
            if (field.$label) {field.$label.removeClass('error');}
            if (field.$related) {field.$related.removeClass('error');}
            if (field.$el.parents(".dk_container").length > 0) {field.$el.parents(".dk_container").removeClass('error');}
            if (field.errors.length > 0) {
                $.each(field.errors, function(index, $item) {
                    $item.removeClass('error');
                });
            }
        }

        var emptyField = false;
        for (var errorFieldKey = 0; errorFieldKey < errorFields.length; errorFieldKey++) {
            field = errorFields[errorFieldKey];
            field.$el.addClass('error');
            if (field.$skin) {field.$skin.addClass('error');}
            if (field.$label) {field.$label.addClass('error');}
            if (field.$related) {field.$related.addClass('error');}
            if (field.$el.parents(".dk_container").length > 0) {field.$el.parents(".dk_container").addClass('error');}
            if (field.errors.length > 0) {
                $.each(field.errors, function(index, $item) {
                    $item.addClass('error');
                });
            }

            if (field.$el.val() == field.$el[0].defautValue || field.$el.val() == field.placeholder || field.$el.val() == field.error) {
                emptyField = true;
            }
        }

        if (this.$messages) {
            this.$messages.find('.error').addClass('hide');
            if (emptyField) {
                this.$messages.find('.error-empty').removeClass('hide');
            } else {
                this.$messages.find('.error-validation').removeClass('hide');
            }
        }

        if (this.prettyName && Me.track) {
            Me.track.event('formulaire', this.prettyName, 'validation non réussite');
        }
    };

    p.onValidationSuccess = function(fields) {
        for (var fieldKey = 0; fieldKey < fields.length; fieldKey++) {
            var field = fields[fieldKey];
            field.$el.removeClass('error');
            if (field.$skin) {field.$skin.removeClass('error');}
            if (field.$label) {field.$label.removeClass('error');}
            if (field.$related) {field.$related.removeClass('error');}
            if (field.$el.parents(".dk_container").length > 0) {field.$el.parents(".dk_container").removeClass('error');}
            if (field.errors.length > 0) {
                $.each(field.errors, function(index, $item) {
                    $item.removeClass('error');
                });
            }
        }

        if (this.$messages) {
            this.$messages.find('.error').addClass('hide');
            this.$messages.find('.error-none').removeClass('hide');
        }

        if (this.prettyName && Me.track) {
            Me.track.event('formulaire', this.prettyName, 'validation réussite');
        }
        this.formSend(privates.formatData.call(this));
    };

    p.formSend = function(data) {
        if(this.antiSpam) {return;}
        this.antiSpam = true;

        $.ajax({
            method:'post',
            url: this.action_url,
            data: data,
            type: 'json',
            dataType: 'json',
            success: $.proxy(this.ajaxSuccess, this),
            error: $.proxy(this.ajaxError, this)
        });
    };

    p.ajaxSuccess = function(data) {
        this.onAllSuccess.call(this, data);
        this.onSuccess.call(this.scope, data);
        this.antiSpam = false;
        if ((data.response && data.response.success == 1) || (data.success && data.success == 1)) {
            if (this.prettyName && Me.track) {
                Me.track.event('formulaire', this.prettyName, 'envoi réussi');
            }
        }
    };

    p.onAllSuccess = function(data) {
        if ((data.response && data.response.success == 1) || (data.success && data.success == 1)) {
            this.validation.reset();
        }
    }

    p.onSuccess = function(data) {
        console.log(data);
    };

    p.ajaxError = function(error) {
        this.onAllError.call(this, error);
        this.onError.call(this.scope, error);
        this.antiSpam = false;
        if (this.prettyName && Me.track) {
            Me.track.event('formulaire', this.prettyName, 'envoi non réussi');
        }
    };

    p.onAllError = function(error) {

    };

    p.onError = function(error) {
        console.log(error);
    };

    p.toString = function(){
        return "[" + this.name + "]";
    };

    var privates = {
        formatData: function() {
            var data      = this.$form.serializeArray();
            var finalData = {};
            var scope     = this;
            $.each(data, function(index, item) {
                if (item.name == "postal_code") {
                    item.value = item.value.toUpperCase();
                }

                var checkIfEmpty = true;
                if (scope.accepted_empty && $.inArray(item.name, scope.accepted_empty) != -1) {checkIfEmpty = false;}
                if (checkIfEmpty && item.value == "") {return;}
                if (scope.disabled && $.inArray(item.name, scope.disabled) != -1) {return;}
                finalData[item.name] = item.value;
            });
            return finalData;
        }
    };

    if(!window.Me){
        window.Me = {};
    }
    window.Me.form = FormMe;
}(jQuery, window, document));