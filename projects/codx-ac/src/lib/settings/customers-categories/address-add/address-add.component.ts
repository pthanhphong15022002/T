import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { ContactAddComponent } from '../contact-add/contact-add.component';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-pop-add-address',
  templateUrl: './address-add.component.html',
  styleUrls: ['./address-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressAddComponent extends UIComponent{
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  dialog: DialogRef;
  dialogData: DialogData;
  headerText: string;
  dataDefault:any;
  constructor(
    inject: Injector,
    private dt: ChangeDetectorRef,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = dialogData.data?.dataDefault;
  }
  //#endregion

  //#region Init
  onInit(): void {
    // this.cache.message('AC0033').subscribe((res) => {
    //   if (res) {
    //     this.lblAdd = res?.customName;
    //   }
    // });

    // this.cache.message('AC0034').subscribe((res) => {
    //   if (res) {
    //     this.lblEdit = res?.customName;
    //   }
    // });
    // this.cache.moreFunction('Contacts', 'grvContacts').subscribe((res) => {
    //   if (res && res.length) {
    //     let m = res.find((x) => x.functionID == 'ACS20501');
    //     if (m) {
    //       this.lblContacts = m.defaultName.toLowerCase();
    //     }
    //   }
    // })
  }
  ngAfterViewInit() {
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Function
  openPopupContact() {
    // var obj = {
    //   headerText: this.lblAdd + ' ' + this.lblContacts,
    //   datacontact: this.objectContactAddress,
    //   recIdAddress: this.address.recID,
    // };
    // let opt = new DialogModel();
    // let dataModel = new FormModel();
    // dataModel.formName = 'ContactBook';
    // dataModel.gridViewName = 'grvContactBook';
    // dataModel.entityName = 'BS_ContactBook';
    // opt.FormModel = dataModel;
    // this.cache
    //   .gridViewSetup('ContactBook', 'grvContactBook')
    //   .subscribe((res) => {
    //     if (res) {
    //       var dialogcontact = this.callfc.openForm(
    //         PopAddContactComponent,
    //         '',
    //         650,
    //         550,
    //         '',
    //         obj,
    //         '',
    //         opt
    //       );
    //       dialogcontact.closed.subscribe((x) => {
    //         var datacontact = JSON.parse(localStorage.getItem('datacontact'));
    //         if (datacontact != null) {
    //           datacontact.reference = this.address.recID;
    //           this.objectContactAddress.push(datacontact);
    //         }
    //         window.localStorage.removeItem('datacontact');
    //       });
    //     }
    //   });
  }

  editobject(data: any, type: any) {
    // let index = this.objectContactAddress.findIndex(
    //   (x) => x.contactID == data.contactID
    // );
    // var ob = {
    //   headerText: this.lblEdit + ' ' + this.lblContacts,
    //   type: 'editContact',
    //   data: { ...data },
    // };
    // let opt = new DialogModel();
    // let dataModel = new FormModel();
    // dataModel.formName = 'ContactBook';
    // dataModel.gridViewName = 'grvContactBook';
    // dataModel.entityName = 'BS_ContactBook';
    // opt.FormModel = dataModel;
    // this.cache
    //   .gridViewSetup('ContactBook', 'grvContactBook')
    //   .subscribe((res) => {
    //     if (res) {
    //       var dialogcontact = this.callfc.openForm(
    //         PopAddContactComponent,
    //         '',
    //         650,
    //         550,
    //         '',
    //         ob,
    //         '',
    //         opt
    //       );
    //       dialogcontact.closed.subscribe((x) => {
    //         var datacontact = JSON.parse(localStorage.getItem('datacontact'));
    //         if (datacontact != null) {
    //           this.objectContactAddress[index] = datacontact;
    //         }
    //         window.localStorage.removeItem('datacontact');
    //       });
    //     }
    //   });
  }

  deleteobject(data: any, type: any) {
    // let index = this.objectContactAddress.findIndex(
    //   (x) => x.reference == data.reference && x.recID == data.recID
    // );
    // this.objectContactAddress.splice(index, 1);
    // this.objectContactAddressDelete.push(data);
    // this.notification.notifyCode('SYS008', 0, '');
  }

  clearAddress() {
    // this.form.formGroup.reset();
    // //this.address = new any();
    // this.objectContactAddress = [];
  }
  
  //#endregion

  //#region Method
  onSave() {
    let validate = this.form.validation(true,false); //? chekc validate tỷ giá
    if(validate) return;
    this.dialog.close({address:{...this.form.data}});
  }
  onSaveAdd() {
    // this.checkValidate();
    // if (this.validate > 0) {
    //   this.validate = 0;
    //   return;
    // } else {
    //   this.objectAddress.push({ ...this.address });
    //   this.objectContactAddress.forEach((element) => {
    //     this.objectContactAddressAfter.push({ ...element });
    //   });
    //   if (this.type == 'editaddress') {
    //     this.notification.notifyCode('SYS007', 0, '');
    //   } else {
    //     this.notification.notifyCode('SYS006', 0, '');
    //   }
    //   this.clearAddress();
    // }
  }
  //#endregion
}
