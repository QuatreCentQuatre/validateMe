import IMask from 'imask';

class ValidateMe {
    constructor(form){
        this.form = form;
        this.fields = [];
        
        if(this.form.fields){
            this.initializeFields()
        }
    }
    
    initializeFields(){
        for (const field of this.form.fields){
            this.addField(field);
        }
        
        delete this.form.fields;
    }
    
    addField(options){
        let field = Object.assign({}, this.baseFieldAttr, options);
        field.element = this.form.element.querySelector(`[name="${field.name}"]`);
        if(!this.isValidOptions(field) || !!this.getField(field.name))
            return;

        field.id          = field.element.getAttribute('id') || null;
        field.placeholder = field.element.getAttribute('placeholder') || null;

        if (!field.type) {
            let tag = field.element.tagName.toLowerCase();
            field.type = (tag === "input") ? field.element.type.toLowerCase() : tag;

            if(field.type === 'select'){
                field.defaultValue = (field.element.querySelector('[default]')) ? field.element.querySelector('[default]') : field.element.querySelectorAll('option').eq(0);
            }
        }

        field.copyElement = (field.copy) ? this.form.element.querySelector(`[name="${field.copy}"]`) : null;
        field.regex = (!!field.regex) ? field.regex : (!!this.customFieldType[field.type]) ? this.customFieldType[field.type].regex : null;
        field.mask_options = (!!field.mask_options) ? field.mask_options : (!!this.customFieldType[field.type]) ? this.customFieldType[field.type].mask_options : null;

        if(field.mask_options){
            field.mask = IMask(field.element, field.mask_options);
        }

        this.fields.push(field);
    }
    
    removeField(name){
        let field = this.getField(name);
        
        if(field){
            this.fields.splice(this.fields.indexOf(field), 1);
        }
    }
    
    getField(name){
        return this.fields.find((el) => {
            return el.name === name;
        })
    }
    
    updateMask(fieldName, method, methodParams){
        this.fields.find((el) => {
            if (el.name === fieldName) {
                el.mask[method](methodParams)
            }
        });
    }
    
    validate(){
        this.invalidFields = [];
        
        for (let field of this.fields) {
            let fieldValid = (!!this.validations.default(field));
            
            if(fieldValid){
                if(!!this.validations[field.type]){
                    fieldValid = !!this.validations[field.type](field);
                }
    
                if(fieldValid && !!field.validation){
                    fieldValid = !!field.validation(field);
                }
            }
            
            if(!fieldValid){
                this.invalidFields.push(field);
            }
            
            if(field.type === 'file'){
                field.value = field.element.files;
            } else {
                field.value = field.element.value;
            }
        }
        
        if(this.hasError){
            this.form.onValidationError(this.fields, this.invalidFields);
        } else{
            if(!!this.form.element.hasAttribute('ajax')){
                this.form.onValidationSuccess(this.fields);
            }
        }
        
        return !this.hasError;
    }
    
    // @TODO Add option to change option via function.
    
    isValidOptions(field){
        let isValid = true;
        
        if (field.element.length === 0){
            isValid = false;
            console.error(`Couldn't find field with associated name :: ${field.name}`);
        }
        
        if (field.type) {
            if (!Object.keys(this.customFieldType).includes(field.type)) {
                isValid = false;
                console.warn(`The type you want for the ${field.name} field is not supported so it will be validate as a text field. Please refer to documentation.`);
            }
        }
        
        if (field.required && typeof field.required !== "boolean") {
            isValid = false;
            console.error(`Parammeter 'required' of ${field.name} the field must be boolean.`);
        }
        
        if (field.copy && this.form.element.querySelector(`[name="' + ${field.copy} + '"]`)) {
            isValid = false;
            console.error(`Couldn't find field that need to have the same value with associated name :: ${field.name}`);
        }
        
        if (field.regex && !(field.regex instanceof RegExp)) {
            isValid = false;
            console.error(`RegExp on ${field.name} field is not valid.`);
        }
        
        if (field.filesize && typeof field.filesize !== "number") {
            isValid = false;
            console.error(`Filesize must be a Number.`);
        }
        
        if (field.placeholder && typeof field.placeholder !== "string") {
            isValid = false;
            console.error(`Placeholder must be String.`);
        }
        
        if (field.validation && typeof field.validation !== "function") {
            isValid = false;
            console.error(`Validation must be function.`);
        }

        if (field.format && typeof field.format !== "function") {
            isValid = false;
            console.error(`Format must be a function.`);
        }
        
        return isValid;
    }
    
    reset(){
        $.each(this.fields, function(index, field) {
            if (field.type === 'checkbox' || field.type === 'radio') {
                field.element.setAttribute('checked', false);
                field.element.removeAttribute('checked');
            } else if (field.type === 'select'){
                field.element.value = field.defaultValue.value;
            } else {
                field.element.value = '';
            }

            field.element.dispatchEvent(new Event('change'));
        });
    }
    
    set form(scope){
        this._form = scope;
    }
    
    get form(){return this._form}
    
    set invalidFields(arr){
        if(typeof arr !== 'object'){
            console.error('The arr parameter must be an array');
            return;
        }
        
        this._invalidFields = arr;
    }
    
    get invalidFields(){return this._invalidFields;}
    
    get baseFieldAttr(){
        return {
            name        	: null,  // REQUIRED, String: name attribute of the field.
            type        	: null,  // String, must be one of the types in customFieldType.
            error_code  	: null,  // copy, empty, regex
            required    	: true,  // Boolean: the non-required fields will be validated (only if they are not empty), which let the user the chocie to leave it empty or not.
            copy	    	: null,  // String: Name of the field element who should have the same value.
            regex			: null,  // Regular Expression
            placeholder		: null,	 // String
            validation		: null,	 // Functions
            
            //Select options
            default_ok		: false,	 // Bool, if the default option of the select can be a valid option to submit
            
            //File options
            file_size    	: null,  // Number: filesize allowed in kb
            file_type    	: null,  // Array: types allowed. Exemple: ['.png', '.jpg'],
            
            //Mask
            mask_options: null
        }
    }
    
    get customFieldType(){
        return {
            email: {
                regex: new RegExp(/^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
            },
            phone: {
                regex: new RegExp(/^(?:\+?1)?[-. ]?\(?[2-9][0-8][0-9]\)?[-. ]?[2-9][0-9]{2}[-. ]?[0-9]{4}$/i)
            },
            zipcode: {
                regex: new RegExp(/^[ABCEGHJKLMNPRSTVWXYZ][0-9][ABCEGHJKLMNPRSTVWXYZ]?[ ]?[0-9][ABCEGHJKLMNPRSTVWXYZ][0-9]$/i)
            }
        };
    }
    
    get validations(){
        return {
            default: (field) => {
                let isValid = true;
                let needToValid = (!!field.required || (!field.required && (!!field.element.value || (!!field.copyElement && field.copyElement.value != ''))));
                
                field.error_code = null;
                
                if (needToValid) {
                    if(isValid && !field.element.value) {isValid = false; field.error_code = 'empty';} // validate empty
                    if(isValid && !!field.copyElement && field.copyElement.value !== field.element.value) {isValid = false; field.error_code = 'copy';} // validate copy
                    if(isValid && !!field.regex && !field.regex.test(field.element.value)) {isValid = false; field.error_code = 'regex'}
                }
                
                return isValid;
            },
            text: (field) => {
                let isValid = true;
                return isValid;
            },
            select: (field) => {
                let isValid = true;
                if (field.required && !field.default_ok && field.element.value === field.defaultValue.value) {isValid = false; field.error_code = 'default_ok';}
                return isValid;
            },
            checkbox: (field) => {
                let isValid = true;
                let elements = this.form.element.querySelectorAll(`[name="${field.name}"]`);
                let countSelected = 0;

                elements.forEach((element, index) =>{
                    if(element.checked === true){
                        countSelected ++;
                    }
                });

                if(countSelected === 0){
                    isValid = false;
                    field.error_code = 'no-selection';
                }

                return isValid;
            },
            radio: (field) => {
                let isValid = true;
                let elements = this.form.element.querySelectorAll(`[name="${field.name}"]`);
                let countSelected = 0;

                elements.forEach((element, index) =>{
                    if(element.checked === true){
                        countSelected ++;
                    }
                });

                if(countSelected === 0){
                    isValid = false;
                    field.error_code = 'no-selection';
                }
                return isValid;
            },
            file: (field) => {
                let isValid = false;
                let regexpFiletypes = /(?:\.([^.]+))?$/;

                if(field.required && field.element.files.length == 0){
                    isValid = false;
                    field.error_code = 'empty';
                    return isValid;
                }

                let countInvalidType = 0;
                for(let file of field.element.files){
                    if(!field.file_type.includes(regexpFiletypes.exec(file.name)[0])){
                        countInvalidType++;
                    }
                }

                if(countInvalidType > 0){
                    isValid = false;
                    field.error_code = 'filetype';
                    return isValid;
                }

                if(field.file_size){
                    let totalKb = 0;

                    for(let file of field.element.files){
                        //bytes to kilobytes for simplicity...
                        let sizeToKb = file.size/1000;
                        totalKb += sizeToKb;

                        if(sizeToKb > field.file_size || totalKb > field.file_size){
                            isValid = false;
                            field.error_code = 'size';
                            return isValid;
                        }
                    }
                }
                
                return isValid;
            }
        }
    }
    
    get hasError(){
        return this.invalidFields.length > 0;
    }
}

if(!window.Me){window.Me = {};}
Me.validate = ValidateMe;

export { ValidateMe };