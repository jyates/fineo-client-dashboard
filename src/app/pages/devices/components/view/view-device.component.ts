import { Component, ViewEncapsulation, Input } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { DeviceDataService, DeviceInfo, DeviceKeyInfo } from '../../../../services/deviceData.service'
import { ViewKeysComponent } from '../keys/view-keys.component'

@Component({
  selector: 'view-device',
  encapsulation: ViewEncapsulation.None,
  template: require('./view-device.html'),
  styles: []//require('./view-device.scss')
})
export class ViewDeviceComponent {

  public form:FormGroup;
  public deleting:boolean = false;
  public saving:boolean = false;

  private name:AbstractControl;
  private device_info:DeviceInfo;
  private keys:DeviceKeyInfo[];
  private id:string;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private service: DeviceDataService,
              private fb:FormBuilder){
  }

  ngOnInit() {
    this.route.params.subscribe(path_info => {
      this.id = path_info["id"];
      this.service.getDeviceInfo(this.id).then(result =>{
        this.device_info = result;
        this.keys = this.device_info['keys'];

        this.form = this.fb.group({
          'name': [this.device_info['name'], []]
        });
        this.name = this.form.controls['name']
      });// end promise
    })
  }


  public onSubmit(form, valid):void{
    // save the changes
    console.log("Submitted: "+JSON.stringify(form));
    this.saving = true;
    this.service.updateDeviceName(this.id, this.name.value).then(result =>{
      // DONE! Now, go to the main device page
      this.saving = false;
      this.returnHome();
    })
    .catch(err =>{
      this.saving = false;
      this.alertError("Error updating device", err);
    });
  }

  public delete_device():void{
    if (! window.confirm('Are you sure you want to delete this device?')) {
      return;
    }
    this.deleting = true;
    this.service.delete_device(this.id).then(result =>{
      this.deleting = false;
      this.returnHome();
    }).catch(err =>{
      this.deleting = false;
      this.alertError("Error deleting device", err);
    });
  }

  private checkArraySet(val:string):string[]{
    if(val != undefined && val != null){
      return val.split(",");
    } 
    return null;
  }

  private returnHome():void{
    var target = '/pages/devices/view'
    console.log("redirecting to: "+target);
    this.router.navigate([target]);
  }

  private alertError(msg:string, err):void{
    console.log(msg, "\n", JSON.stringify(err));
    alert(msg+"! please send console output to help@fineo.io");
  }
}