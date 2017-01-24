import { Component, ViewEncapsulation, Input, ViewChild } from '@angular/core';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators} from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ModalDirective } from 'ng2-bootstrap';

import {
  DeviceDataService,
  DeviceInfo,
  DeviceKeyInfo,
  CreatedDeviceKeyInfo
} from '../../../../services/deviceData.service'

@Component({
  selector: 'view-device',
  encapsulation: ViewEncapsulation.None,
  template: require('./view-device.html'),
  styles: [require('./view-device.scss')]
})
export class ViewDeviceComponent {

  public form:FormGroup;
  // start out loading.
  public loading:boolean = true;
  public deleting:boolean = false;
  public saving:boolean = false;

  private name:AbstractControl;
  private device_info:DeviceInfo;
  private keys:DeviceKeyInfo[];
  private id:string;

  // handle creating a new key for the device
  public latest_key:CreatedDeviceKeyInfo;
  @ViewChild('childModal') childModal: ModalDirective;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private service: DeviceDataService,
              private fb:FormBuilder){
  }

  ngOnInit() {
    this.route.params.subscribe(path_info => {
      this.id = path_info["id"];
      console.log("Getting device info for: ", this.id);
      this.service.getDeviceInfo(this.id).then(result =>{
        console.log("RECEIVED device info for: ", this.id);
        this.device_info = result;
        this.keys = this.device_info['keys'];

        this.form = this.fb.group({
          'name': [this.device_info['name'], []]
        });
        this.name = this.form.controls['name']
        this.loading = false;
        console.log("Loading device: ", this.loading);
      }).catch(err =>{
        this.alertError("Failed to load device: "+this.id, err);
        this.returnHome();
      }
      );
    })
  }

  public onSubmit(form, valid):void{
    // save the changes
    this.saving = true;
    this.service.updateDeviceName(this.id, this.name.value).then(result =>{
      console.log("Done updating device name");
      this.saving = false;
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

  public createKey():void{
    console.log("creating new key for device: "+this.id)
    this.loading = true;
    this.service.createKey(this.id).then(key_info =>{
      this.loading = false;
      this.keys.push(key_info);
      this.latest_key = key_info;
      this.childModal.show();
    }).catch(err => {
      this.loading = false;
      this.alertError("Error creating key", err);
    })
  }

  public onDeleteKeyConfirm(key:DeviceKeyInfo):void{
    if (window.confirm('Are you sure you want to delete key '+key.id+'?')) {
      this.deleting = true;
      this.service.deleteKey(this.id, key.id).then(result =>{
        var index = this.keys.indexOf(key);
        this.keys.splice(index, 1);
        this.deleting = false;
      }).catch(err =>{
        this.deleting = false;
        this.alertError("Error deleting key: "+key.id, err);
      })
    }
  }

  public hideModal():void {
    this.childModal.hide();
    this.latest_key = null;
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