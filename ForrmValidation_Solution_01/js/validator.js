function Validator(options) {

    // Object chứa các thẻ, nội dung mỗi thẻ là array các rule trên thẻ
    const selectorRules = {}
    options.rules.forEach(rule => {
        if (selectorRules[rule.selector]) {
            selectorRules[rule.selector].push(rule);
        }
        else {
            selectorRules[rule.selector] = [rule];
        }
    })
    
    // Function tìm thẻ parent theo selector và thẻ con element 
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    // Function validate cho một thẻ nhập
    function validation(selector, rules) {
        const inputElements = Array.from(formElement.querySelectorAll(selector));
        if (inputElements.length === 0) {
            return;
        }

        const errorElement = getParent(inputElements[0], options.formGroupSelector).querySelector(options.errorSelector);
        let errorMessage;

        inputElements.every(inputElement => {
            for (let i = 0; i < rules.length; i++) {
                switch (inputElement.type) {
                    case 'checkbox':
                    case 'radio':
                        errorMessage = rules[i].test(inputElement.checked);
                        break;
                    default:
                        errorMessage = rules[i].test(inputElement.value);
                        break;
                }
                
                if (errorMessage) {
                    break;
                }
            }
            return errorMessage;
        })

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElements[0], options.formGroupSelector).classList.add('invalid');
        }
        else {
            errorElement.innerText = '';
            getParent(inputElements[0], options.formGroupSelector).classList.remove('invalid');
        }
        
        return errorMessage;
    }

    const formElement = document.querySelector(options.form);

    // Kiểm tra nếu lấy được form sẽ xử lý
    if (formElement) {

        // Xử lý khi submit form
        formElement.onsubmit = (e) => {

            if (options?.onSubmit) {
                
                e.preventDefault();
                let data = {};
                let valid = true;

                for (const selector in selectorRules) {
    
                    if(validation(selector, selectorRules[selector])) {
                        valid = false;
                    };
                }

                if (valid) {

                    const enableInputs = Array.from(formElement.querySelectorAll('[name]:not([disabled])'));
                    data = enableInputs.reduce((acc, cur) => {
    
                        let value = [];
                        switch (cur.type) {
                            case 'checkbox':
                                if (cur.checked) {
                                    value = acc?.[cur.name] ? [...acc[cur.name], cur.value] : [cur.value];
                                }
                                else {
                                    value = acc?.[cur.name] ? acc[cur.name] : [];
                                }
                                break;
                            case 'radio':
                                if (cur.checked) {
                                    value = cur.value ;
                                }
                                else {
                                    value = acc?.[cur.name] ? acc[cur.name] : '';
                                }
                                break;
                            case 'file':
                                value = cur.files;
                                break;
                            default:
                                value = cur.value;
                                break;
                        }
    
                        return {
                            ...acc,
                            [cur.name]: value
                        };
                    }, {})
    
                    options.onSubmit(data);
                }
            }
        }

        // Xử lý các event trên thẻ input
        for (const selector in selectorRules) {

            // Lấy các thẻ input có cùng selector 
            const inputElements = Array.from(formElement.querySelectorAll(selector));
            
            inputElements.forEach(inputElement => {

                inputElement.onblur = () => {
                    validation(selector, selectorRules[selector]);
                }

                inputElement.oninput = (e) => {
                    const errorElement = getParent(e.target, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(e.target, options.formGroupSelector).classList.remove('invalid');
                }
            }) 
        }
        
    }
}

Validator.isRequired = (selector, message) => {
    return {
        selector,
        test(value) {
            const valueType = typeof(value);
            value = (valueType === 'string') ? value.trim() : value;
            return value ? undefined : (message || 'Vui lòng nhập trường này');
        }
    }
} 

Validator.isEmail = (selector, message) => {
    return {
        selector,
        test(value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : (message || 'Email không hợp lệ');
        }
    }
}

Validator.minLength = (selector, min, message) => {
    return {
        selector,
        test(value) {
            return value.length >= min ? undefined : (message || `Nhập vào tối thiểu ${min} ký tự`);
        }
    }
}

Validator.isConfirm = (selector, getConfirmValue, message) => {
    return {
        selector,
        test(value) {
            return value === getConfirmValue() ? undefined : (message || `Nội dung không trùng khớp`);
        }
    }
}