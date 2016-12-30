import { Component, ViewEncapsulation, Input } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { DeviceDataService, DeviceInfo, DeviceKeyInfo } from '../../deviceData.service'
import { ViewKeysComponent } from '../keys/view-keys.component'

@Component({
  selector: 'view-device',
  encapsulation: ViewEncapsulation.None,
  template: require('./view-device.html'),
  styles: []//require('./view-device.scss')
})
export class ViewDeviceComponent {

  public form:FormGroup;
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
      this.device_info = this.service.getDeviceInfo(this.id);
      this.keys = this.device_info['keys'];

      this.form = this.fb.group({
        'name': [this.device_info['name'], []]
      });
      this.name = this.form.controls['name']
    })
  }


  public onSubmit(form, valid):void{
    // save the changes
    console.log("Submitted: "+JSON.stringify(form));
    this.service.updateDeviceName(this.id, this.name.value);

    // DONE! Now, go to the main device page
    var target = '/pages/devices/view'
    console.log("redirecting to: "+target);
    this.router.navigate([target]);
  }

  public delete_device():void{
    if (window.confirm('Are you sure you want to delete this device?')) {
      this.service.delete_device(this.id);
    }
  }

  private checkArraySet(val:string):string[]{
    if(val != undefined && val != null){
      return val.split(",");
    } 
    return null;
  }
}