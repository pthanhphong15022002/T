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
  CRUDService,
  CacheService,
  CallFuncService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxInputComponent,
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
import { Subject, takeUntil } from 'rxjs';
import { ContactAddComponent } from '../../customers-categories/contact-add/contact-add.component';

@Component({
  selector: 'lib-pop-add-warehouses',
  templateUrl: './warehouses-add.component.html',
  styleUrls: ['./warehouses-add.component.css','../../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehousesAddComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: LayoutAddComponent;
  headerText: any;
  dialog!: DialogRef;
  dialogData?: DialogData
  dataDefault: any;
  funcName:any;
  contactService: CRUDService;
  fmContact: FormModel = {
    formName: 'Contacts',
    gridViewName: 'grvContacts',
    entityName: 'BS_Contacts',
  }
  lstContact: any = [];
  lblAdd:any;
  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'Description',
    },
    {
      icon: 'icon-settings icon-20 me-3',
      text: 'Thiết lập',
      name: 'Establish',
    },
    {
      icon: 'icon-directions_bus',
      text: 'Hoạch định',
      name: 'Plan',
    },
    { icon: 'icon-person_pin', text: 'Người liên hệ', name: 'contact' },
  ];
  private destroy$ =  new Subject<void>();
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    private acService: CodxAcService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.funcName = dialogData.data?.funcName;
    this.dataDefault = {...dialogData?.data?.dataDefault};
    this.dialogData = {...dialogData};

    this.contactService = this.acService.createCRUDService(
      inject,
      this.fmContact,
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
    (this.form.form as CodxFormComponent).onAfterInit.subscribe((res:any)=>{
      if(res){
        this.setValidateForm();
      }
    })
  }
  //#endregion

  //#region Event
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
  //#endregion

  //#region Function
  setTitle() {
    this.headerText = this.dialogData?.data?.headerText;
    this.detectorRef.detectChanges();
  }

   /**
   * *Hàm thay đổi validate form
   */
   setValidateForm(){
    let rWarehouseID = true;
    let lsRequire :any = [];
    if(this.form.data?._keyAuto == 'WarehouseID') rWarehouseID = false; //? thiết lập không require khi dùng đánh số tự động tài khoản
    lsRequire.push({field : 'WarehouseID',isDisable : false,require:rWarehouseID});
    (this.form.form as CodxFormComponent).setRequire(lsRequire);
  }

  tabChange(event:any){
    if(event?.nextId.toLowerCase() === 'contact' && this.form.form.data.isEdit && this.lstContact.length == 0){
      let options = new DataRequest();
      options.entityName = 'BS_Contacts';
      options.pageLoading = false;
      options.predicates = 'ObjectID=@0 and ObjectType=@1';
      options.dataValues = `${this.form.form.data.warehouseID};6`;
      this.api
        .execSv('BS', 'Core', 'DataBusiness', 'LoadDataAsync', options).subscribe((res: any) => {
          this.lstContact = res[0];
          this.detectorRef.detectChanges();
        })
    }
  }
  //#endregion

  //#region CRUD
  onSave() {
    this.form.form.save((opt: RequestOption) => {
      opt.methodName = (this.form.data.isAdd || this.form.data.isCopy) ? 'SaveAsync' : 'UpdateAsync';
      opt.className = 'WarehousesBusiness';
      opt.assemblyName = 'IV';
      opt.service = 'IV';
      opt.data = [this.form.form.data,[],this.lstContact,[]];
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
