import {AbstractControl, Validators, FormBuilder} from '@angular/forms';
import {EqualPasswordsValidator} from './equalPasswords.validator'

export class PasswordValidator {

  public static validate(control:AbstractControl): {[key: string]: any} {
    let letters = /[a-z]+/i;
    let numbers = /[0-9]+/i;
    let special = /[!@#$%&';:\(\)*+\/=?^_`{|}~.-\/\\\]\[<>\",]+/i;
    return (letters.test(control.value) &&
            numbers.test(control.value) &&
            special.test(control.value)) ?
      null :
      {
        validatePassword: {
          valid: false
        }
      };
  }

  public static getPasswordGroup(fb:FormBuilder):any{
    return fb.group({
        'password': ['', PasswordValidator.getPasswordValidation()],
        'repeatPassword': ['', Validators.compose([Validators.required, Validators.minLength(8)])]
      }, {validator: EqualPasswordsValidator.validate('password', 'repeatPassword')})
  }

  public static getPasswordValidation():any{
    return Validators.compose([Validators.required, Validators.minLength(8), PasswordValidator.validate]);
  }
}
