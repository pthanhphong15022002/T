import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CacheService,
  CallFuncService,
  CodxComboboxComponent,
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  LayoutAddComponent,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { WareHouses } from '../../../models/WareHouses.model';
import { CodxAcService } from '../../../codx-ac.service';
import { Subject, takeUntil } from 'rxjs';
import { ContactAddComponent } from '../../customers-categories/contact-add/contact-add.component';

@Component({
  selector: 'lib-pop-add-warehouses',
  templateUrl: './pop-add-warehouses.component.html',
  styleUrls: ['./pop-add-warehouses.component.css'],
})
export class PopAddWarehousesComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: LayoutAddComponent;
  @ViewChild('provinceID') provinceID: CodxInputComponent;
  @ViewChild('districtID') districtID: CodxInputComponent;
  headerText: string;
  title: string;
  formModel: FormModel;
  dialog!: DialogRef;
  warehouses: WareHouses;
  objects: any;
  objectContact: Array<any> = [];
  objectContactDelete: Array<any> = [];
  valuelist: any;
  gridViewSetup: any;
  formType: any;
  moreFuncName: any;
  funcName: any;
  validate: any = 0;
  keyField: any = '';
  objecttype: string = '6';
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
    {
      icon: 'icon-person_pin',
      text: 'Liên hệ',
      name: 'Contact',
    },
  ];
  lblAdd: any;
  lblEdit: any;
  lblContacts: any;
  private destroy$ =  new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.warehouses = dialog.dataService!.dataSelected;
    this.formType = dialogData.data?.formType;
    this.keyField = dialog.dataService!.keyField;
    if (this.formType == 'edit') {
      if (this.warehouses.warehouseID != null) {
        this.api
          .exec('ERM.Business.BS', 'ContactBookBusiness', 'LoadDataAsync', [
            this.objecttype,
            this.warehouses.warehouseID,
          ])
          .subscribe((res: any) => {
            this.objectContact = res;
          });
      }
    }
    this.cache.valueList('AC015').subscribe((res) => {
      this.valuelist = res.datas;
    });
    this.cache.gridViewSetup('Warehouses', 'grvWarehouses').subscribe((res) => {
      if (res) {
        this.gridViewSetup = res;
      }
    });
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache.message('AC0033').subscribe((res) => {
      if (res) {
        this.lblAdd = res?.customName;
      }
    });

    this.cache.message('AC0034').subscribe((res) => {
      if (res) {
        this.lblEdit = res?.customName;
      }
    });
    this.cache.moreFunction('Contacts', 'grvContacts').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'ACS20501');
        if (m) {
          this.lblContacts = m.defaultName.toLowerCase();
        }
      }
    })
  }
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    (this.form.form as CodxFormComponent).onAfterInit.subscribe((res:any)=>{
      if(res){
        this.setValidateForm();
      }
    })
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
    this.warehouses[e.field] = e.data;
    switch (e.field) 
      {
        case 'countryID':
          if(this.provinceID)
          {
            (this.provinceID.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            this.provinceID.crrValue = null;
            this.warehouses.provinceID = null;
          }
          if(this.districtID)
          {
            (this.districtID.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            this.districtID.crrValue = null;
            this.warehouses.districtID = null;
          }
          this.form.formGroup.patchValue(this.warehouses);
          break;
        case 'provinceID':
          if(this.districtID)
          {
            (this.districtID.ComponentCurrent as CodxComboboxComponent).dataService.data = [];
            this.districtID.crrValue = null;
            this.warehouses.districtID = null;
          }
          this.form.formGroup.patchValue(this.warehouses);
          break;
      }
  }
  //#endregion

  //#region Function
  setTitle() {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  openPopupContact() {
    var obj = {
      headerText: this.lblAdd + ' ' + this.lblContacts,
      datacontact: this.objectContact,
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'ContactBook';
    dataModel.gridViewName = 'grvContactBook';
    dataModel.entityName = 'BS_ContactBook';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('ContactBook', 'grvContactBook')
      .subscribe((res) => {
        if (res) {
          var dialogcontact = this.callfc.openForm(
            ContactAddComponent,
            '',
            650,
            570,
            '',
            obj,
            '',
            opt
          );
          dialogcontact.closed.subscribe(() => {
            var datacontact = JSON.parse(
              localStorage.getItem('datacontact')
            );
            if (datacontact != null) {
              this.objectContact.push(datacontact);
            }
            window.localStorage.removeItem('datacontact');
          });
        }
      });
  }
  editobject(data: any) {
    let index = this.objectContact.findIndex(
      (x) => x.contactName == data.contactName && x.phone == data.phone
    );
    var ob = {
      headerText: this.lblEdit + ' ' + this.lblContacts,
      type: 'editContact',
      data: { ...data },
    };
    let opt = new DialogModel();
    let dataModel = new FormModel();
    dataModel.formName = 'ContactBook';
    dataModel.gridViewName = 'grvContactBook';
    dataModel.entityName = 'BS_ContactBook';
    opt.FormModel = dataModel;
    this.cache
      .gridViewSetup('ContactBook', 'grvContactBook')
      .subscribe((res) => {
        if (res) {
          var dialogcontact = this.callfc.openForm(
            ContactAddComponent,
            '',
            650,
            550,
            '',
            ob,
            '',
            opt
          );
          dialogcontact.closed.subscribe(() => {
            var datacontact = JSON.parse(localStorage.getItem('datacontact'));
            if (datacontact != null) {
              this.objectContact[index] = datacontact;
            }
            window.localStorage.removeItem('datacontact');
          });
        }
      });
  }
  deleteobject(data: any) {
    let index = this.objectContact.findIndex(
      (x) => x.reference == data.reference && x.recID == data.recID
    );
    this.objectContact.splice(index, 1);
    this.objectContactDelete.push(data);
  }
  checkValidate() {

    //Note
    let ignoredFields: string[] = [];
    if (this.keyField == 'WarehouseID') {
      ignoredFields.push(this.keyField);
    }
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    //End Note

    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.warehouses);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        if(ignoredFields.includes(keygrid[index].toLowerCase()))
        {
          continue;
        }
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.warehouses[keymodel[i]] == null ||
              String(this.warehouses[keymodel[i]]).match(/^ *$/) !== null
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }
  addObjects() {
    this.objects.transID = this.warehouses.recID;
    this.objects.objectID = this.warehouses.warehouseID;
    this.objects.objectName = this.warehouses.warehouseName;
    this.objects.objectName2 = this.warehouses.warehouseName2;
    this.objects.objectType = this.objecttype;
    this.objects.objectGroupID = this.warehouses.parentID;
    this.objects.address = this.warehouses.address;
    this.objects.countryID = this.warehouses.countryID;
    this.objects.provinceID = this.warehouses.provinceID;
    this.objects.districtID = this.warehouses.districtID;
    this.objects.status = '1';
    this.objects.note = this.warehouses.note;
    this.objects.stop = this.warehouses.stop;
    this.objects.createdOn = this.warehouses.createdOn;
    this.objects.createdBy = this.warehouses.createdBy;
    this.objects.modifiedOn = this.warehouses.modifiedOn;
    this.objects.modifiedBy = this.warehouses.modifiedBy;
    this.objects.buid = this.warehouses.buid;
    this.objects.postDetail = '0';
    this.objects.settleInvoice = '0';
  }
  //#endregion

  //#region CRUD
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.formType == 'add' || this.formType == 'copy') {
        this.updateWarehouseIDBeforeSave();
      }
      if (this.formType == 'edit') {
        (this.form.form as CodxFormComponent)
          .save((opt: RequestOption) => {
            opt.methodName = 'UpdateAsync';
            opt.className = 'WareHousesBusiness';
            opt.assemblyName = 'IV';
            opt.service = 'IV';
            opt.data = [this.warehouses];
            return true;
          },0, '', '', true,{allowCompare:false})
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => {
            if (res.save || res.update) {
              this.addObjects();
              this.api
                .exec(
                  'ERM.Business.BS',
                  'ContactBookBusiness',
                  'UpdateAsync',
                  [
                    this.objecttype,
                    this.warehouses.warehouseID,
                    this.objectContact,
                    this.objectContactDelete,
                  ]
                )
                .subscribe(() => {});
              this.api
                .exec('ERM.Business.AC', 'ObjectsBusiness', 'UpdateAsync', [
                  this.objects,
                ])
                .subscribe(() => {});
              this.dialog.close();
              this.dt.detectChanges();
            }
          });
      }
    }
  }

  updateWarehouseIDBeforeSave()
  {
    if(this.keyField == 'WarehouseID')
    {
      this.api.exec(
        'ERM.Business.AC',
        'ACBusiness',
        'GenerateAutoNumberAsync',
      )
      .subscribe((autoNumber: string) => {
        if(autoNumber)
        {
          this.warehouses.warehouseID = autoNumber;
          this.save();
        }
      });
    }
    else
    {
      this.save();
    }
  }

  save()
  {
    (this.form.form as CodxFormComponent)
    .save((opt: RequestOption) => {
      opt.methodName = 'AddAsync';
      opt.className = 'WareHousesBusiness';
      opt.assemblyName = 'IV';
      opt.service = 'IV';
      opt.data = [this.warehouses];
      return true;
    },0, '', '', true,{allowCompare:false})
    .pipe(takeUntil(this.destroy$))
    .subscribe((res) => {
      if (res.save) {
        this.addObjects();
        this.api
          .exec('ERM.Business.BS', 'ContactBookBusiness', 'AddAsync', [
            this.objecttype,
            this.warehouses.warehouseID,
            this.objectContact,
          ])
          .subscribe(() => {});
        this.objects.objectID = res.save.warehouseID;
        this.api
          .exec('ERM.Business.AC', 'ObjectsBusiness', 'AddAsync', [
            this.objects,
          ])
          .subscribe(() => {});
        this.dialog.close();
        this.dt.detectChanges();
      } else {
        this.notification.notifyCode(
          'SYS031',
          0,
          '"' + this.warehouses.warehouseID + '"'
        );
        return;
      }
    });
  }
  //#endregion

  //#region Function
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
  //#endregion Function
}
