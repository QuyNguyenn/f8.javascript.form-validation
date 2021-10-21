function Validator(formSelector) {

    var _this = this;

    function getParent(inputElement, selector) {

        while (inputElement.parentElement) {
            if (inputElement.parentElement.matches(selector)) {
                return inputElement.parentElement;
            }
            inputElement = inputElement.parentElement;
        }
    }

    var formRules = {};

    var validatorRules = {
        required(value) {

            return value ? undefined : 'Vui lòng nhập trường này'
        },
        email(value) {

            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : 'Email không hợp lệ';
        },
        max(max) {

            return function (value) {

                return value.length <= max ? undefined : `Nhập tối đa ${max} ký tự`;
            }
        },
        min(min) {

            return function (value) {

                return value.length >= min ? undefined : `Nhập tối thiểu ${min} ký tự`;
            }
        }
    };
    
    var formElement = document.querySelector(formSelector);

    if (formElement) {
        
        // Query all the input tags that have atribute name and rules
        inputs = formElement.querySelectorAll("input[name][rules]");

        // Loop through every input tag 
        inputs.forEach(input => {
            
            // Take all the rules of the tag
            var rules = input.getAttribute("rules").split("|");
            rules.forEach(rule => {

                var isRuleHasValue = rule.includes(':');
                if (isRuleHasValue) {

                    var ruleInfor = rule.split(':');
                    rule = ruleInfor[0];
                }

                var ruleFunc = validatorRules[rule];
                if (isRuleHasValue) {

                    ruleFunc = ruleFunc(ruleInfor[1]);
                }

                if (Array.isArray(formRules[input.name])) {
                    
                    formRules[input.name].push(ruleFunc);
                }
                else {
                    formRules[input.name] = [ruleFunc];
                }
            })
            console.log(formRules);

            // Event
            input.onblur = handleValidate;

            input.oninput = handleClearError;
        });

        function handleValidate(event) {
            var rules = formRules[event.target.name];
            var errorMessage;
            for (rule of rules) {
                errorMessage = rule(event.target.value);
                if (errorMessage) {
                    break;
                }
            }
            
            if (errorMessage) {
                var formGroup = getParent(event.target, ".form-group");
                if (formGroup) {
                    formGroup.classList.add('invalid');

                    var formMassage = formGroup.querySelector('.form-message');
                    if (formMassage) {
                        formMassage.innerText = errorMessage;
                    }
                }
            }

            return !errorMessage;
        };

        function handleClearError(event) {
            var formGroup = getParent(event.target, '.form-group');

            if (formGroup.classList.contains('invalid')) {
                formGroup.classList.remove('invalid');

                var formMessage= formGroup.querySelector('.form-message');
                if (formMessage) {
                    formMessage.innerText = '';
                }
            }
        };

        formElement.onsubmit = function (event) {
            event.preventDefault();
            var isValid = true;

            for (var input of inputs) {
               if (!handleValidate({ target: input })) {
                   isValid = false;
               }
            }

            if (isValid) {
                
                if (_this.onSubmit) {

                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')

                    var formValue = Array.from(enableInputs).reduce((values, input) => {
                        switch (input.type) {
                            case 'checkbox':
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                if (!input.matches(':checked')) {
                                    return values;
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                                break;
                        }

                        return values;
                    }, {});

                    _this.onSubmit(formValue);
                }
                else {
                    formElement.submit();
                }
            }
        }
    }
}