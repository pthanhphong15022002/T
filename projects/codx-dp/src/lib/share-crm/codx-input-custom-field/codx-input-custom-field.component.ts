import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogModel,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { PopupQuickaddContactComponent } from 'projects/codx-cm/src/lib/cmcustomer/cmcustomer-detail/codx-list-contacts/popup-quickadd-contact/popup-quickadd-contact.component';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { PopupAddLineTableComponent } from './popup-add-line-table/popup-add-line-table.component';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { PopupSelectFieldReferenceComponent } from './popup-select-field-reference/popup-select-field-reference.component';
import moment from 'moment';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'codx-input-custom-field',
  templateUrl: './codx-input-custom-field.component.html',
  styleUrls: ['./codx-input-custom-field.component.css'],
})
export class CodxInputCustomFieldComponent implements OnInit {
  @Input() customField: any = null;
  @Input() isAdd = false; //la add new
  @Input() showTitle = true; // show Title hoặc "gia trị măc định"
  @Input() objectId: any = ''; //objectId của file
  @Input() objectType: any = ''; // object Type của file
  @Input() checkValid = true; //check Validate khi add, edit

  @Input() formModel: any = null;
  @Input() disable = false;
  @Input() viewFieldName = false; //hiện field name bên cạnh title
  @Input() objectIdParent: any = ''; //recID của model cha
  @Input() customerID: string = ''; //Khách hàng cơ hội

  @Input() isDataTable = false; //là data của Table
  @Input() isRezisePopup = false; //resize popup
  @Input() widthRezise = '1000'; //resize width popup
  @Input() refVersion = ''; //là recID của form Task
  @Input() refInstance = ''; //'63484925-9f24-11ee-a457-c025a5a4cd5d'; //'63484925-9f24-11ee-a457-c025a5a4cd5d'; //tesst; //là recID của Instance liên quan
  @Input() refStepID = ''; //là recID của step Ins liên quan
  @Input() dataSourceRef: any; //data load để ref
  @Input() isLoadDataRef = false;
  @Input() isDropRef = false; // chỉnh sửa vị trí field

  @Output() valueChangeCustom = new EventEmitter<any>();
  @Output() addFileCompleted = new EventEmitter<boolean>();
  @Output() rezisePopup = new EventEmitter<any>();
  @Output() dropDataFormatPA = new EventEmitter<any>();

  @ViewChild('attachment') attachment: AttachmentComponent;
  @ViewChild('comboxValue') comboxValue: ComboBoxComponent; ///value seclect 1
  @ViewChild('comboxValueMutilSelect')
  comboxValueMutilSelect: ComboBoxComponent;
  placeholderRole = 'Vai trò........';

  titleRadioYes = 'True';
  titleRadioNo = 'False';
  checkedRadio = true;

  moreDefaults = {
    share: true,
    write: true,
    read: true,
    download: true,
    delete: true,
  };
  dataRef = '';

  // @Input() readonly = false;

  addSuccess = true;
  errorMessage = '';
  showErrMess = false;
  //data tesst
  typeControl = 'text';
  currentRate = 0;
  hovered = 0;

  min = 0;
  max = 9999999;
  formatDate = 'd';
  allowMultiFile = '1';
  isPopupUserCbb = false;
  messCodeEmail = 'SYS037'; // Email ko hợp lê
  messCodePhoneNum = 'RS030';
  listIdUser: string = '';
  arrIdUser = [];
  numberChange = 0;
  listContacts = [];
  dataContact: any;
  formModelContact: FormModel;
  popoverCrr: any;
  moreFunctionSYS: any;
  moreFunctionDefault = [
    {
      id: 'edit',
      icon: 'icon-edit',
      text: 'Chỉnh sửa',
      textColor: '#307CD2',
    },
    {
      id: 'delete',
      icon: 'icon-delete',
      text: 'Xóa',
      textColor: '#F54E60',
    },
  ];
  //vll
  // serviceTemp = 'SYS';
  // assemblyNameTemp = 'SYS';
  // classNameTemp = 'ValueListBusiness';
  // methodTemp = 'GetVllCustomsByFormatAsync';
  // requestTemp = new DataRequest();
  datasVll: any[];
  user: any;
  fieldsVll = { text: 'textValue', value: 'value' };
  plancehoderVll: any;
  mutiSelectVll = false;
  crrValueVll = ''; //value mutilSelect
  columns = []; //array colum
  arrDataValue = [];
  modelJSON: string = '';
  settingWidth = false;
  settingCount = false;
  totalColumns = false;
  fieldCurrent = '';
  valueF = 'no';
  valueT = 'yes';
  dataValueCaculate = '';
  listFieldRef = []; //All field
  listFieldsSelect = []; //fields selectd
  isShowMore = false;
  //ref
  dataFormatRef = [];
  eventDropRef = true;
  valCheckBox = [];
  isChange = false;

  constructor(
    private cache: CacheService,
    private changeRef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private codxShareSv: CodxShareService,
    private api: ApiHttpService
  ) {
    this.cache.message('SYS028').subscribe((res) => {
      if (res) this.errorMessage = res.customName || res.defaultName;
    });
    this.cache.moreFunction('CoDXSystem', '').subscribe((mFuc: any) => {
      if (mFuc) {
        this.moreFunctionSYS = mFuc;
        let funcMF = 'SYS01';

        this.moreFunctionDefault.forEach((mf) => {
          if (mf.id == 'edit') funcMF = 'SYS03';
          if (mf.id == 'delete') funcMF = 'SYS02';
          let mfc = Array.from<any>(this.moreFunctionSYS).find(
            (x: any) => x.functionID === funcMF
          );
          if (mfc) {
            mf.text = mfc.customName;
          }
        });
      }
    });
  }

  ngOnInit(): void {
    //gia tri tung form
    if (this.refVersion && this.customField?.versions?.length > 0) {
      let idx = this.customField.versions.findIndex(
        (x) => x.refID == this.refVersion
      );
      if (idx != -1)
        this.customField.dataValue = this.customField.versions[idx].dataValue;
    }
    //gia tri mặc dinh khi them moi
    if (this.isAdd && !this.customField.dataValue) {
      if (this.customField.defaultValue) {
        this.customField.dataValue = this.customField.defaultValue;
      } else if (this.customField.dataType == 'D') {
        this.customField.dataValue = moment(new Date()).toDate();
      }
      this.isChange = true

    }

    //danh sach data chuyen qua - loai PA ra khoi format
    if (this.isLoadDataRef && this.dataSourceRef?.length > 0) {
      let data = this.dataSourceRef.find(
        (x) =>
          x.fieldName == this.customField.fieldName &&
          x.dataType == this.customField.dataType &&
          (x.dataFormat == this.customField.dataFormat || this.customField.dataType == 'PA') &&
          x.refValue == this.customField.refValue &&
          x.refType == this.customField.refType
      );
      if (data) {
        this.customField.dataValue = data.dataValue;
        this.isChange = true
      }
    }
    if (this.isChange)
      this.valueChangeCustom.emit({
        e: this.customField.dataValue,
        data: this.customField,
      });

    switch (this.customField.dataType) {
      case 'N':
        this.formatHaveE();
        break;
      case 'PA':
        this.viewFieldRef();
        break;
      case 'TA':
        this.getColumnTable(this.customField);
        break;
      case 'D':
        if (this.customField.dataFormat == '3') this.formatDate = 'd';
        if (
          this.customField.dataFormat == '1' ||
          this.customField.dataFormat == '2'
        )
          this.formatDate = 'F';
        if (
          this.customField.dataFormat == '4' ||
          this.customField.dataFormat == '5'
        )
          this.formatDate = 't';
        break;
      case 'P':
        this.listIdUser = this.customField?.dataValue ?? '';
        this.arrIdUser = this.listIdUser ? this.listIdUser.split(';') : [];
        break;
      case 'A':
        this.allowMultiFile = this.customField.multiselect ? '1' : '0';
        break;
      case 'R':
        this.currentRate = this.customField.dataValue
          ? Number.parseInt(this.customField.dataValue)
          : 0;
        break;
      case 'L':
        if (
          this.customField.dataFormat == 'V' ||
          this.customField.dataFormat == 'S'
        ) {
          this.loadDataVll();
          if (this.customField.dataFormat == 'S' && this.customField.dataValue)
            this.valCheckBox = this.customField.dataValue.split(';');
        } else if (this.customField.dataFormat == 'B') {
          this.cache.valueList('DP0272').subscribe((res) => {
            if (res) {
              let values = res.datas;
              let idx = values.findIndex((x) => x.value == 'B');
              if (idx != -1) {
                let arr = values[idx].text.split('/');
                if (arr?.length > 1) {
                  this.titleRadioYes = arr[1];
                  this.titleRadioNo = arr[0];
                }
                this.checkedRadio =
                  this.customField.dataValue == '1' ? true : false;
              }
            }
          });
        }

        break;
      case 'C':
        this.formModelContact = new FormModel();
        this.formModelContact.formName = 'CMContacts';
        this.formModelContact.gridViewName = 'grvCMContacts';
        this.formModelContact.entityName = 'CM_Contacts';
        this.formModelContact.funcID = 'CM0102';
        this.cache
          .gridViewSetup(
            this.formModelContact.formName,
            this.formModelContact.gridViewName
          )
          .subscribe((res) => {
            this.placeholderRole =
              res?.Role?.headerText ?? this.placeholderRole;
          });

        let arrValue = '';
        if (this.customField.dataValue)
          arrValue = JSON.parse(this.customField.dataValue);
        this.listContacts = Array.isArray(arrValue) ? arrValue : [];
        this.codxShareSv.listContactBehavior.subscribe((element) => {
          if (element != null) {
            var contact = element?.data;
            var type = element?.type;
            if (this.listContacts != null && this.listContacts.length > 0) {
              var index = this.listContacts.findIndex(
                (x) => x.recID == contact?.recID
              );
              if (index != -1) {
                if (type != 'delete') {
                  this.listContacts[index] = contact;
                } else {
                  this.listContacts.splice(index, 1);
                }
              } else {
                if (type == 'addAndSave') {
                  this.listContacts.push(contact);
                }
              }

              let idxDefault = -1;
              if (contact?.isDefault) {
                idxDefault = this.listContacts.findIndex(
                  (x) => x.isDefault && x.recID != contact.recID
                );
              }
              if (idxDefault != -1 && type != 'delete') {
                this.listContacts[idxDefault].isDefault = false;
              }
            } else {
              if (type == 'addAndSave') this.listContacts.push(contact);
            }
            this.listContacts = JSON.parse(JSON.stringify(this.listContacts));
            this.valueChangeCustom.emit({
              e: JSON.stringify(this.listContacts),
              data: this.customField,
              result: contact,
              type: type,
            });
            this.codxShareSv.listContactBehavior.next(null);
          }
        });
        break;
      case 'AT':
        // if (this.customField.dataValue || !this.isAdd) return;
        if (this.customField.dataValue) return;
        this.getAutoNumberSetting();
        break;
      case 'CF':
        if (
          this.customField.dataValue &&
          !this.isExitOperator(this.customField.dataValue)
        )
          this.dataValueCaculate = this.customField.dataValue;
        break;
    }
  }

  valueChange(e) {
    let checkNull = !e || !e.data || e.data.toString().trim() == '';
    // if (this.checkValid) {
    if (this.customField.isRequired && checkNull) {
      this.cache.message('SYS028').subscribe((res) => {
        if (res) this.errorMessage = res.customName || res.defaultName;
        this.showErrMess = true;
      });
      if (!this.checkValid) return;
    } else this.showErrMess = false;
    // } else this.showErrMess = false;

    switch (this.customField.dataType) {
      case 'T':
        if (this.customField.dataFormat == 'E') {
          let email = e.data;
          var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
          if (!email.toLocaleLowerCase().match(mailformat)) {
            this.cache.message(this.messCodeEmail).subscribe((res) => {
              if (res) {
                this.errorMessage = res.customName || res.defaultName;
              }
              this.showErrMess = true;
              this.changeRef.detectChanges();
            });

            if (!this.checkValid) return;
          } else this.showErrMess = false;
        }
        //format so dien thoai
        if (this.customField.dataFormat == 'P') {
          let phone = e.data;
          var phonenumberFormat =
            /(((09|03|07|08|05)+([0-9]{8})|(01+([0-9]{9})))\b)/;
          if (!phone.toLocaleLowerCase().match(phonenumberFormat)) {
            this.cache.message(this.messCodePhoneNum).subscribe((res) => {
              if (res) {
                this.errorMessage = res.customName || res.defaultName;
              }
              this.showErrMess = true;
              this.changeRef.detectChanges();
            });

            if (!this.checkValid) return;
          } else this.showErrMess = false;
        }
        break;
      case 'N':
        // let idxE = e.data?.toString().toLowerCase().indexOf('e');
        // if (idxE != -1) {
        //   this.notiService.notify(
        //     'Số nhập vào quá lớn sẽ lưu giá trị gần đúng !',
        //     '3'
        //   );
        // }
        break;
    }

    this.valueChangeCustom.emit({ e: e.data, data: this.customField });
  }
  //combox user
  openUserPopup() {
    this.isPopupUserCbb = true;
  }

  valueCbxUserChange(e) {
    if (this.isPopupUserCbb) this.isPopupUserCbb = false;
    if (e && e.id) {
      if (!this.listIdUser || this.customField.dataFormat == '1')
        this.listIdUser = e.id;
      else this.listIdUser += ';' + e.id;
      this.arrIdUser = Array.from(
        new Set(this.listIdUser ? this.listIdUser.split(';') : [])
      );
    }
    this.valueChangeCustom.emit({ e: this.listIdUser, data: this.customField });
  }

  deleteUser(id) {
    let index = this.arrIdUser.indexOf(id);
    if (index > -1) {
      this.arrIdUser.splice(index, 1);
      if (this.arrIdUser?.length > 0)
        this.listIdUser = this.arrIdUser.join(';');
      else this.listIdUser = '';
    }
    this.valueChangeCustom.emit({ e: this.listIdUser, data: this.customField });
  }

  valueChangeTime(e) {
    if (this.customField.dataValue && this.numberChange == 0) {
      this.numberChange = 1;
      return;
    }
    let checkNull = !e || !e.data;
    if (this.customField.isRequired && checkNull) {
      this.cache.message('SYS028').subscribe((res) => {
        if (res) this.errorMessage = res.customName || res.defaultName;
        this.showErrMess = true;
      });
      if (!this.checkValid) return;
    } else this.showErrMess = false;

    this.valueChangeCustom.emit({
      e: e?.data?.fromDate,
      data: this.customField,
    });
  }

  addFile() {
    this.addSuccess = false;
    this.addFileCompleted.emit(this.addSuccess);
    this.attachment.uploadFile();
  }
  fileAdded(e) { }
  getfileCount(e) { }

  fileSave(e) {
    let result = '';
    if (e && typeof e === 'object') {
      var filed = Array.isArray(e) ? e[0].data : e;
      result = filed?.objectID + ';' + filed?.objectType;
    }
    this.addSuccess = true;
    this.valueChangeCustom.emit({ e: result, data: this.customField });
    this.addFileCompleted.emit(this.addSuccess);
  }
  rateChange(e) {
    this.valueChangeCustom.emit({
      e: e,
      data: this.customField,
    });
  }
  controlBlur(e) { }

  //Type Contact
  openContact() {
    let action = 'add';
    let data = null;
    let type = 'formAdd';
    let objectID = this.objectIdParent; //recID của co hoi
    let objectType = '4';
    let objectName = '';
    let customerID = this.customerID;
    var title = '';
    let opt = new DialogModel();

    let mfc = Array.from<any>(this.moreFunctionSYS).find(
      (x: any) => x.functionID === 'SYS01'
    );

    title = mfc?.customName ?? '';
    opt.FormModel = this.formModelContact;

    this.cache
      .gridViewSetup(
        this.formModelContact.formName,
        this.formModelContact.gridViewName
      )
      .subscribe((res) => {
        var obj = {
          moreFuncName: title,
          action: action,
          dataContact: data,
          type: type,
          recIDCm: objectID,
          objectType: objectType,
          objectName: objectName,
          gridViewSetup: res,
          listContacts: this.listContacts,
          customerID: customerID,
          isStep: true,
        };
        var dialog = this.callfc.openForm(
          PopupQuickaddContactComponent,
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
            if (e.event?.recID) {
              let contact = e.event;
              let idx = this.listContacts.findIndex(
                (x) => x.recID == contact?.recID
              );
              if (idx == -1) this.listContacts.push(contact);
              else this.listContacts[idx] = contact;
              // this.listContacts = JSON.parse(JSON.stringify(this.listContacts));
              this.valueChangeCustom.emit({
                e: JSON.stringify(this.listContacts),
                data: this.customField,
                result: contact,
              });
              this.changeRef.detectChanges();
            }
          }
        });
      });
  }

  updateRole(event: string, recID) {
    var index = -1;
    if (event == '' || event.trim() == '') {
      index = -1;
      return;
    }
    index = this.listContacts.findIndex((x) => x.recID == recID);
    if (index != -1) {
      this.listContacts[index]['role'] = event?.trim();
      this.valueChangeCustom.emit({
        e: JSON.stringify(this.listContacts),
        result: this.listContacts[index],
        data: this.customField,
      });
    }
  }

  openMoreFC(val: any, data: any) {
    switch (val.id) {
      case 'edit':
        this.editContact(val.text, data);
        break;
      case 'delete':
        this.deleteContact(data);
        break;
    }
  }

  editContact(title, data) {
    let action = 'edit';
    let type = 'formAdd';
    let objectID = data.objectID; //recID của co hoi
    let objectType = data?.objectType ?? '4';
    let objectName = data?.objectName ?? '';
    let customerID = data?.refID;

    let opt = new DialogModel();
    opt.FormModel = this.formModelContact;
    this.cache
      .gridViewSetup(
        this.formModelContact.formName,
        this.formModelContact.gridViewName
      )
      .subscribe((res) => {
        var obj = {
          moreFuncName: title,
          action: action,
          dataContact: data,
          type: type,
          recIDCm: objectID,
          objectType: objectType,
          objectName: objectName,
          gridViewSetup: res,
          listContacts: this.listContacts,
          customerID: customerID,
        };
        var dialog = this.callfc.openForm(
          PopupQuickaddContactComponent,
          '',
          500,
          700,
          '',
          obj,
          '',
          opt
        );
        dialog.closed.subscribe((e) => {
          if (e && e?.event) {
            if (e.event?.recID) {
              let contact = e.event;
              let idx = this.listContacts.findIndex(
                (x) => x.recID == contact?.recID
              );
              if (idx == -1) this.listContacts.push(contact);
              else this.listContacts[idx] = contact;
              // this.listContacts = JSON.parse(JSON.stringify( this.listContacts));
              this.valueChangeCustom.emit({
                e: JSON.stringify(this.listContacts),
                data: this.customField,
                result: contact,
              });
            }
          }
        });
      });
  }

  deleteContact(data) {
    let config = new AlertConfirmInputConfig();
    config.type = 'YesNo';
    //SYS030
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event.status == 'Y') {
        let index = this.listContacts.findIndex((x) => x.recID == data.recID);
        if (index != -1) {
          this.listContacts.splice(index, 1);
          this.listContacts = JSON.parse(JSON.stringify(this.listContacts));
          this.valueChangeCustom.emit({
            e: JSON.stringify(this.listContacts),
            data: this.customField,
            result: data,
            type: 'delete',
          });
        } else {
          this.valueChangeCustom.emit({
            e: JSON.stringify(this.listContacts),
            data: this.customField,
            result: null,
          });
        }
      }
    });
  }

  openPopper(contact, p) {
    if (this.popoverCrr && p != this.popoverCrr && this.popoverCrr.isOpen()) {
      this.popoverCrr.close();
      return;
    }
    this.dataContact = contact;
    p.open();
    this.popoverCrr = p;
  }
  closePopper(p) {
    p.close();
    this.popoverCrr = p;
  }
  //vll custorm
  loadDataVll() {
    this.api
      .execSv<any>('SYS', 'SYS', 'ValueListBusiness', 'GetAsync', [
        this.customField.refValue,
      ])
      .subscribe((vl) => {
        if (vl) {
          this.mutiSelectVll = vl?.multiSelect;
          this.plancehoderVll = vl?.note;
          var defaultValues = vl?.defaultValues?.split(';');
          if (!defaultValues || defaultValues?.length == 0) {
            this.datasVll = [];
            return;
          }
          if (vl.listType == 1) {
            this.datasVll = defaultValues.map((x) => {
              return {
                textValue: x,
                value: x,
              };
            });
          }
          //chua lam 2
        } else this.datasVll = [];

        if (vl?.multiSelect) {
          this.crrValueVll = this.customField.dataValue
            ? this.customField.dataValue?.split(';')
            : '';
          if (this.comboxValueMutilSelect)
            this.comboxValueMutilSelect.refresh();
        } else {
          if (this.comboxValue) this.comboxValue.refresh();
        }
      });
  }

  cbxChangeVll(value) {
    this.valueChangeCustom.emit({
      e: value,
      data: this.customField,
    });
  }
  cbxChangeVllMutilSelect(value) {
    this.valueChangeCustom.emit({
      e: value?.length > 0 ? value.join(';') : '',
      data: this.customField,
    });
  }
  dataMutilSelect(dataValue) {
    if (!dataValue) return '';
    var value = dataValue.split(';');
    if (value?.length > 0) return value;
    return '';
  }

  valueChangeCbx(e) {
    this.valueChangeCustom.emit({
      e: e.data,
      data: this.customField,
    });
  }

  //--------------format table---------------//
  getColumnTable(data) {
    this.modelJSON = ''; //để fix edit
    if (!data.dataFormat) {
      this.columns = [];
      return;
    }
    let arr = JSON.parse(data.dataFormat);
    if (Array.isArray(arr)) {
      this.columns = arr;
      this.settingWidth = this.columns[0]?.settingWidth ?? false;
      this.settingCount = this.columns[0]?.settingCount ?? false;
      this.totalColumns = this.columns.findIndex((x) => x.totalColumns) != -1;
      this.columns.forEach((x) => {
        this.modelJSON += '"' + x.fieldName + '":"' + '",';
      });
      let format = this.modelJSON.substring(0, this.modelJSON.length - 1);
      this.modelJSON = '{' + format + '}';
    } else this.columns = [];

    if (!this.disable) {
      this.arrDataValue = [];
      if (data.dataValue) {
        let arrDataValue = JSON.parse(data.dataValue);
        if (Array.isArray(arrDataValue)) {
          this.arrDataValue = arrDataValue;
        }
      }
    }
    //tinh lại withd resize
    if (this.isRezisePopup) {
      let width = Util.getViewPort().width;
      let widthRez = Number.parseInt(this.widthRezise);
      if (widthRez && width < widthRez) this.widthRezise = width.toString();
    }
    this.changeRef.detectChanges();
  }

  formatViewTable(value) {
    let arrTable = [];
    if (this.columns?.length > 0) {
      this.columns.forEach((x) => {
        let object = Object.assign(x, {
          dataValue: value?.[x.fieldName],
        });
        arrTable.push(object);
      });
    }
    return arrTable;
  }

  //add
  clickAddLine() {
    let option = new DialogModel();
    option.FormModel = this.formModel;
    option.zIndex = 1050;
    let obj = {
      data: JSON.parse(this.modelJSON),
      action: 'add',
      titleAction: 'Thêm dòng',
      listColumns: this.columns,
    };
    let dialogColumn = this.callfc.openForm(
      PopupAddLineTableComponent,
      '',
      500,
      750,
      '',
      obj,
      '',
      option
    );
    dialogColumn.closed.subscribe((res) => {
      if (res && res.event) {
        this.arrDataValue.push(res.event);
        this.valueChangeCustom.emit({
          e: JSON.stringify(this.arrDataValue),
          data: this.customField,
        });
        this.columns = JSON.parse(this.customField.dataFormat);
        this.changeRef.detectChanges();
      }
    });
  }

  // edit
  updateLine(value, index) {
    let option = new DialogModel();
    option.FormModel = this.formModel;
    option.zIndex = 1050;
    let obj = {
      data: { ...JSON.parse(this.modelJSON), ...value },
      action: 'edit',
      titleAction: 'Chỉnh sửa',
      listColumns: this.columns,
    };
    let dialogColumn = this.callfc.openForm(
      PopupAddLineTableComponent,
      '',
      500,
      750,
      '',
      obj,
      '',
      option
    );
    dialogColumn.closed.subscribe((res) => {
      if (res && res.event) {
        this.arrDataValue[index] = res.event;
        this.valueChangeCustom.emit({
          e: JSON.stringify(this.arrDataValue),
          data: this.customField,
        });
        this.columns = JSON.parse(this.customField.dataFormat);
      }
    });
  }

  // deleted;
  removeLine(value, index) {
    this.notiService.alertCode('SYS030').subscribe((x) => {
      if (x.event && x.event.status == 'Y') {
        this.arrDataValue.splice(index, 1);
        this.valueChangeCustom.emit({
          e: JSON.stringify(this.arrDataValue),
          data: this.customField,
        });
        this.columns = JSON.parse(this.customField.dataFormat);
      }
    });
  }

  dropRow(event) {
    moveItemInArray(this.arrDataValue, event.previousIndex, event.currentIndex);
    this.valueChangeCustom.emit({
      e: JSON.stringify(this.arrDataValue),
      data: this.customField,
    });
  }
  //--------------end------------//

  //-------------RADIO-----------------//
  valueChangeRadio(e) {
    let value = '0';
    let check = this.checkedRadio;
    if (e) {
      let checked = e?.component?.checked;
      if (!checked) return;
      if (e.field == 'yes') {
        this.checkedRadio = true;
        value = '1';
      } else if (e.field == 'no') {
        this.checkedRadio = false;
        value = '0';
      }
    }
    //chua check vi sao
    if (check != this.checkedRadio) {
      this.customField.dataValue = this.valueChangeCustom.emit({
        e: value,
        data: this.customField,
      });
    }
  }

  //-----------------------------//

  //-------------CheckBox-----------------//
  valueChangeCheckBox(e, value) {
    // let value = [];
    // if (this.customField.dataValue)
    //   this.valCheckBox = this.customField.dataValue.split(';');
    if (e.checked) {
      if (this.mutiSelectVll) {
        // this.valCheckBox = this.valCheckBox.filter((x) => x != e.field);
        this.valCheckBox.push(value);
      } else this.valCheckBox = [value];
    } else {
      if (this.mutiSelectVll) {
        this.valCheckBox = this.valCheckBox.filter((x) => x != value);
      } else this.valCheckBox = [];
    }

    //dung core fail
    // if (e.data) {
    //   if (this.mutiSelectVll) {
    //     // this.valCheckBox = this.valCheckBox.filter((x) => x != e.field);
    //     this.valCheckBox.push(e.field);
    //   } else this.valCheckBox = [e.field];
    // } else {
    //   if (this.mutiSelectVll) {
    //     this.valCheckBox = this.valCheckBox.filter((x) => x != e.field);
    //   } else this.valCheckBox = [];
    // }

    let dtValue = '';
    if (this.valCheckBox?.length > 0) dtValue = this.valCheckBox.join(';');
    this.valueChangeCustom.emit({
      e: dtValue,
      data: this.customField,
    });
  }

  //-----------------------------------//

  //-------------AUTONUM-----------------//
  getAutoNumberSetting() {
    this.api
      .exec<any>(
        'ERM.Business.AD',
        'AutoNumbersBusiness',
        'CreateAutoNumberAsync',
        [
          this.isDataTable ? this.customField.recID : this.customField.refID,
          null,
          true,
          null,
        ]
      )
      .subscribe((autoNum) => {
        if (autoNum) {
          this.customField.dataValue = autoNum;
        }
      });
  }
  //-------------END-----------------//

  //----------------Tính toán---------------------//
  arrCheck = ['+', '-', 'x', '/', 'Avg(', '(', ')'];
  isExitOperator(string) {
    //var check = false;
    // this.arrCheck.forEach((op, idx) => {
    //   if (string.includes(op)) {
    //     check = true;
    //     if (idx == 0 && op == '-') {
    //       check = false;
    //     }
    //     if (check) return;
    //   }
    // });
    //return check;
    return string.includes('_');
  }

  //----------------------------------------------//

  //-------------- Data num co E ---------------//
  formatHaveE() {
    if (this.customField.dataValue) {
      let idxE = this.customField.dataValue?.toString().indexOf('E');
      if (idxE != -1) {
        let mu = this.customField.dataValue
          .toString()
          .substring(idxE + 2, this.customField.dataValue?.length);
        this.customField.dataValue =
          Number.parseFloat(
            this.customField.dataValue.toString().substring(0, idxE)
          ) * Math.pow(10, Number.parseInt(mu));
      }
    }
  }
  //-----------------------------------------------//

  //-----------------------------------------------//
  //-------------- Data tham chiếu -PA ------------//
  //-----------------------------------------------//
  valueChangeCbxPA(e) {
    // if (!e.data) {
    this.valueChangeCustom.emit({
      e: e.data,
      data: this.customField,
    });
  }

  viewFieldRef() {
    this.dataRef = '';
    this.dataFormatRef = JSON.parse(this.customField.dataFormat);
    if (Array.isArray(this.dataFormatRef) && this.dataFormatRef?.length > 0) {
      this.dataFormatRef.forEach((x) => {
        this.dataRef += x.fieldName + ', ';
      });
      this.dataRef = this.dataRef.substring(0, this.dataRef.length - 2);
    }
  }

  selectDataRef() {
    if (this.isLoadDataRef) {
      if (this.dataSourceRef?.length > 0) {
        let fields = [];
        this.dataSourceRef.forEach((f) => {
          if (!fields.some((x) => x.fieldName == f.fieldName) && f.dataValue) {
            if (
              (f.dataType == this.customField.dataType &&
                f.refType == this.customField.refType &&
                f.refValue == this.customField.refValue) ||
              (this.customField.dataType == 'N' && f.dataType == 'CF')
            ) {
              fields.push(f);
            }
          }
        });
        if (fields?.length > 0) {
          this.openPopupRef(fields);
        } else
          this.notiService.notify(
            'Không có data phù hợp với trường được chọn ! Vui lòng nhập giá trị của bạn !',
            '3'
          );
      } else
        this.notiService.notify(
          'Không có data tham chiếu phù hợp ! Vui lòng nhập giá trị của bạn !',
          '3'
        );
    } else if (this.refInstance) {
      this.api
        .exec<any>('DP', 'InstancesStepsBusiness', 'GetListFieldsAsync', [
          this.refInstance,
          this.refStepID,
          this.customField,
        ])
        .subscribe((fiels) => {
          if (fiels?.length > 0) {
            this.openPopupRef(fiels);
          } else
            this.notiService.notify(
              'Không có data tham chiếu phù hợp ! Vui lòng nhập giá trị của bạn !',
              '3'
            );
        });
    }
  }
  openPopupRef(fiels) {
    let dialogModel = new DialogModel();
    dialogModel.zIndex = 1200;
    let obj = {
      listField: fiels,
      field: this.customField,
    };
    let pop = this.callfc.openForm(
      PopupSelectFieldReferenceComponent,
      '',
      500,
      700,
      null,
      obj,
      null,
      dialogModel
    );

    pop.closed.subscribe((res) => {
      if (res?.event) {
        this.customField = res.event;
        this.valueChangeCustom.emit({
          e: this.customField.dataValue,
          data: this.customField,
        });
        if (this.customField.dataType == 'TA' && this.customField.dataValue)
          this.getColumnTable(this.customField);
        this.changeRef.detectChanges();
      }
    });
  }

  dropFieldPA(event: CdkDragDrop<string[]>) {
    //if (event.previousContainer === event.container) {
    moveItemInArray(
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    this.dropDataFormatPA.emit(event.container.data);
    // } else {
    //   transferArrayItem(
    //     event.previousContainer.data,
    //     event.container.data,
    //     event.previousIndex,
    //     event.currentIndex
    //   );
    // }
  }

  // loadDataRef() {
  //   if (this.refInstance) {
  //     this.api
  //       .exec<any>('DP', 'DPInstances', 'GetListFieldsAsync', [
  //         this.refInstance,
  //         this.refStepID,
  //         this.customField,
  //       ])
  //       .subscribe((res) => {
  //         if (res) this.listFieldRef = res;
  //       });
  //   }
  // }
  //----------------------------------------------//

  //rezisePopup --nếu có TA
  showMore() {
    this.isShowMore = !this.isShowMore;
    this.rezisePopup.emit(this.widthRezise);
  }
}
