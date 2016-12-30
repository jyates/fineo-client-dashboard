import { Component, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { DeviceDataService, DeviceKeyInfo, CreatedDeviceKeyInfo } from '../../deviceData.service'
import { ModalDirective } from 'ng2-bootstrap';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

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
    var key_info = this.service.createKey(this.id)
    this.latest_key = key_info;
    // show a pop-up with that key information
    this.childModal.show();
  }

  public onDeleteConfirm(key:DeviceKeyInfo):void{
    if (window.confirm('Are you sure you want to delete key '+key.id+'?')) {
      this.service.deleteKey(this.id, key.id);
      var index = this.keys.indexOf(key);
      this.keys.splice(index, 1);
    }
  }

  public hideModal():void{
    this.childModal.hide();
    // push the latest key onto the list
    this.keys.push(this.latest_key);
    this.latest_key = null;
  }
}