import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  CodxInputComponent,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import { ColumnTable, DP_Condition_Reference_Fields, tempVllDP } from 'projects/codx-dp/src/lib/models/models';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';

import { PopupAddVllCustomComponent } from '../../popup-add-vll-custom/popup-add-vll-custom.component';
import { CodxDpService } from 'projects/codx-dp/src/lib/codx-dp.service';
import { PopupAddAutoNumberComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component';
import { PopupSettingReferenceComponent } from '../../popup-setting-reference/popup-setting-reference.component';
import { CodxInputCustomFieldComponent } from 'projects/codx-dp/src/lib/share-crm/codx-input-custom-field/codx-input-custom-field.component';
import { CodxFieldsFormatValueComponent } from 'projects/codx-dp/src/lib/share-crm/codx-input-custom-field/codx-fields-detail-temp/codx-fields-format-value/codx-fields-format-value.component';
import { PopupSettingConditionalComponent } from '../../popup-setting-conditional/popup-setting-conditional.component';

@Component({
  selector: 'lib-popup-add-column-table',
  templateUrl: './popup-add-column-table.component.html',
  styleUrls: ['./popup-add-column-table.component.css'],
})
export class PopupAddColumnTableComponent implements OnInit, AfterViewInit {
  @ViewChild('tempViewTable') tempViewTable: TemplateRef<any>;
  @ViewChild('datasVllCbx') datasVllCbx: ComboBoxComponent; //list cbx
  @ViewChild('comboxView') comboxView: ComboBoxComponent; ///cobx xem truoc ViewForm Field
  @ViewChild('valueListType') valueListType: CodxInputComponent;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('tempInput') tempInput: CodxInputCustomFieldComponent;
  @ViewChild('tempView') tempView: CodxFieldsFormatValueComponent;
  @ViewChild('selectValueDep') selectValueDep: ComboBoxComponent;


  column: ColumnTable;
  dialog: DialogRef;
  user: any;
  action = 'add';
  processNo: any;
  titleAction = 'Column ne';
  grvSetup: any;
  loaded: any = false; //data loaf VLL
  value: number = 5;
  min: number = 0;
  max: number = 10;
  step = '1';
  type: string = 'MinRange';
  format: string = 'n0';
  ticks: Object = {
    placement: 'Both',
    largeStep: 1,
    smallStep: 1,
    showSmallTicks: true,
  };
  tooltip: Object = { isVisible: true, placement: 'Before', showOn: 'Hover' };

  fieldsResource = { text: 'stepName', value: 'recID' };
  itemView = '';
  vllDynamic = 'DP0271';
  fileNameArr = [];
  refValueDataType = 'DP022_2';

  //vll dang DPF..
  listVllCus = [];

  listVll = [];
  fieldsVll = { text: 'text', value: 'value' };

  datasVll = [];
  fieldsResourceVll = { text: 'textValue', value: 'value' };
  crrValue = '';
  indexEdit = -1;
  showAddVll = true;

  titleForm = 'Value List'; //tesst
  dialogVll: DialogRef;
  formModelVll: FormModel = {
    formName: 'ValueList',
    gridViewName: 'grvValueList',
    entityName: 'SYS_ValueList',
  };
  listName: any;
  fomartVll = 'DPF'; //format

  serviceTemp = 'SYS';
  assemblyNameTemp = 'SYS';
  classNameTemp = 'ValueListBusiness';
  methodTemp = 'GetVllCustomsByFormatAsync';
  requestTemp = new DataRequest();
  crrVll: tempVllDP;
  crrDatasVll: any;
  // view Crr
  datasVllCrr = [];
  columnsCrrVll = { text: 'textValue', value: 'value' };
  crrValueFirst = '';
  element: any;
  isOpenPopup = false;

  idxEdit = -1;
  popover: any;
  idxDeleted = -1;
  maxNumber = 0;
  listColumns = [];
  isChecked = false;
  formModelColumn: FormModel;

  dialogAddColumn: DialogRef;
  disable = false;
  vllDateFormat: any;
  adAutoNumber: any;
  // Tính
  caculateField = '';
  arrFieldNum = [];
  showCaculate = true;
  viewOnly = false;
  entityNamePA: any;
  funcCBX: any;
  titleField: any;
  fieldCus: any;
  servicePA: any;
  //Conditional
  listCbx = [];
  fieldsDependence = { text: 'title', value: 'recID' };
  listValueField = [];
  valueDependence = { text: 'text', value: 'value' };

  dependence = {
    refID: '',
    strDependence: ''
  }
  valueRef: any;

  constructor(
    private changdef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private changeRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private dpService: CodxDpService,
    private authstore: AuthStore,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModelColumn = this.dialog.formModel;
    this.column = JSON.parse(JSON.stringify(dt?.data?.data));
    this.user = this.authstore.get();
    this.action = dt?.data?.action;
    this.disable = dt?.data?.disable;
    this.titleAction = dt?.data?.titleAction;
    this.grvSetup = dt?.data?.grvSetup;
    this.processNo = dt?.data?.processNo; //de sinh vll
    this.listColumns = dt?.data?.listColumns;
    this.showCaculate = this.action != 'edit';
    this.listCbx = this.listColumns.filter(x => x.refType == "3");
  }

  ngOnInit(): void {

    if (this.column?.dataType == 'L' && this.column?.dataFormat == 'V')
      this.loadDataVll();

    if (this.column?.dataType == 'CF') {
      this.selectFieldNum();
      this.caculateField = this.column?.dataFormat ?? '';
    }
  }
  ngAfterViewInit() {
    if (this.column?.isApplyDependences && this.listCbx?.length > 0) {
      let crrCbx = this.listCbx.find(x => x.dependences.includes(this.column.fieldName));
      if (crrCbx) {
        this.dependence.refID = crrCbx.recID;
        let arrField = crrCbx?.dependences?.split(",");
        let index = arrField.find(x => x.includes(this.column.fieldName));
        if (index) {
          // this.valueRef = index.split("=")[0]
          let valueRef = index.split("=")[1].slice(0, -1);
          this.valueRef = valueRef.slice(1)
          this.cache.combobox(crrCbx.refValue).subscribe(res => {
            if (res) {
              this.entityNamePA = res.tableName;
              this.listValueField = res.tableFields?.split(";").map((x, idx) => {
                let obj = {
                  text: x,
                  value: idx
                }
                return obj;
              })
              if (this.selectValueDep) {
                this.selectValueDep.dataSource = this.listValueField
                this.selectValueDep.value = Number.parseInt(this.valueRef)
                this.selectValueDep.refresh();
              }
            }
          })
        }
      }
    }
  }

  async valueChange(e) {
    if (e.field == 'multiselect' || e.field == 'columnWidth') {
      this.column[e.field] = e.data;
      this.isChecked = false;
      return;
    }
    if (e.field == 'dataType') {
      this.titleField = e?.component?.selectedItems[0]?.text;
    }

    if (e.field == 'dataType' && e.data != this.column.dataType) {
      this.column.refType = null;
      this.column.refValue = null;
      this.column.dataFormat = null;
      this.column.multiselect = false;
      this.fieldCus = null;
    }

    if (e && e.field) {
      this.column[e.field] = e?.data;
    }
    if (e.field == 'title' || e.field == 'fieldName') {
      this.removeAccents(e.data);
      this.changdef.detectChanges();
      return;
    }

    if (
      e.field == 'dataFormat' &&
      (e.data == 'V' || e.data == 'C' || e.data == 'S')
    ) {
      if (e.data == 'V' || e.data == 'S') this.loadDataVll();
      this.column.refType = e.data == 'C' ? '3' : '2';
      if (this.action != 'edit' && !this.column.refValue) {
      } else {
        this.crrVll = this.listVllCus.find(
          (x) => x.listName == this.column.refValue
        );
        // this.changeFormVll();
      }
    }
    if (e.field == 'refValue' && this.column.dataType == 'PA' && e.data) {
      this.column.refType = '3';
      this.cache.combobox(e.data).subscribe((cb) => {
        if (cb) {
          this.servicePA = cb?.service;
          this.entityNamePA = cb?.tableName;
          this.funcCBX = cb?.linkFunction;
        } else {
          this.servicePA = '';
          this.entityNamePA = '';
          this.funcCBX = '';
        }
      });
    }
    if (e.field == 'dataFormat' || e.field == 'refValue')
      this.creatFieldCustom();
    if (e.field == 'dataType' && e.data == 'CF') this.selectFieldNum();
    this.changdef.detectChanges();
  }

  creatFieldCustom() {
    if (
      (this.column.dataFormat &&
        (this.column.dataType == 'N' ||
          this.column.dataType == 'P' ||
          this.column.dataType == 'T')) ||
      ((this.column.dataType == 'L' || this.column.dataType == 'PA') &&
        this.column.refValue) ||
      (this.column.dataType == 'L' && this.column.dataFormat == 'B')
    ) {
      this.fieldCus = JSON.parse(
        JSON.stringify(
          Object.assign(this.column, {
            dataValue: this.column.defaultValue,
          })
        )
      );
    } else {
      this.fieldCus = null;
    }
  }

  changeRequired(e) {
    this.column.isRequired = e.data;
  }
  valueChangeIcon(e) {
    if (e && e?.data) this.column.rankIcon = e.data;
  }

  sliderChange(e) {
    this.column.rank = e?.value;
  }

  removeAccents(str) {
    if (!str) {
      this.column.fieldName = '';
      return;
    }
    var format = str
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
    format = format.replaceAll(' ', '_');

    while (format.includes('__')) {
      format = format.replaceAll('__', '_');
    }

    let isExit = this.listColumns.some(
      (x) => x.recID != this.column?.recID && x.fieldName == format
    );
    if (isExit) {
      this.notiService.notifyCode(
        'DP026',
        0,
        '"' + this.grvSetup['FieldName']?.headerText + '"'
      );
      return;
    }
    this.column.fieldName = format;
  }

  async clickAddVll() {
    // 'add vll'
    let action = !this.column.refValue ? 'add' : 'edit';
    if (!this.crrVll) {
      if (this.maxNumber > 0) {
        if (!this.crrValueFirst) {
          this.crrVll = new tempVllDP();
          this.crrVll.language = this.user.language;
          this.crrVll.createdBy = this.user.userID;
          this.crrVll.listType = '1'; //luu kieu nao de khanh tinh sau 2
          this.crrVll.version = 'x00.01';
        }
        if (!this.processNo) {
          this.processNo = await firstValueFrom(
            this.dpService.genAutoNumber('DP0204', 'DP_Processes', 'ProcessNo')
          );
        }
        this.crrVll.listName = 'DPF' + this.processNo + '-' + this.maxNumber;
      } else await this.getDefaultVll(500);
    }

    if (this.crrVll?.defaultValues) this.changeFormVll();
    else this.datasVll = [];

    let option = new DialogModel();
    option.FormModel = this.dialog.formModel;
    option.zIndex = 1099;

    let obj = {
      data: this.crrVll,
      datasVll: this.datasVll,
      action: action,
      isCheckBox: this.column.dataFormat == 'S',
    };
    let dialogVll = this.callfc.openForm(
      PopupAddVllCustomComponent,
      '',
      500,
      550,
      '',
      obj,
      '',
      option
    );
    dialogVll.closed.subscribe((res) => {
      if (res && res.event) {
        this.crrVll = JSON.parse(JSON.stringify(res.event));
        this.beforeSaveVll(this.crrVll);
        this.maxNumber = action == 'edit' ? this.maxNumber : this.maxNumber + 1;
      }
    });
  }

  closeDialog() { }

  getNameForm() {
    //tisnh sau
    return 'Value List';
  }

  saveVll() {
    if (!this.crrVll.note || this.crrVll.note.trim() == '') {
      this.notiService.notifyCode('CM049');
      return;
    }

    if (!this.datasVll || this.datasVll?.length == 0) {
      this.notiService.notifyCode('CM050');
      return;
    }

    // this.crrVll.listName = this.listName;
    // this.crrVll.listType = '1'; //luu kieu nao de khanh tinh sau 2
    // this.crrVll.version = 'x00.01';
    let vl = [];
    if (this.crrVll.listType == '1') {
      vl = this.datasVll.map((x) => {
        return x.textValue;
      });
    } else {
      this.datasVll.forEach((x) => {
        vl.push(x.value);
        vl.push(x.textValue);
      });
    }
    this.crrVll.defaultValues = this.crrVll.customValues = vl.join(';');

    var checkEdit = this.listVllCus.some(
      (x) => x.listName == this.crrVll.listName
    );

    let menthol = checkEdit
      ? 'EditValuelistCustomsAsync'
      : 'AddValuelistCustomsAsync';

    this.api
      .execSv('SYS', 'SYS', 'ValueListBusiness', menthol, this.crrVll)
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode(checkEdit ? 'SYS007' : 'SYS006');
          this.beforeSaveVll(this.crrVll);
          this.maxNumber = checkEdit ? this.maxNumber : this.maxNumber + 1;

          this.dialogVll.close();
        }
      });
  }

  async loadDataVll() {
    if (this.loaded) return;
    if (!this.processNo) {
      this.processNo = await firstValueFrom(
        this.dpService.genAutoNumber('DP0204', 'DP_Processes', 'ProcessNo')
      );
    }
    this.requestTemp.entityName = 'SYS_ValueList';
    this.requestTemp.predicate = 'Language=@0 && ListName.StartsWith(@1)';
    this.requestTemp.dataValue = this.user.language + ';DPF' + this.processNo;
    this.requestTemp.pageLoading = false; //load all

    this.fetch().subscribe((item) => {
      this.listVll = [];
      this.listVllCus = [];
      if (item && Array.isArray(item)) {
        this.listVllCus = item;
        this.listVllCus.forEach((x) => {
          if (x?.listName) {
            this.listVll.push({
              text: x?.note ?? x?.listName,
              value: x?.listName ?? '',
            });
          }
        });
      } else this.listVll = [];
      this.maxNumber = this.maxLength();

      if (this.datasVllCbx) this.datasVllCbx.refresh();
      this.changeRef.markForCheck();
      this.loaded = true;
    });
  }

  private fetch(): Observable<any[]> {
    return this.api
      .execSv<Array<any>>(
        this.serviceTemp,
        this.assemblyNameTemp,
        this.classNameTemp,
        this.methodTemp,
        this.requestTemp
      )
      .pipe(
        finalize(() => {
          /*  this.onScrolling = this.loading = false;
          this.loaded = true; */
        }),
        map((response: any) => {
          return response[0];
        })
      );
  }

  async cbxChangeVll(value) {
    this.column['refValue'] = value;
    if (!value) {
      // await this.getDefaultVll();
      this.crrVll = null;
      this.datasVll = [];
      //data crrVll
      this.datasVllCrr = [];
      this.crrValueFirst = null;
      if (this.comboxView) this.comboxView.refresh();
      return;
    }

    this.crrDatasVll = this.listVllCus.find((vl) => vl.listName == value);

    if (
      this.crrDatasVll &&
      this.crrDatasVll.listType == '1' &&
      this.crrDatasVll.defaultValues
    ) {
      this.crrVll = this.crrDatasVll;
      // this.changeFormVll();
      var arr = this.crrDatasVll.defaultValues.split(';');

      if (Array.isArray(arr) && arr?.length > 0) {
        this.datasVllCrr = arr.map((x) => {
          return {
            textValue: x,
            value: x,
          };
        });
        this.crrValueFirst = this.datasVllCrr[0].textValue;
      }
    }
  }

  beforeSaveVll(vll) {
    var idx = this.listVllCus.findIndex((x) => x.listName == vll.listName);
    if (idx == -1) {
      this.listVllCus.unshift(vll);
      this.listVll.unshift({
        text: vll?.note ?? vll?.listName,
        value: vll?.listName ?? '',
      });
    } else {
      this.listVllCus[idx] = vll;
      this.listVll[idx] = {
        text: vll?.note ?? vll?.listName,
        value: vll?.listName ?? '',
      };
      if (this.element) {
        this.element.itemData = this.listVll[idx];
        this.element.listData =
          this.element.selectData =
          this.element.sortedData =
          this.element.actionData.list =
          this.listVll;
      }
    }
    if (this.datasVllCbx) this.datasVllCbx.refresh();
    this.form.formGroup.patchValue(this.column);
    this.changeRef.detectChanges();
  }

  changeFormVll() {
    var arr = this.crrVll.defaultValues.split(';');
    if (Array.isArray(arr) && arr?.length > 0) {
      if ((this.crrVll.listType = '1')) {
        this.datasVll = arr.map((x, index) => {
          return {
            textValue: x,
            value: index,
          };
        });
      }
    }
  }

  handelTextValue(i) {
    this.idxEdit = i;
    this.changeRef.detectChanges();
  }

  showPopoverDeleted(p, i) {
    this.idxDeleted = i;
    if (this.popover && this.popover.isOpen()) this.popover.close();
    p.open();
    this.popover = p;
  }

  clickDeletedVll() {
    this.notiService.alertCode('SYS030').subscribe((res) => {
      if (res?.event && res?.event?.status == 'Y') {
        this.api
          .execSv(
            'SYS',
            'SYS',
            'ValueListBusiness',
            'DeletedValuelistCustomsAsync',
            this.crrVll.listName
          )
          .subscribe((res) => {
            if (res) {
              var idxDeleted = this.listVll.findIndex(
                (x) => x.value == this.crrVll.listName
              );
              if (idxDeleted != -1) {
                this.listVll.splice(idxDeleted, 1);
                //data crrVll
              }
              this.column.refValue = '';
              this.datasVllCrr = [];
              this.crrValueFirst = null;
              this.crrVll = null;
              if (this.comboxView) this.comboxView.refresh();
              if (this.datasVllCbx) this.comboxView.refresh();
              this.notiService.notifyCode('SYS008');
            } else this.notiService.notifyCode('SYS022');
          });
      }
    });
  }

  maxLength() {
    if (this.listVll?.length > 0) {
      let maxLength = this.listVll.sort((a, b) => {
        let numA =
          a.value.lastIndexOf('-') != -1
            ? a.value.substring(a.value.lastIndexOf('-') + 1)
            : 0;
        let numB =
          b.value.lastIndexOf('-') != -1
            ? b.value.substring(b.value.lastIndexOf('-') + 1)
            : 0;
        return Number.parseInt(numA) - Number.parseInt(numB);
      });

      let max = maxLength[maxLength.length - 1];
      let maxNum =
        max.value.lastIndexOf('-') != -1
          ? Number.parseInt(max.value.substring(max.value.lastIndexOf('-') + 1))
          : 0;
      return typeof maxNum == 'number' ? maxNum + 1 : this.listVll.length;
    } else return 0;
  }

  async getDefaultVll(timeOut = 500) {
    setTimeout(async () => {
      if (!this.crrValueFirst) {
        this.crrVll = new tempVllDP();
        this.crrVll.language = this.user.language;
        this.crrVll.createdBy = this.user.userID;
        this.crrVll.listType = '1'; //luu kieu nao de khanh tinh sau 2
        this.crrVll.version = 'x00.01';
      }

      if (this.loaded) {
        if (!this.processNo)
          this.processNo = await firstValueFrom(
            this.dpService.genAutoNumber('DP0204', 'DP_Processes', 'ProcessNo')
          );

        this.crrVll.listName = 'DPF' + this.processNo + '-' + this.maxNumber;
      } else {
        timeOut += 500;
        this.getDefaultVll(timeOut);
      }
    }, timeOut);
  }

  checkValidate() {
    if (
      (!this.column.title || this.column.title.trim() == '') &&
      this.grvSetup['Title']?.isRequire
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['Title']?.headerText + '"'
      );
      return false;
    }
    if (
      (!this.column.fieldName || this.column.fieldName.trim() == '') &&
      this.grvSetup['FieldName']?.isRequire
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['FieldName']?.headerText + '"'
      );
      return false;
    }
    if (this.fileNameArr.length > 0) {
      let check = this.fileNameArr.some(
        (x) =>
          x.field.toLowerCase() == this.column?.fieldName?.toLowerCase() &&
          x.recID != this.column.recID
      );
      if (check) {
        this.notiService.notifyCode(
          'DP026',
          0,
          '"' + this.grvSetup['FieldName']?.headerText + '"'
        );
        return false;
      }
    }
    if (!this.column.dataType && this.grvSetup['DataType']?.isRequire) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['DataType']?.headerText + '"'
      );
      return false;
    }
    if (
      !this.column.dataFormat &&
      this.column.dataType != 'R' &&
      this.column.dataType != 'A' &&
      this.column.dataType != 'C'
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['DataFormat']?.headerText + '"'
      );
      return false;
    }

    // if (
    //   this.column.dataType == 'L' &&
    //   this.column.dataFormat != 'B' &&
    //   !this.column.refType
    // ) {
    //   this.notiService.notifyCode(
    //     'SYS009',
    //     0,
    //     '"' + this.grvSetup['RefType']?.headerText + '"'
    //   );
    //   return false;
    // }

    if (
      this.column.dataType == 'L' &&
      this.column.dataFormat != 'B' &&
      !this.column.refValue
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['RefValue']?.headerText + '"'
      );
      return false;
    }

    if (
      (this.column.note == null || this.column.note.trim() == '') &&
      this.grvSetup['Note']?.isRequire
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['Note']?.headerText + '"'
      );
      return false;
    }
    if (!this.column.rankIcon && this.column.dataType == 'R') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['RankIcon']?.headerText + '"'
      );
      return false;
    }

    return true;
  }

  saveColumn() {
    if (this.column.dataType == 'CF') {
      if (this.checkCaculateField())
        this.column.dataFormat = this.caculateField;
      else return;
    }

    if (!this.checkValidate()) return;
    this.dialog.close([this.column, this.processNo]);
  }

  async openAutoNumPopup() {
    this.getVllFormat();
    let obj = {};
    if (!this.column.dataFormat) {
      //save new autoNumber
      obj = {
        autoNoCode: this.column.recID,
        description: 'DP_Instances_Steps_Field',
        newAutoNoCode: this.column.recID,
        isSaveNew: '1',
      };
    } else {
      //cap nhật
      obj = {
        autoNoCode: this.column.recID,
        description: 'DP_Instances_Steps_Field',
      };
    }
    let op = new DialogModel();
    op.IsFull = true;
    let popupAutoNum = this.callfc.openForm(
      PopupAddAutoNumberComponent,
      '',
      0,
      0,
      '',
      obj,
      '',
      op
    );
    popupAutoNum.closed.subscribe((res) => {
      if (res?.event) {
        this.setViewAutoNumber(res?.event);
      }
    });
  }

  setViewAutoNumber(data) {
    if (this.vllDateFormat?.datas.length > 0) {
      let dateFormat = '';
      if (data?.dateFormat != '0') {
        dateFormat =
          this.vllDateFormat.datas.filter((p) => p.value == data?.dateFormat)[0]
            ?.text ?? '';
      }

      let lengthNumber;
      let strNumber = '';
      let fieldNoAutoEx = data?.fixedString + data?.separator + dateFormat;
      lengthNumber = data?.maxLength - fieldNoAutoEx.length;
      strNumber = '#'.repeat(lengthNumber);
      switch (data?.stringFormat) {
        // {value: '0', text: 'Chuỗi & Ngày - Số', default: 'Chuỗi & Ngày - Số', color: null, textColor: null, …}
        case '0': {
          fieldNoAutoEx =
            data?.fixedString + dateFormat + data?.separator + strNumber;
          break;
        }
        // {value: '1', text: 'Chuỗi & Số - Ngày', default: 'Chuỗi & Số - Ngày', color: null, textColor: null, …}
        case '1': {
          fieldNoAutoEx =
            data?.fixedString + strNumber + data?.separator + dateFormat;
          break;
        }
        // {value: '2', text: 'Số - Chuỗi & Ngày', default: 'Số - Chuỗi & Ngày', color: null, textColor: null, …}
        case '2':
          fieldNoAutoEx =
            strNumber + data?.separator + data?.fixedString + dateFormat;
          break;
        // {value: '3', text: 'Số - Ngày & Chuỗi', default: 'Số - Ngày & Chuỗi', color: null, textColor: null, …}
        case '3':
          fieldNoAutoEx =
            strNumber + data?.separator + dateFormat + data?.fixedString;
          break;

        // {value: '4', text: 'Ngày - Số & Chuỗi', default: 'Ngày - Số & Chuỗi', color: null, textColor: null, …}
        case '4': {
          fieldNoAutoEx =
            dateFormat + data?.separator + strNumber + data?.fixedString;
          break;
        }
        // {value: '5', text: 'Ngày & Chuỗi & Số', default: 'Ngày & Chuỗi & Số', color: null, textColor: null, …}
        case '5': {
          fieldNoAutoEx = data?.fixedString + dateFormat;
          lengthNumber = data?.maxLength - fieldNoAutoEx.length;
          strNumber = '#'.repeat(lengthNumber);
          fieldNoAutoEx = dateFormat + data?.fixedString + strNumber;
          break;
        }
        // {value: '6', text: 'Chuỗi - Ngày', default: 'Chuỗi - Ngày', color: null, textColor: null, …}
        case '6': {
          fieldNoAutoEx = data?.fixedString + data?.separator + dateFormat;
          break;
        }
        // {value: '7', text: 'Ngày - Chuỗi', default: 'Ngày - Chuỗi', color: null, textColor: null, …}
        case '7': {
          fieldNoAutoEx = dateFormat + data?.separator + data?.fixedString;
          break;
        }
      }

      fieldNoAutoEx = fieldNoAutoEx.substring(0, data?.maxLength);
      this.column.dataFormat = fieldNoAutoEx;

      this.changeRef.markForCheck();
    }
  }

  async getVllFormat() {
    this.vllDateFormat = await firstValueFrom(this.cache.valueList('L0088'));
  }

  //--------------------------------------------------//
  //--------------CACULATE FIELD----------------------//
  //--------------------------------------------------//

  operator = ['+', '-', 'x', '/', 'Avg('];
  accessField = [']'];
  arrNum = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  buttonOperator(op) {
    if (this.caculateField) {
      let chartLast = this.caculateField[this.caculateField.length - 1];
      if (chartLast == '(') return;
      if (op == 'Avg') {
        if (
          this.arrNum.includes(chartLast) ||
          this.accessField.includes(chartLast)
        ) {
          return;
        }
        op = 'Avg(';
      }
      if (this.operator.includes(chartLast))
        this.caculateField = this.caculateField.substring(
          0,
          this.caculateField.length - 1
        );
    }

    this.caculateField += op;
  }

  buttonOpenParenthesis() {
    if (this.caculateField) {
      let idxLast = this.caculateField.length - 1;
      if (
        this.arrNum.includes(this.caculateField[idxLast]) ||
        this.caculateField[idxLast] == ')' ||
        this.caculateField[idxLast] == ','
      )
        return;
    }
    this.caculateField += '(';
  }

  buttonCloseParenthesis() {
    if (this.caculateField) {
      let idxLast = this.caculateField.length - 1;
      if (
        this.operator.includes(this.caculateField[idxLast]) ||
        this.caculateField[idxLast] == '(' ||
        this.caculateField[idxLast] == ',' ||
        this.compareParenthesis(this.caculateField) == 0
      )
        return;
    } else return;
    this.caculateField += ')';
  }

  compareParenthesis(string) {
    let countOpen = 0;
    let countClose = 0;
    for (const c of string) {
      if (c == '(') {
        countOpen++;
      } else if (c === ')') {
        countClose++;
      }
    }
    return countOpen - countClose;
  }

  fieldSelect(fieldName) {
    if (this.caculateField) {
      let idxLast = this.caculateField.length - 1;
      let chart = this.caculateField[idxLast];
      if (
        chart == ']' ||
        chart == ')' ||
        chart == ',' ||
        this.arrNum.includes(chart)
      )
        return;
    }
    this.caculateField += '[' + fieldName + ']';
    this.popover.close();
  }

  delChart() {
    if (this.caculateField) {
      let idxLast = this.caculateField.length - 1;
      if (this.caculateField[idxLast] == ']') {
        while (
          this.caculateField?.length == 0 ||
          this.caculateField[idxLast] != '['
        ) {
          this.caculateField = this.caculateField.substring(0, idxLast);
          idxLast = idxLast - 1;
        }
      }
      //else this.caculateField = this.caculateField.substring(0, idxLast);
      this.caculateField = this.caculateField.substring(0, idxLast);
    }
  }
  delAll() {
    this.caculateField = '';
  }
  // Num
  buttonNum(num) {
    if (this.caculateField) {
      let idxLast = this.caculateField.length - 1;
      if (
        this.caculateField[idxLast] == ']' ||
        this.caculateField[idxLast] == ')'
      )
        return;
    }
    this.caculateField += num;
  }
  decimalPoint() {
    if (!this.caculateField) return;
    let idxLast = this.caculateField.length - 1;
    let chartLast = this.caculateField[idxLast];
    if (
      chartLast == ',' ||
      this.accessField.includes(chartLast) ||
      this.operator.includes(chartLast)
    )
      return;
    //chua check hết
    idxLast = idxLast - 1;
    while (
      !this.operator.includes(this.accessField[idxLast]) ||
      idxLast != -1
    ) {
      if (this.caculateField[idxLast] == ',') return;
      idxLast--;
    }
    this.caculateField += ',';
  }

  selectFieldNum() {
    this.arrFieldNum = [];
    // this.arrFieldNum = this.listColumns
    //   .filter((x) => x.dataType == 'N')
    //   .map((x) => x.fieldName);
    this.arrFieldNum = this.listColumns
      .filter((x) => x.dataType == 'N' || x.dataType == 'CF')
      .map((x) => x.fieldName);

    if (!this.arrFieldNum || this.arrFieldNum?.length == 0)
      this.notiService.notify(
        'Bước thực hiện không có trường tùy chỉnh kiểu số !',
        '3'
      );
  }

  popoverSelectField(p) {
    if (this.arrFieldNum?.length > 0) p.open();
    this.popover = p;
    // else
    //   this.notiService.notify(
    //     'Bước thực hiện không có trường tùy chỉnh kiểu số !',
    //     '3'
    //   );
  }

  checkCaculateField() {
    if (!this.caculateField) {
      this.notiService.notify('Phép toán chưa được thiết lập !', '3');
      return false;
    }

    let lastChart = this.caculateField[this.caculateField.length - 1];
    if (
      this.compareParenthesis(this.caculateField) > 0 ||
      this.operator.includes(lastChart)
    ) {
      this.notiService.notify('Phép toán chưa đúng ! Hãy kiểm tra lại !', '3');
      return false;
    }
    return true;
  }

  openCaculate() {
    this.showCaculate = !this.showCaculate;
  }
  //-----------------end CACULATE FIELD------------------//

  //-----L-S- Checkbox---//
  valueChangeCheckBox(e, idx) { }
  //-----L-S- Checkbox---//

  //----------------Data Referent - PA-------------------------//

  clickSettingReference() {
    if (!this.column.refValue || !this.entityNamePA) {
      this.notiService.notify(
        'Hãy chọn đối tượng liên kết trước khi thiết lập',
        '3'
      );
      return;
    }
    if (this.funcCBX) {
      this.cache.functionList(this.funcCBX).subscribe((f) => {
        if (f) this.loadDataTypeRef(f?.formName, f?.gridViewName);
        else
          this.notiService.notify(
            'Grid View Setup chưa được thiết lập, hãy chọn đối tượng khác !',
            '3'
          );
      });
    } else {
      this.api
        .exec<any>(
          'SYS',
          'GridViewSetupBusiness',
          'GetGrvNameAndFormNameByEntityNameAsync',
          [this.entityNamePA, this.column.refValue]
        )
        .subscribe((res) => {
          if (res) {
            this.loadDataTypeRef(res?.formName, res?.gridViewName);
          } else
            this.notiService.notify(
              'Grid View Setup chưa được thiết lập, hãy chọn đối tượng khác !',
              '3'
            );
        });
    }
  }

  loadDataTypeRef(formName, gridViewName) {
    this.cache.gridViewSetup(formName, gridViewName).subscribe((grv) => {
      if (grv) {
        let option = new DialogModel();
        console.log(grv);
        option.zIndex = 1050;
        let obj = {
          datas: grv,
          entityName: this.entityNamePA,
          action: this.action,
          titleAction: this.titleField, //test
          dataRef: JSON.parse(this.column.dataFormat),
        };
        let dialogColumn = this.callfc.openForm(
          PopupSettingReferenceComponent,
          '',
          550,
          Util.getViewPort().height - 100,
          '',
          obj,
          '',
          option
        );
        dialogColumn.closed.subscribe((res) => {
          if (res && res.event && res.event[1]) {
            this.column.refType = '3';
            this.fieldCus.referType = '3';
            if (res.event && res.event[0]) {
              this.column.dataFormat = JSON.stringify(res.event[0]);
              this.fieldCus.dataFormat = JSON.stringify(res.event[0]);
            } else {
              this.column.dataFormat = '';
              this.fieldCus.dataFormat = '';
            }
            if (this.tempInput) this.tempInput.viewFieldRef();
            if (this.tempView)
              this.tempView.parseValuePA(this.fieldCus.dataValue);
          }
        });
      } else
        this.notiService.notify(
          'Grid View Setup chưa được thiết lập, hãy chọn đối tượng khác !',
          '3'
        );
    });
  }

  dropDataFormatPA(e) {
    this.column.dataFormat = JSON.stringify(e);
    this.fieldCus = JSON.parse(
      JSON.stringify(
        Object.assign(this.column, {
          dataValue: this.column.defaultValue,
        })
      )
    );
    if (this.tempView) this.tempView.parseValuePA(this.fieldCus.dataValue);
  }

  //-----------------------------------------------------------//

  //lưu giá trị mặc định
  valueChangeCustom(event) {
    if (event && event.data) {
      var result = event.e;
      var field = event.data;

      // var result = event.e?.data;
      // var field = event.data;
      // switch (field.dataType) {
      //   case 'P':
      //   case 'L':
      //   case 'PA':
      //     result = event.e;
      //     break;
      // }
      this.column.defaultValue = result;
      if (this.fieldCus) {
        this.fieldCus.defaultValue = this.fieldCus.dataValue = result;
      }
    }
  }
  //----------------- Dependences------------------//
  changeDependences(e) {
    if (!this.listCbx || this.listCbx.length == 0) {
      this.notiService.notify('Chưa có trường dữ liệu phù hợp để tham chiếu giá trị với kiểu dữ liệu vừa tạo ra !', "2")
      return;
    }
    this.column['isApplyDependences'] = e.data;

    if (this.column.isApplyDependences) {
      this.column.dataType = '';
      this.column.dataFormat = '';
      this.column.isApplyConditional = false;
      if (this.listCbx?.length > 0) {

      }
    }
  }
  cbxChangeDependence(e) {
    if (e) {
      let field = this.listCbx.find(x => x.recID == e);
      this.dependence.refID = e
      if (field && field.refValue) {
        this.cache.combobox(field.refValue).subscribe(res => {
          if (res) {
            this.entityNamePA = res.tableName;
            this.listValueField = res.tableFields?.split(";").map((x, idx) => {
              let obj = {
                text: x,
                value: idx
              }
              return obj;
            })
          }
        })
      }
    }
  }
  cbxChangeValueDependence(e) {
    if (!this.dependence.refID || !this.listValueField || this.listValueField?.length == 0 || this.action == 'edit' || this.action == 'view') return

    this.api
      .exec<any>(
        'SYS',
        'GridViewSetupBusiness',
        'GetFieldByEntityNameAndFieldNameAsync',
        [this.entityNamePA, this.listValueField[e]?.text]
      )
      .subscribe((res) => {
        if (res) {
          this.column = this.convertDataTypeAndFormat(res, this.column)
          this.dependence.strDependence = this.column.fieldName + '={' + e + '}'
        } else {
          this.notiService.notifyCode('SYS001')
        }
      })

  }
  //converType
  convertDataTypeAndFormat(data, field) {
    let type = 'T';
    let format = 'S';
    let refType = data.referedType;
    let refValue = data.referedValue;
    switch (data.dataType.toLocaleLowerCase()) {
      case 'string':
      case 'guild':
        if (refType && refValue) {
          type = 'L';
          format = refType == '3' ? 'C' : 'V';
        } else {
          let fiedname = data.fieldName.toLocaleLowerCase();
          let convert = this.defaultConvertData(fiedname, data.dataFormat);
          type = convert[0];
          format = convert[1];
          refType = convert[2];
          refValue = convert[3];
        }
        break;
      case 'bool':
        type = 'L';
        format = 'B';
        break;
      case 'datetime':
        type = 'D';
        format = data.dataFormat == 'g' ? '3' : '2'; //DD/MM/YYYY
        break;
      case 'int':
      case 'short':
        type = 'N';
        format = 'I';
        break;
      case 'decimal':
        type = 'N';
        format = 'D';
        break;
    }
    field.dataType = type;
    field.dataFormat = format;
    field.refType = refType;
    field.refValue = refValue;

    return field;
  }
  defaultConvertData(fiedname, dataFormatGrv) {
    let type = 'L';
    let format = 'C';
    let refType = '3';
    let refValue = '';
    switch (fiedname) {
      case 'createdby':
      case 'owner':
      case 'modifiedby':
        refValue = 'Users';
        break;
      case 'deepartmentid':
        refValue = 'Share_Departments';
        break;
      case 'divisionid':
        refValue = 'Divisions';
        break;
      case 'employeeid':
        refValue = 'EmployeeUser';
        break;
      case 'orgunitid':
        refValue = 'Share_OrgUnits';
        break;
      case 'positionid':
        refValue = 'Share_Positions';
        break;
      case 'buid':
        refValue = 'BusinessUnits';
        break;
      default:
        type = 'T';
        format = dataFormatGrv.includes('ed') ? 'L' : 'S';
        refType = '';
        refValue = '';
        break;
    }
    return [type, format, refType, refValue];
  }

  //----------------- Conditons Ref------------------//
  clickSettingConditional() {
    let fieldsCondition = this.listColumns.filter(x => x.dataType == this.column.dataType && x.dataFormat == this.column.dataFormat)
    if (!fieldsCondition || fieldsCondition?.length == 0) {
      this.notiService.notify('Chưa có trường dữ liệu phù hợp để tham chiếu điều kiện với kiểu dữ liệu vừa tạo ra !', "2")
      return;
    }
    let cons = this.column.conditionReference ?? [];
    if (cons?.length > 0) {
      let idCon = cons.map(x => x.refID);
      fieldsCondition = fieldsCondition.filter(x => !idCon.includes(x.recID));
      if (!fieldsCondition || fieldsCondition?.length == 0) {
        this.notiService.notify('Các trường dữ liệu cùng kiểu đã thực hiện tham chiếu, vui lòng chỉnh sửa dữ liệu trước đó !', "2")
        return;
      }
    }

    let option = new DialogModel();
    option.zIndex = 1050;
    let data = new DP_Condition_Reference_Fields();
    data.messageType = '2'
    let obj = {
      data: data,
      action: 'add',
      titleAction: this.grvSetup['ConditionReference']?.headerText, //test
      fieldsCondition: fieldsCondition
    };
    let dialogCon = this.callfc.openForm(
      PopupSettingConditionalComponent,
      '',
      550,
      400,
      '',
      obj,
      '',
      option
    );
    dialogCon.closed.subscribe(res => {
      if (res && res.event) {
        cons.push(res.event)
        this.column.conditionReference = cons
      }
    })
  }

  editCondition(con, idx) {
    let fieldsCondition = this.listColumns.filter(x => x.dataType == this.column.dataType && x.dataFormat == this.column.dataFormat);
    let cons = this.column?.conditionReference ?? [];
    if (cons?.length > 0) {
      let idCon = cons.map(x => x.refID);
      fieldsCondition = fieldsCondition.filter(x => !idCon.includes(x.recID) || con.refID == x.recID);
    }
    let option = new DialogModel();
    option.zIndex = 1050;
    let data = new DP_Condition_Reference_Fields();
    data.messageType = '2'
    let obj = {
      data: con,
      action: 'edit',
      titleAction: this.grvSetup['ConditionReference']?.headerText, //test
      fieldsCondition: fieldsCondition
    };
    let dialogCon = this.callfc.openForm(
      PopupSettingConditionalComponent,
      '',
      550,
      400,
      '',
      obj,
      '',
      option
    );
    dialogCon.closed.subscribe(res => {
      if (res && res.event) {
        this.column.conditionReference[idx] = res.event
      }
    })
  }
  deleteCondition(idx) {
    this.notiService.alertCode('TM003').subscribe((confirm) => {
      if (confirm?.event && confirm?.event?.status == 'Y') {
        this.column.conditionReference.splice(idx, 1)
      }
    })
  }
  changeConditional(e) {
    this.column.isApplyConditional = e.data;
  }
}
