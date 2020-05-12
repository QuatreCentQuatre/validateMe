$(document).ready(function(){
	let $form = $('.form-account-login');
	
	let form = {
		$el: $form,
		ajax: !!$form.attr('ajax'),
		classes: {
			valid: 			'is-valid',
			invalid: 		'is-invalid',
			error: 			'has-error',
			serverError: 	'has-server-error',
			serverSuccess: 	'has-server-success'
		},
		antiSpam: false,
		initialize(){
			this.validation = new Me.validate({
				$el: $form,
				onValidationError: (...params)=>{this.onValidationError(...params)},
				onValidationSuccess: (...params)=>{this.onValidationSuccess(...params)},
			});
			
			this.validation.addField({name: 'no-placeholder'});
			this.validation.addField({name: 'not-required', required:false});
			this.validation.addField({name: 'postal', type:'zipcode'});
			this.validation.addField({name: 'phone', type:'phone'});
			this.validation.addField({name: 'email', type:'email'});
			this.validation.addField({name: 'email-copy', type:'email', copy:'email'});
			this.validation.addField({name: 'password'});
			this.validation.addField({name: 'checkbox'});
			this.validation.addField({name: 'radio'});
			
			this.addEvents();
		},
		addEvents(){
			this.$el.find('.btn-submit').on('click.formDemo', (e)=>{this.submitHandler(e)});
			this.$el.on('submit.formDemo', (e)=>{this.submitHandler(e)});
			this.$el.find('#active_toggler').on('click.activeToggler', (e)=>{this.toggleFieldValidation(e)});
		},
		toggleFieldValidation(e){
			if(this.validation.getField('active_inactive')){
				this.handleValidationSuccessField(this.validation.getField('active_inactive'));
				this.validation.removeField('active_inactive');
			} else{
				this.validation.addField({name: 'active_inactive'});
			}
		},
		onValidationSuccess(fields){
			fields.forEach((field, index) => {
				this.handleValidationSuccessField(field);
			});
			
			this.$el.removeClass(this.classes.invalid).addClass(this.classes.valid);
			
			if (this.ajax) {
				this.handleAjaxSend(this.formatFormData(this.$el.serializeArray()));
			}
		},
		onValidationError(fields, errorFields){
			fields.forEach((field, index) => {
				this.handleValidationSuccessField(field);
			});
			
			errorFields.forEach((field, index) =>{
				this.handleValidationErrorField(field);
			});
			
			this.$el.addClass(this.classes.invalid);
		},
		handleValidationSuccessField(field){
			//hide previously visible errors from a past validation
			if(field.error){
				field.error.addClass('hide').attr('aria-hidden', true);
			}
			field.$el.removeClass(this.classes.error);
		},
		handleValidationErrorField(field){
			if(field.error){
				field.error.removeClass('hide').attr('aria-hidden', false);
			}
			field.$el.addClass(this.classes.error);
		},
		submitHandler(e){
			if (this.ajax && e) {e.preventDefault();}
			
			if(!this.validation.validate()){
				e.preventDefault();
			}
		},
		handleAjaxSend(formData){
			if(this.antiSpam) {return;}
			this.antiSpam = true;
			
			$.ajax({
				method: 'POST',
				url: '/',
				data: formData,
				dataType: 'json',
				success: (...params) => {this.ajaxSuccess(...params)},
				error: (...params) => {this.ajaxError(...params)}
			});
		},
		ajaxSuccess(data){
			this.antiSpam = false;
			
			// You can reset your form here
			this.$el.removeClass(this.classes.serverError).addClass(this.classes.serverSuccess);
		},
		
		ajaxError(error){
			this.antiSpam = false;
			this.$el.removeClass(this.classes.serverSuccess).addClass(this.classes.serverError);
		},
		
		formatFormData(data) {
			let formattedData = {};
			
			data.forEach(function(item, index) {
				let field = $(`[name="${item.name}"]`);
				if(item.value === "" || field.disabled){return;}
				formattedData[item.name] = item.value;
				
				if (item.filetype != undefined) {
					if (field[0].files[0]) {
						formattedData.append(item.name, field[0].files[0]);
					}
				}
			});
			
			return formattedData;
		}
	};
	
	form.initialize();
});