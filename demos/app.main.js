$(document).ready(function(){
	var $form = $('.form-account-login');
	var antiSpam = false;
	var validation = new Me.validate($form, {onError:onValidationError, onSuccess:onValidationSuccess});

	validation.addField({name: 'no-placeholder'});
	validation.addField({name: 'not-required', required:false});
	validation.addField({name: 'postal', type:'zipcode'});
	validation.addField({name: 'phone', type:'phone'});
	validation.addField({name: 'email', type:'email'});
	validation.addField({name: 'email-copy', type:'email', copy:'email'});
	validation.addField({name: 'password'});
	validation.addField({name: 'checkbox'});
	validation.addField({name: 'radio'});
	validation.addField({name: 'file', filetype:'.doc, .pdf,.txt'});

	$form.on('submit', submitHandler);
	$form.find('.btn-submit').on('click', clickSubmitHandler);

	function reformatFormData(data) {
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

	function clickSubmitHandler(e) {
		e.preventDefault();
		$form.submit();
	}

	function submitHandler(e) {
		e.preventDefault();
		if (validation.validate()) {}
	}

	function onValidationError(fields, errorFields) {
		var field = null;
		for (var fieldKey = 0; fieldKey < fields.length; fieldKey++) {
			field = fields[fieldKey];
			handleValidationSuccessField(field);
		}

		var emptyField = false;
		for (var errorFieldKey = 0; errorFieldKey < errorFields.length; errorFieldKey++) {
			field = errorFields[errorFieldKey];
			handleValidationErrorField(field);
			if (field.$el.val() == field.$el[0].defautValue || field.$el.val() == field.placeholder || field.$el.val() == field.error) {
				emptyField = true;
			}
		}
	}

	function onValidationSuccess(fields) {
		var field;
		for (var fieldKey = 0; fieldKey < fields.length; fieldKey++) {
			field = fields[fieldKey];
			handleValidationSuccessField(field);
		}
		formSend(reformatFormData($form.serializeArray()));
	}

	function handleValidationSuccessField(field) {
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

	function handleValidationErrorField(field) {
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
	}

	function formSend(data) {
		if(antiSpam) {return;}
		antiSpam = true;

		$.ajax({
			method: 'POST',
			url: '/',
			data: data,
			type: 'json',
			dataType: 'json',
			success: formAjaxSuccess,
			error: formAjaxError
		});
	}

    function formAjaxSuccess(data) {
		console.log(data);
        antiSpam = false;
        if (data.response.success == 0) {
            $.each(validation.fields, function(index, field) {
                field.$el.addClass('error');
            });
        }
    }

    function formAjaxError(error) {
		console.log(error);
        antiSpam = false;
    }
});