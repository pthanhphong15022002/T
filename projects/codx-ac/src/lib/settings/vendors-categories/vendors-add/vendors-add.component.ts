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
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  LayoutAddComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { Vendors } from '../../../models/Vendors.model';
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
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-settings icon-20 me-3', text: 'Thiết lập', name: 'Establish' },
    { icon: 'icon-directions_bus', text: 'Thông tin giao hàng', name: 'Shipment Details' },
    { icon: 'icon-location_on', text: 'Danh sách địa chỉ', name: 'Location' },
    { icon: 'icon-person_pin', text: 'Người liên hệ', name: 'Contact' },
    { icon: 'icon-i-credit-card-2-back', text: 'Tài khoản ngân hàng', name: 'Banking Account' },
    { icon: 'icon-20 me-2 icon-tune', text: 'Thông tin khác', name: 'Other Infomation' }
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

    if (this.dataDefault.isEdit) {
      this.api.exec('BS', 'BSBusiness', 'LoadDataAsync', [this.dataDefault.customerID, "1"]).subscribe((res: any) => {
        this.lstAddress = res?.lstAddress || [];
        this.lstContact = res?.lstcontact || [];
        this.lstBank = res?.lstBank || [];
      })
    }
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
    if (this.form.form.data?._keyAuto == 'CustomerID') rCustomerID = false;
    lsRequire.push({ field: 'CustomerID', isDisable: false, require: rCustomerID });
    this.form.form.setRequire(lsRequire);
  }

  openFormBank() {
    let data = {
      headerText: (this.lblAdd + ' ' + 'tài khoản ngân hàng').toUpperCase(),
      lstBank: this.lstBank,
      dataDefault: null,
    };
    let option = new DialogModel();
    option.FormModel = this.fmBank;
    option.DataService = this.bankService;
    this.bankService.addNew().subscribe((res: any) => {
      if (res) {
        data.dataDefault = { ...res };
        this.cache.gridViewSetup(this.fmBank.formName,this.fmBank.gridViewName).subscribe((o)=>{
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
              this.lstBank.push({...res?.event?.bank});
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  openFormContact() {
    let data = {
      headerText: (this.lblAdd + ' ' + 'người liên hệ').toUpperCase(),
      lstContact: [...this.lstContact],
      dataDefault: null,
    };
    let option = new DialogModel();
    option.FormModel = this.fmContact;
    option.DataService = this.contactService;
    this.contactService.addNew().subscribe((res: any) => {
      if (res) {
        data.dataDefault = { ...res };
        this.cache.gridViewSetup(this.fmContact.formName,this.fmContact.gridViewName).subscribe((o)=>{
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
              this.lstContact.push({...res?.event?.contact});
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  openFormAddress() {
    let data = {
      headerText: (this.lblAdd + ' ' + 'địa chỉ').toUpperCase(),
      lstAddress: [...this.lstAddress],
      dataDefault: null,
    };
    let option = new DialogModel();
    option.FormModel = this.fmAddress;
    option.DataService = this.addressService;
    this.addressService.addNew().subscribe((res: any) => {
      if (res) {
        data.dataDefault = { ...res };
        this.cache.gridViewSetup(this.fmAddress.formName,this.fmAddress.gridViewName).subscribe((o)=>{
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
              this.lstAddress.push({...res?.event?.address});
              this.detectorRef.detectChanges();
            }
          })
        })
      }
    })
  }

  //#endregion

  //#region CRUD
  onSave() {
    this.form.form.setValue('customerID','0',{});
    this.form.form.save((o: RequestOption) => {
      o.service = 'PS';
      o.assemblyName = 'PS';
      o.className = 'VendorsBusiness';
      o.methodName = (this.form.form.data.isAdd || this.form.form.data.isCopy) ? 'SaveAsync' : 'UpdateAsync';
      o.data = [this.form.form.data,this.lstAddress,this.lstContact,this.lstBank];
      return true;
    }, 0, '', '', false)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(!res) return;
      if (res) {
        if (this.form.form.data.isAdd || this.form.form.data.isCopy) {
          this.dialog.dataService
            .add(this.form.form.data)
            .subscribe();
        }else{
          this.dialog.dataService.update({...this.form.form.data},true).subscribe();
          this.detectorRef.detectChanges();
        }
        this.dialog.close();
        if (this.form.data.isAdd || this.form.data.isCopy)
            this.notification.notifyCode('SYS006');
        else 
            this.notification.notifyCode('SYS007');
      }
    })
  }
  //#endregion
}
