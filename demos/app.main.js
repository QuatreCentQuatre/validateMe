$(document).ready(function(){
	this.validator = new Me.validate($('#form1'), {onError:onFormError, onSuccess:onFormSuccess});
	this.validator.addField({name:'name', placeholder:"Your name", error:'This field is required'});
	this.validator.addField({name:'pin-mask', mask:'*********', placeholder:"Pin Mask Test", error:'This field is required'});
	this.validator.addField({name:'phone',type:'phone', error:$('#error-phone'), mask:'(514) 999-9999'});
	this.validator.addField({name:'zipcode',type:'zipcode', error:'veuillez entrer un zipcode canadien'});
	this.validator.addField({name:'zipcode-placeholder',type:'zipcode', placeholder:'Zipcode Placeholder', error:'veuillez entrer un zipcode canadien'});
	this.validator.addField({name:'chk1', required:false});
	this.validator.addField({name:'select'});
	this.validator.addField({name:'pw', placeholder:'Your password'});
	this.validator.addField({name:'radio'});
	this.validator.addField({name:'file', filetype:'.doc, .pdf,.txt', required:false});
	this.validator.addField({name:'email', type:'email'});
	this.validator.addField({name:'email2', type:'email', copy:'email'});


	var view = this;
	$('#submit').on('click', function(e){
		e.preventDefault();
		view.validator.validate();
	});

	function onFormError(fields, errorfields){
		for(var key in fields){
			console.log(fields[key].$el.val());
			fields[key].$el.removeClass('error');
		}
		$('input').removeClass('error');
		$('select').removeClass('error');
		$('p').removeClass('error');
		$('.error').css('display','none');

		for(var key in errorfields){
			if(typeof errorfields[key].error === 'string'){
				errorfields[key].$el.val(errorfields[key].error);
			}
			else{
				$(errorfields[key].error).css('display','block');
			}
			errorfields[key].$el.prev('p').addClass('error');
		}
		view.validator.fillPlaceholders();
	}

	function onFormSuccess(fields){
		for(var key in fields){
			console.log(fields[key]);
			fields[key].$el.removeClass('error');
		}
		$('input').removeClass('error');
		$('select').removeClass('error');
		$('p').removeClass('error');
		$('.error').css('display','none');
		view.validator.reset();
	}
});