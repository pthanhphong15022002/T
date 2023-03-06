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
  CodxFormComponent,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { PopAddContactComponent } from '../../customers/pop-add-contact/pop-add-contact.component';
import { Contact } from '../../models/Contact.model';
import { WareHouses } from '../../models/Warehouses.model';

@Component({
  selector: 'lib-pop-add-warehouses',
  templateUrl: './pop-add-warehouses.component.html',
  styleUrls: ['./pop-add-warehouses.component.css'],
})
export class PopAddWarehousesComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  headerText: string;
  title: string;
  formModel: FormModel;
  dialog!: DialogRef;
  warehouses: WareHouses;
  objectContact: Array<Contact> = [];
  objectContactDelete: Array<Contact> = [];
  valuelist: any;
  gridViewSetup: any;
  formType: any;
  validate: any = 0;
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
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.warehouses = dialog.dataService!.dataSelected;
    this.formType = dialogData.data?.formType;
    if (this.warehouses.warehouseID != null) {

      this.acService
        .loadData('ERM.Business.BS', 'ContactBookBusiness', 'LoadDataAsync', [
          this.objecttype,
          this.warehouses.warehouseID,
        ])
        .subscribe((res: any) => {
          this.objectContact = res;
        });
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
  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
    this.warehouses[e.field] = e.data;
  }
  //#endregion

  //#region Function
  setTitle(e: any) {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  openPopupContact() {
    var obj = {
      headerText: 'Thêm người liên hệ',
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
            PopAddContactComponent,
            '',
            650,
            570,
            '',
            obj,
            '',
            opt
          );
          dialogcontact.closed.subscribe((x) => {
            var datacontact = JSON.parse(localStorage.getItem('datacontact'));
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
      headerText: 'Chỉnh sửa liên hệ',
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
            PopAddContactComponent,
            '',
            650,
            550,
            '',
            ob,
            '',
            opt
          );
          dialogcontact.closed.subscribe((x) => {
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
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.warehouses);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.warehouses[keymodel[i]] == null ||
              this.warehouses[keymodel[i]] == ''
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
  //#endregion

  //#region CRUD
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.formType == 'add') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'AddAsync';
            opt.className = 'WareHousesBusiness';
            opt.assemblyName = 'IV';
            opt.service = 'IV';
            opt.data = [this.warehouses];
            return true;
          })
          .subscribe((res) => {
            if (res.save) {
              this.acService
                .addData('ERM.Business.BS', 'ContactBookBusiness', 'AddAsync', [
                  this.objecttype,
                  this.warehouses.warehouseID,
                  this.objectContact,
                ])
                .subscribe((res: []) => {});
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
      if (this.formType == 'edit') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'UpdateAsync';
            opt.className = 'WareHousesBusiness';
            opt.assemblyName = 'IV';
            opt.service = 'IV';
            opt.data = [this.warehouses];
            return true;
          })
          .subscribe((res) => {
            if (res.save || res.update) {
              this.acService
                .addData(
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
                .subscribe((res: []) => {});
              this.dialog.close();
              this.dt.detectChanges();
            }
          });
      }
    }
  }
  //#endregion
}
