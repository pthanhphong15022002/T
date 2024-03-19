import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CRUDService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  LayoutAddComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { BankAddComponent } from '../../customers-categories/bank-add/bank-add.component';
import { ContactAddComponent } from '../../customers-categories/contact-add/contact-add.component';
import { AddressAddComponent } from '../../customers-categories/address-add/address-add.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-pop-add-vendors',
  templateUrl: './vendors-add.component.html',
  styleUrls: ['./vendors-add.component.css','../../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorsAddComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: LayoutAddComponent; //? element form layoutadd
  headerText: string;
  dataDefault: any;
  dialog!: DialogRef;
  dialogData!: DialogData;
  lblAdd: any;
  lblEdit: any;
  dicMST: Map<string, any> = new Map<string, any>();
  addressService: CRUDService;
  fmAddress: FormModel = {
    formName: 'AddressBook',
    gridViewName: 'grvAddressBook',
    entityName: 'BS_AddressBook',
  }
  lstAddress: any = [];
  contactService: CRUDService;
  fmContact: FormModel = {
    formName: 'Contacts',
    gridViewName: 'grvContacts',
    entityName: 'BS_Contacts',
  }
  lstContact: any = [];
  bankService: CRUDService;
  fmBank: FormModel = {
    formName: 'BankAccounts',
    gridViewName: 'grvBankAccounts',
    entityName: 'BS_BankAccounts',
  }
  lstBank: any = [];
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'description' },
    { icon: 'icon-settings icon-20 me-3', text: 'Thiết lập', name: 'establish' },
    { icon: 'icon-directions_bus', text: 'Thông tin giao hàng', name: 'shipment-details' },
    { icon: 'icon-location_on', text: 'Danh sách địa chỉ', name: 'location' },
    { icon: 'icon-person_pin', text: 'Người liên hệ', name: 'contact' },
    { icon: 'icon-i-credit-card-2-back', text: 'Tài khoản ngân hàng', name: 'banking-account' },
    { icon: 'icon-20 me-2 icon-tune', text: 'Thông tin khác', name: 'other-infomation' }
  ];
  private destroy$ = new Subject<void>();
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
    this.dialogData = { ...dialogData };
    this.dataDefault = { ...dialogData?.data?.dataDefault };

    this.addressService = this.acService.createCRUDService(
      inject,
      this.fmAddress,
      'BS'
    );

    this.contactService = this.acService.createCRUDService(
      inject,
      this.fmContact,
      'BS'
    );

    this.bankService = this.acService.createCRUDService(
      inject,
      this.fmBank,
      'BS'
    );
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache.message('AC0033').subscribe((res) => {
      if (res) {
        this.lblAdd = res?.customName;
      }
    });

  }
  ngAfterViewInit() {
    this.form.form.onAfterInit.subscribe((res: any) => {
      if (res) {
        this.setValidateForm();
      }
    })
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Event
  valueChange(event: any) {
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    switch (field.toLowerCase()) {
      case 'overduecontrol':
        if (value == '1') {
          this.form.form.setValue(field, true, {});
        } else {
          this.form.form.setValue(field, false, {});
        }
        break;
      case 'vendortaxcode':
        let mst = this.dicMST.has(value);
        if (mst) {
          let data = this.dicMST.get(value)
          this.form.form.setValue('address', data['address'], {});
          this.form.form.setValue('customerName', data['customerName'], {});
          this.form.form.setValue('customerID', data['customerID'], {});
        } else {
          this.api
            .exec('PS', 'VendorsBusiness', 'GetVendorAsync', [value])
            .subscribe((res) => {
              if (res) {
                this.dicMST.set(value, res);
                let data = this.dicMST.get(value)
                this.form.form.setValue('address', data['address'], {});
                this.form.form.setValue('vendorName', data['vendorName'], {});
                this.form.form.setValue('vendorID', data['vendorID'], {});
              }
            });
        }
        break;
      default:
        this.form.form.setValue(field, value, {});
        break;
    }
  }
  //#endregion Event

  //#region Function

  /**
   * *Hàm thay đổi title cho form
   * @param event 
   */
  setTitle(event) {
    this.headerText = this.dialogData?.data?.headerText;
    this.detectorRef.detectChanges();
  }

  /**
   * *Hàm thay đổi validate form
   */
  setValidateForm() {
    let rCustomerID = true;
    let lsRequire: any = [];
    if (this.form.form.data?._keyAuto == 'VendorID') rCustomerID = false;
    lsRequire.push({ field: 'VendorID', isDisable: false, require: rCustomerID });
    this.form.form.setRequire(lsRequire);
  }

  openFormBank() {
    this.bankService.addNew().subscribe((res: any) => {
      if (res) {
        let data = {
          headerText: (this.lblAdd + ' ' + 'tài khoản ngân hàng').toUpperCase(),
          lstBank: [...this.lstBank],
          dataDefault: { ...res },
        };
        this.cache.gridViewSetup(this.fmBank.formName,this.fmBank.gridViewName).subscribe((o)=>{
          let option = new DialogModel();
          option.FormModel = this.fmBank;
          option.DataService = this.bankService;
          let dialog = this.callfc.openForm(
            BankAddComponent,
            '',
            500,
            400,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              this.lstBank.push({...res?.event});
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  editBank(dataEdit: any) {
    
    this.bankService.edit(dataEdit).subscribe((res:any)=>{
      if (res) {
        let data = {
          headerText: (this.lblAdd + ' ' + 'tài khoản ngân hàng').toUpperCase(),
          lstBank: [...this.lstBank],
          dataDefault: { ...res },
          objectID : this.form.form.data.customerID,
          objectType : '1',
        };
        this.cache.gridViewSetup(this.fmBank.formName,this.fmBank.gridViewName).subscribe((o)=>{
          let option = new DialogModel();
          option.FormModel = this.fmBank;
          option.DataService = this.bankService;
          let dialog = this.callfc.openForm(
            BankAddComponent,
            '',
            500,
            400,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              let data = res?.event?.bank;
              let index = this.lstBank.findIndex((x) => x.recID == data.recID);
              if (index > -1) {
                this.lstBank[index] = data;
              }
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  deleteBank(dataDelete: any) {
    this.bankService.delete([dataDelete], true,null,null,null,null,null,false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.error) {
        let index = this.lstBank.findIndex((x) => x.recID == dataDelete.recID);
        if (index > -1) {
          this.lstBank.splice(index, 1);
          this.detectorRef.detectChanges();
        }
      }
    });
  }

  openFormContact() {
    this.contactService.addNew().subscribe((res: any) => {
      if (res) {
        let data = {
          headerText: (this.lblAdd + ' ' + 'người liên hệ').toUpperCase(),
          lstContact: [...this.lstContact],
          dataDefault: { ...res },
        };
        this.cache.gridViewSetup(this.fmContact.formName,this.fmContact.gridViewName).subscribe((o)=>{
          let option = new DialogModel();
          option.FormModel = this.fmContact;
          option.DataService = this.contactService;
          let dialog = this.callfc.openForm(
            ContactAddComponent,
            '',
            650,
            600,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              this.lstContact.push({...res?.event});
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  editContact(dataEdit: any){
    this.contactService.edit(dataEdit).subscribe((res:any)=>{
      if (res) {
        let data = {
          headerText: (this.lblAdd + ' ' + 'người liên hệ').toUpperCase(),
          lstContact: [...this.lstContact],
          dataDefault: { ...res },
          objectID : this.form.form.data.customerID,
          objectName : this.form.form.data.customerName,
          objectType : '1',
        };
        this.cache.gridViewSetup(this.fmContact.formName,this.fmContact.gridViewName).subscribe((o)=>{
          let option = new DialogModel();
          option.FormModel = this.fmContact;
          option.DataService = this.contactService;
          let dialog = this.callfc.openForm(
            ContactAddComponent,
            '',
            650,
            600,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              let data = res?.event;
              let index = this.lstContact.findIndex((x) => x.recID == data.recID);
              if (index > -1) {
                this.lstContact[index] = data;
              }
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  deleteContact(dataDelete:any){
    this.contactService.delete([dataDelete], true,null,null,null,null,null,false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.error) {
        let index = this.lstContact.findIndex((x) => x.recID == dataDelete.recID);
        if (index > -1) {
          this.lstContact.splice(index, 1);
          this.detectorRef.detectChanges();
        }
      }
    });
  }

  openFormAddress() {
    this.addressService.addNew().subscribe((res: any) => {
      if (res) {
        let data = {
          headerText: (this.lblAdd + ' ' + 'địa chỉ').toUpperCase(),
          lstAddress: [...this.lstAddress],
          dataDefault: { ...res },
        };
        this.cache.gridViewSetup(this.fmAddress.formName, this.fmAddress.gridViewName).subscribe((o) => {
          let option = new DialogModel();
          option.FormModel = this.fmAddress;
          option.DataService = this.addressService;
          let dialog = this.callfc.openForm(
            AddressAddComponent,
            '',
            600,
            500,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              this.lstAddress.push({...res?.event});
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  editAddress(dataEdit: any){
    this.addressService.edit(dataEdit).subscribe((res:any)=>{
      if (res) {
        let data = {
          headerText: (this.lblAdd + ' ' + 'địa chỉ').toUpperCase(),
          lstAddress: [...this.lstAddress],
          dataDefault: { ...res },
          objectID : this.form.form.data.customerID,
          objectName : this.form.form.data.customerName,
          objectType : '1',
        };
        this.cache.gridViewSetup(this.fmAddress.formName, this.fmAddress.gridViewName).subscribe((o) => {
          let option = new DialogModel();
          option.FormModel = this.fmAddress;
          option.DataService = this.addressService;
          let dialog = this.callfc.openForm(
            AddressAddComponent,
            '',
            600,
            500,
            '',
            data,
            '',
            option
          );
          dialog.closed.subscribe((res) => {
            if (res && res?.event) {
              let data = res?.event;
              let index = this.lstAddress.findIndex((x) => x.recID == data.recID);
              if (index > -1) {
                this.lstAddress[index] = data;
              }
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  deleteAddress(dataDelete:any){
    this.addressService.delete([dataDelete], true,null,null,null,null,null,false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && !res?.error) {
        let index = this.lstAddress.findIndex((x) => x.recID == dataDelete.recID);
        if (index > -1) {
          this.lstAddress.splice(index, 1);
          this.detectorRef.detectChanges();
        }
      }
    });
  }

  tabChange(event:any){
    if(event?.nextId.toLowerCase() === 'location' && this.form.form.data.isEdit && this.lstAddress.length == 0){
      let options = new DataRequest();
      options.entityName = 'BS_AddressBook';
      options.pageLoading = false;
      options.predicates = 'ObjectID=@0 and ObjectType=@1';
      options.dataValues = `${this.form.form.data.vendorID};2`;
      this.api
        .execSv('BS', 'Core', 'DataBusiness', 'LoadDataAsync', options).subscribe((res: any) => {
          this.lstAddress = res[0];
          this.detectorRef.detectChanges();
        })
    }

    if(event?.nextId.toLowerCase() === 'contact' && this.form.form.data.isEdit && this.lstContact.length == 0){
      let options = new DataRequest();
      options.entityName = 'BS_Contacts';
      options.pageLoading = false;
      options.predicates = 'ObjectID=@0 and ObjectType=@1';
      options.dataValues = `${this.form.form.data.vendorID};2`;
      this.api
        .execSv('BS', 'Core', 'DataBusiness', 'LoadDataAsync', options).subscribe((res: any) => {
          this.lstContact = res[0];
          this.detectorRef.detectChanges();
        })
    }

    if(event?.nextId.toLowerCase() === 'banking-account' && this.form.form.data.isEdit && this.lstBank.length == 0){
      let options = new DataRequest();
      options.entityName = 'BS_BankAccounts';
      options.pageLoading = false;
      options.predicates = 'ObjectID=@0 and ObjectType=@1';
      options.dataValues = `${this.form.form.data.vendorID};2`;
      this.api
        .execSv('BS', 'Core', 'DataBusiness', 'LoadDataAsync', options).subscribe((res: any) => {
          this.lstBank = res[0];
          this.detectorRef.detectChanges();
        })
    }
  }

  //#endregion

  //#region CRUD
  onSave() {
    this.form.form.save((opt: RequestOption) => {
      opt.methodName = (this.form.data.isAdd || this.form.data.isCopy) ? 'SaveAsync' : 'UpdateAsync';
      opt.className = 'VendorsBusiness';
      opt.assemblyName = 'PS';
      opt.service = 'PS';
      opt.data = [this.form.form.data,this.lstAddress,this.lstContact,this.lstBank,];
      return true;
    }, 0, '', '', false).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (!res) return;
      if (res.hasOwnProperty('save')) {
        if (res.save.hasOwnProperty('data') && !res.save.data) return;
      }
      if (res.hasOwnProperty('update')) {
        if (res.update.hasOwnProperty('data') && !res.update.data) return;
      }
      if (this.form.form.data.isAdd || this.form.form.data.isCopy)
        this.notification.notifyCode('SYS006');
      else
        this.notification.notifyCode('SYS007');
      this.dialog.close();
    })
  }
  //#endregion
}
