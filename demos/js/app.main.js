document.addEventListener("DOMContentLoaded", function() {
	let formEl = document.querySelector('#form-account-login');
	
	let form = {
		el: formEl,
		ajax: !!formEl.hasAttribute('ajax'),
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
				element: formEl,
				fields: [
					{name: 'no-placeholder', required: true},
					// {name: 'phone', type:'phone', mask_options: {
					// 		mask: '(000) 000-0000',
					// 		lazy: false
					// }}
				],
				onValidationError: (...params)=>{this.onValidationError(...params)},
				onValidationSuccess: (...params)=>{this.onValidationSuccess(...params)},
			});
			
			this.addEvents();
		},
		addEvents(){
			this.el.querySelector('.btn-submit').addEventListener('click', (e)=>{this.submitHandler(e)});
			this.el.addEventListener('submit', (e)=>{this.submitHandler(e)});
			this.el.querySelector('#active_toggler').addEventListener('click', (e)=>{this.toggleFieldValidation(e)});
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

			this.el.classList.remove(this.classes.invalid);
			this.el.classList.add(this.classes.valid);

			if (this.ajax) {
				this.handleAjaxSend(new FormData(this.el));
			}
		},
		onValidationError(fields, errorFields){
			fields.forEach((field, index) => {
				this.handleValidationSuccessField(field);
			});

			errorFields.forEach((field, index) =>{
				this.handleValidationErrorField(field);
			});

			this.el.classList.add(this.classes.invalid);
		},
		handleValidationSuccessField(field){
			//hide previously visible errors from a past validation
			if(field.error){
				field.error.setAttribute('aria-hidden', true).classList.add('hide');
			}
			field.element.classList.remove(this.classes.error);
		},
		handleValidationErrorField(field){
			if(field.error){
				field.error.removeAttribute('aria-hidden').classList.remove('hide');
			}
			field.element.classList.add(this.classes.error);
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

			fetch('/', {
				method: 'post',
				body: formData,
			}).then(response=>{
				// @NOTE
				// If we receive a 404, we will receive a success so we need to verify if the code status is an error and reject the promise.
				if (!response.ok || response.status < 200 || response.status > 300) {
					throw response;
				}

				return response;
			}).then(response=>{
				// @NOTE
				// Detect if the returned content is in json or html otherwise we return everything
				if(response.headers.get('content-type').includes('application/json')){
					return response.json();
				} else{
					return response;
				}
			}).then(response => {
				this.ajaxSuccess(response)
			}).catch(error => {
				this.ajaxError(error);
			});

		},
		ajaxSuccess(data){
			this.antiSpam = false;
			
			// You can reset your form here
			this.el.classList.remove(this.classes.serverError);
			this.el.classList.add(this.classes.serverSuccess);
		},
		
		ajaxError(error){
			this.antiSpam = false;
			this.el.classList.remove(this.classes.serverSuccess);
			this.el.classList.add(this.classes.serverError);
			throw error;
		},
	};
	
	form.initialize();
});