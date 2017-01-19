import { Component, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import { ModalDirective } from 'ng2-bootstrap';

import { DeviceDataService, DeviceKeyInfo, CreatedDeviceKeyInfo } from '../../../../services/deviceData.service'

@Component({
  selector: 'device-keys',
  encapsulation: ViewEncapsulation.None,
  template: require('./view-keys.html'),
  styles: [require('./view-keys.scss')]
})
export class ViewKeysComponent {

  @Input() id:string;
  @Input() keys:DeviceKeyInfo[];
  @ViewChild('childModal') childModal: ModalDirective;

  public latest_key:CreatedDeviceKeyInfo;

  constructor(private service: DeviceDataService){}

  public createKey():void{
    console.log("creating new key for device: "+this.id)
    this.service.createKey(this.id).then(key_info =>{
      this.latest_key = key_info;

      // show a pop-up with that key information
      this.childModal.show();
    }).catch(err => {
      this.alertError("Error creating key", err);
    })
   
  }

  public onDeleteConfirm(key:DeviceKeyInfo):void{
    if (window.confirm('Are you sure you want to delete key '+key.id+'?')) {
      this.service.deleteKey(this.id, key.id).then(result =>{
        var index = this.keys.indexOf(key);
        this.keys.splice(index, 1);
      }).catch(err =>{
        this.alertError("Error deleting key: "+key.id, err);
      })
      
    }
  }

  public hideModal():void{
    // push the latest key onto the list
    this.keys.push(this.latest_key);
    this.latest_key = null;

    // finally hide the modal
    this.childModal.hide();
  }

  private alertError(msg:string, err):void{
    console.log(msg, "\n", JSON.stringify(err));
    alert(msg+"! please send console output to help@fineo.io");
  }
}