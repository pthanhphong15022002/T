import { Component, Input, OnInit } from '@angular/core';
import { AlertConfirmInputConfig, CacheService, CallFuncService, DialogModel, FormModel, NotificationsService } from 'codx-core';
import { CodxCmService } from '../../../codx-cm.service';
import { BS_AddressBook } from '../../../models/cm_model';
import { PopupAddressComponent } from './popup-address/popup-address.component';

@Component({
  selector: 'codx-address-cm',
  templateUrl: './codx-address-cm.component.html',
  styleUrls: ['./codx-address-cm.component.css'],
})
export class CodxAddressCmComponent implements OnInit {
  @Input() funcID: any;
  @Input() entityName: any;
  @Input() id: any;
  @Input() type: any;
  listAddress = [];
  listAddressDelete = [];
  formModelAddress: FormModel;
  moreFuncAdd = '';
  moreFuncEdit = '';
  loaded: boolean;

  constructor(private cmSv: CodxCmService, private cache: CacheService, private notiService: NotificationsService, private callFc: CallFuncService,) {}

  ngOnInit(): void {
    this.getListAddress(this.entityName, this.id);
    this.getFormModelAddress();
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        let edit = res.find((x) => x.functionID == 'SYS03');
        if (m) this.moreFuncAdd = m.customName;
        if (edit) this.moreFuncEdit = edit.customName;
      }
    });
  }

  getListAddress(entityName, recID) {
    this.loaded = false;
    this.cmSv.getListAddress(entityName, recID).subscribe((res) => {
      if (res && res.length > 0) {
        this.listAddress = this.cmSv.bringDefaultContactToFront(res);
      }
      this.loaded = true;

    });
  }

  clickMFAddress(e, data){

  }

  changeDataMFAddress(e, data){
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS003':
          case 'SYS004':
          case 'SYS002':
          case 'SYS04':
            res.disabled = true;
            break;
        }
      });
    }
  }
  getFormModelAddress() {
    let dataModel = new FormModel();
    dataModel.formName = 'CMAddressBook';
    dataModel.gridViewName = 'grvCMAddressBook';
    dataModel.entityName = 'BS_AddressBook';
    dataModel.funcID = this.funcID;
    this.formModelAddress = dataModel;
  }

  openPopupAddress(data = new BS_AddressBook(), action = 'add') {
    let opt = new DialogModel();
    let dataModel = new FormModel();
    var title =
      (action == 'add' ? this.moreFuncAdd : this.moreFuncEdit)
    dataModel.formName = 'CMAddressBook';
    dataModel.gridViewName = 'grvCMAddressBook';
    dataModel.entityName = 'BS_AddressBook';
    dataModel.funcID = this.funcID;
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('CMAddressBook', 'grvCMAddressBook')
      .subscribe((res) => {
        if (res) {
          var obj = {
            title: title,
            gridViewSetup: res,
            action: action,
            data: data,
            listAddress: this.listAddress,
          };
          var dialog = this.callFc.openForm(
            PopupAddressComponent,
            '',
            500,
            700,
            '',
            obj,
            '',
            opt
          );
          dialog.closed.subscribe((e) => {
            if (e && e.event != null) {
              if (e?.event?.adressType) {
                var address = new BS_AddressBook();
                address = e.event;
                var index = this.listAddress.findIndex(
                  (x) => x.recID != null && x.recID == address.recID
                );
                var checkCoincide = this.listAddress.some(
                  (x) =>
                    x.recID != address.recID &&
                    x.adressType == address.adressType &&
                    x.street == address.street &&
                    x.countryID == address.countryID &&
                    x.provinceID == address.provinceID &&
                    x.districtID == address.districtID &&
                    x.regionID == x.regionID
                );
                var check = this.listAddress.some(
                  (x) =>
                    x.recID != address.recID &&
                    x.adressType == '1' &&
                    address.adressType == '1'
                );
                if (!checkCoincide && !check) {
                  if (index != -1) {
                    this.listAddress.splice(index, 1);
                  }
                  this.listAddress.push(address);
                } else {
                  // this.notiService.notifyCode(
                  //   'CM003',
                  //   0,
                  //   '"' + this.gridViewSetup['Address'].headerText + '"'
                  // );
                }
                this.listAddress = this.cmSv.bringDefaultContactToFront(this.listAddress);
              }
            }
          });
        }
      });
  }

  removeAddress(data) {
    var config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        var index = -1;
        this.listAddress =  this.cmSv.bringDefaultContactToFront(this.listAddress.splice(index, 1));
        this.listAddressDelete.push(data);
      }
    });
  }
}
