import {Component} from '@angular/core';
import {FormGroup, AbstractControl, FormBuilder, Validators} from '@angular/forms';

import {UserService, Attribute} from '../../services/user.service'
import {PasswordValidator} from '../../theme/validators';

@Component({
  selector: 'profile',
  styleUrls: ['./profile.scss'],
  templateUrl: './profile.html'
})
export class Profile {

  private form:FormGroup;
  private passwords:FormGroup;
  private attributes:AttribControl[];
  private loading:boolean = true;

  // password controls
  private oPassword: AbstractControl;
  private nPassword:AbstractControl;
  private rPassword: AbstractControl;

  // constructor(){}
  constructor(fb:FormBuilder,
              private user:UserService){
    // start with an empty set of attributes
    this.form = fb.group({});

    // mock user
    // this.user = {
    //   username: "name@domain.com",
    //   apikey: "1234fdsfag12",
    //   changePassword: function(old:string, update:string){
    //     console.log("Changing user password")
    //     return new Promise((resolve, reject) => {
    //       console.log("Updating password from ", old, "to", update);
    //       setTimeout(resolve(""), 10);
    //     });
    //   },
    //   userAttributes: function(){
    //     console.log("Getting user attributes")
    //     return new Promise((resolve, reject) => {
    //       console.log("[in promise] Getting user attributes");
    //       setTimeout(() => {
    //         console.log("[user attrib] timeout complete!");
    //         var attribs = [
    //           new Attribute("name", "Jesse Yates"),
    //           new Attribute("email", "name@domain.com"),
    //           new Attribute("custom:stripeToken", "ct_23452"),
    //           new Attribute("custom:plan", "pl_23452")]
    //         resolve(attribs);
    //       }, 2000);
    //     });
    //   },
    //   updateAttributes : function(attributes: Attribute[]){
    //     attributes.forEach(attrib =>{
    //       console.log("Updating attribute: ["+attrib.getName()+"] =>", attrib.getValue());
    //     })
    //     return new Promise((resolve, reject)=>{
    //      setTimeout(resolve(""), 10);
    //    }
    //   )},
    // };

    // setup password form
    this.passwords = fb.group({
      'oldPassword': ['', PasswordValidator.getPasswordValidation()],
      'newPassword': PasswordValidator.getPasswordGroup(fb)});
    this.oPassword = this.passwords.controls['oldPassword'];
    let np = <FormGroup> this.passwords.controls['newPassword'];
    this.nPassword = np.controls['password'];
    this.rPassword = np.controls['repeatPassword'];

    // get the user info
    this.user.userAttributes().then(attributes => {
      // convert the attributes into a form
      console.log("In attribute processing");
      let group = {};
      let attribControls = [];
      attributes.filter(elem =>{
        let name = elem.getName();
        return !name.startsWith("custom") && !name.match("email") && !name.match("sub");
      }).forEach(elem =>{
        group[elem.getName()] = [elem.getValue(), Validators.compose([Validators.required, Validators.minLength(1)])]
        attribControls.push(new AttribControl(elem));
      });
      this.form = fb.group(group);

      // get the form control for each attribute
      attribControls.forEach(attrib =>{
        let control = this.form.controls[attrib.attrib.getName()];
        attrib.control = control;
      });
      this.attributes = attribControls;
      this.loading = false;
    }).catch(err =>{
      this.alertUser("Failed to load user info!", err);
    });
  }

  public updatePassword():void {
    if(!this.passwords.valid){
      console.log("Atttempted to update password, but new passwork not valid");
      return;
    }

    let oldPassword = this.passwords.controls['oldPassword'];
    this.loading = true;
    this.user.changePassword(oldPassword.value, this.nPassword.value).then(result =>{
      this.loading = false;
    }).catch(err =>{
      this.alertUser("Failed to save password!", err);
    });
  }

  public saveAttributes():void {
    this.loading = true;
    let updates = [];
    // get the attributes to update
    let map = this.form.controls;
    Object.keys(map)
      .forEach(name =>{
        let control = map[name];
        if (control.dirty) {
          updates.push(new Attribute(name, control.value));
        }
      });

    this.user.updateAttributes(updates).then(success =>{
      this.loading = false;
    }).catch(err =>{
      this.alertUser("Failed to update attributes!", err);
    });
  }

  private alertUser(msg:string, cause:any){
    this.alertFineo(msg+"\nReason: "+JSON.stringify(cause))
    this.loading = false;
  }

  private alertFineo(msg:string):void {
     alert(msg+"\nPlease contact help@fineo.io with the output of the web console.");
  }
}

class AttribControl{
  public control: AbstractControl;
  constructor(public attrib: Attribute){}

    // used by html template
  // *********************
  private getName() {
    let name = this.attrib.getName();
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
