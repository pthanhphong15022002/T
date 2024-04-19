import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import {
  AlertConfirmInputConfig,
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  DataRequest,
  DialogData,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  Util,
} from 'codx-core';
import {
  ColumnTable,
  DP_Condition_Reference_Fields,
  DP_Steps_Fields,
  tempVllDP,
} from '../../../models/models';
import {
  Observable,
  Subject,
  finalize,
  firstValueFrom,
  map,
  takeUntil,
} from 'rxjs';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { CodxDpService } from '../../../codx-dp.service';
import { PopupAddVllCustomComponent } from './popup-add-vll-custom/popup-add-vll-custom.component';
import { PopupSettingTableComponent } from './popup-setting-table/popup-setting-table.component';
import { PopupSettingReferenceComponent } from './popup-setting-reference/popup-setting-reference.component';
import { PopupAddAutoNumberComponent } from 'projects/codx-es/src/lib/setting/category/popup-add-auto-number/popup-add-auto-number.component';
import { CodxInputCustomFieldComponent } from '../../../share-crm/codx-input-custom-field/codx-input-custom-field.component';
import { CodxFieldsFormatValueComponent } from '../../../share-crm/codx-input-custom-field/codx-fields-detail-temp/codx-fields-format-value/codx-fields-format-value.component';
import { PopupSettingConditionalComponent } from './popup-setting-conditional/popup-setting-conditional.component';

@Component({
  selector: 'lib-popup-add-custom-field',
  templateUrl: './popup-add-custom-field.component.html',
  styleUrls: ['./popup-add-custom-field.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupAddCustomFieldComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('addVll') addVll: TemplateRef<any>;
  @ViewChild('bodyVll') bodyVll: TemplateRef<any>;
  @ViewChild('footerVll') footerVll: TemplateRef<any>;
  @ViewChild('datasVllCbx') datasVllCbx: ComboBoxComponent; //list cbx
  @ViewChild('comboxView') comboxView: ComboBoxComponent; ///cobx xem truoc ViewForm Field
  // @ViewChild('viewComboxForm') viewComboxForm: ComboBoxComponent; ///cobx xem truoc ViewForm add VLL
  @ViewChild('toolDeleted') toolDeleted: TemplateRef<any>;
  @ViewChild('tempInput') tempInput: CodxInputCustomFieldComponent;
  @ViewChild('tempView') tempView: CodxFieldsFormatValueComponent;

  dialog: DialogRef;
  field: DP_Steps_Fields;
  grvSetup: any;
  action = 'add';
  titleAction = 'Thêm';
  enabled = false;
  //
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
  stepList = [];
  itemView = '';
  vllDynamic = 'DP0271';
  fieldNameArr = [];
  refValueDataType = 'DP022';

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
  user: any;
  crrVll: tempVllDP;
  crrDatasVll: any;
  // view Crr
  datasVllCrr = [];
  fieldsCrrVll = { text: 'textValue', value: 'value' };
  crrValueFirst = null;
  element: any;
  isOpenPopup = false;
  loaded: boolean = false;

  idxEdit = -1;
  popover: any;
  idxDeleted = -1;
  processNo: any; //de sinh ma vll
  maxNumber = 0;
  checkBoxVL: any;

  //column Table
  // column: ColumnTable;
  listColumns = [];
  settingWidth = false;
  settingCount = false;
  totalColumns = false;
  isShowMore = false;
  widthDefault = '550';

  //Field PA
  entityNamePA = '';
  funcCBX = '';
  servicePA: string;
  fieldCus: any;
  title = 'Thông báo ';
  titleConfirm: string =
    'Trường tùy chỉnh đã được thiết lập tại bước {0} bạn có muốn tái sử dụng !';

  isDuplicateField = false;
  isEditFieldDuplicate = false;
  fieldNameOld = '';
  //create autoNumber
  vllDateFormat: any;
  adAutoNumber: any;
  caculateField = '';
  private destroyFrom$: Subject<void> = new Subject<void>();
  arrFieldNum = [];
  showCaculate = true;
  titleField: any = '';
  viewOnly = false;
  plancehoderVll = '';
  remindDefault = {  // default value remind setting
    isAlert: false,
    isMail: false,
    reminderTime: 5,
    emailTemplate: '',
    dateRemind: ''
  }
  //Conditional
  listCbx = [];
  fieldsDependence = { text: 'fieldName', value: 'recID' };
  listValueField = [];
  valueDependence = { text: 'text', value: 'value' };
  fieldInStep: any[]

  dependence = {
    refID: '',
    strDependence: ''
  }

  constructor(
    private cache: CacheService,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private changeRef: ChangeDetectorRef,
    private authstore: AuthStore,
    private api: ApiHttpService,
    private dpService: CodxDpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.user = this.authstore.get();
    this.field = JSON.parse(JSON.stringify(dt?.data?.field));
    this.action = dt?.data?.action;
    this.enabled = dt?.data?.enabled;
    this.refValueDataType = dt?.data?.refValueDataType ?? this.refValueDataType;
    this.processNo = dt?.data?.processNo; //de sinh vll
    this.fieldNameArr = dt?.data?.fieldNameArr ?? [];
    this.isDuplicateField = dt?.data?.isDuplicateField ?? false;
    this.titleAction = dt?.data?.titleAction;
    this.stepList = dt?.data?.stepList;
    this.grvSetup = dt.data?.grvSetup;
    this.viewOnly = this.action == 'view';

    this.creatFieldCustom();
    this.widthDefault = this.dialog.dialog.width
      ? this.dialog.dialog.width.toString()
      : '550';
    if (this.action == 'add' || this.action == 'copy') {
      this.field.recID = Util.uid();
      if (this.stepList?.length > 0) {
        this.stepList.forEach((objStep) => {

          if (objStep?.fields?.length > 0) {
            if (objStep.recID == this.field.stepID) {
              this.fieldInStep = objStep.fields;
              this.listCbx = this.fieldInStep.filter(x => x.refType == "3");
            }
            let arrFn = objStep?.fields.map((x) => {
              let obj = {
                fieldName: x.fieldName,
                recID: x.recID,
                stepID: objStep.recID,
                stepName: objStep.stepName,
              };
              return obj;
            });
            this.fieldNameArr = this.fieldNameArr.concat(arrFn);
          }
        });
      }
    } else {
      this.fieldNameOld = this.field.fieldName;
      this.showCaculate = false;
    }
  }

  ngOnInit(): void {
    if (
      this.field.dataType == 'L' &&
      (this.field.dataFormat == 'V' || this.field.dataFormat == 'S')
    )
      this.loadDataVll();
    if (this.field.dataType == 'TA') {
      this.getColumnTable(this.field);
    }
    if (this.field.dataType == 'CF')
      this.caculateField = this.field.dataFormat ?? '';

    if (this.field.dataType == 'PA') {
      this.cache.combobox(this.field.refValue).subscribe((cb) => {
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
  }

  async valueChange(e) {
    if (e.field == 'multiselect') {
      this.field[e.field] = e.data;
      return;
    }
    if (e.field == 'dataType') {
      this.titleField = e?.component?.selectedItems[0]?.text;
    }
    if (
      (e.field == 'dataType' && e.data != this.field.dataType) ||
      (e.field == 'dataFormat' && e.data != this.field.dataFormat)
    ) {
      this.field.refType = null;
      this.field.refValue = null;
      this.field.dataFormat = null;
      this.field.multiselect = false;
      this.fieldCus = null;
    }

    if (e && e.field) this.field[e.field] = e?.data;

    if (e.field == 'title' || e.field == 'fieldName')
      this.removeAccents(e.data);
    if (
      e.field == 'dataFormat' &&
      (e.data == 'V' || e.data == 'C' || e.data == 'S')
    ) {
      if (e.data == 'V' || e.data == 'S') this.loadDataVll();
      this.field.refType = e.data == 'C' ? '3' : '2';
      if (this.action != 'edit' && !this.field.refValue) {
        // this.crrVll = new tempVllDP();
        // this.crrVll.language = this.user.language;
        // this.crrVll.createdBy = this.user.userID;
        // this.crrVll.listType = '1'; //luu kieu nao de khanh tinh sau 2
        // this.crrVll.version = 'x00.01';
        // await this.getDefaultVll();
      } else {
        this.crrVll = this.listVllCus.find(
          (x) => x.listName == this.field.refValue
        );
        // this.changeFormVll();
      }
    }
    if (e.field == 'refValue' && this.field.dataType == 'PA' && e.data) {
      this.field.refType = '3';
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
    if (e.field == 'dataFormat' || e.field == 'refValue' || (e.field == 'dataType' && e.data == 'RM'))
      this.creatFieldCustom();
    if (e.field == 'dataType' && e.data == 'CF') this.selectFieldNum();
  }
  //chang title va change field name
  valueChangeText(e) {
    // if (e && e.field) this.field[e.field] = e?.data;

    // if (e.field == 'title' || e.field == 'fieldName')
    //   this.removeAccents(e.data);
    this.duplicateField();
  }

  creatFieldCustom() {
    if (this.field.dataType == 'RM') {
      if (this.action == 'edit' || this.action == 'view') {
        this.remindDefault = JSON.parse(this.field.defaultValue);
        // this.remindDefault.emailTemplate = this.field.recID;
      } else
        this.remindDefault.emailTemplate = this.field.recID;
      this.fieldCus = JSON.parse(
        JSON.stringify(
          Object.assign(this.field, {
            dataValue: JSON.stringify(this.remindDefault),//tesst CM_40001
          })
        )
      );
    } else if (
      (this.field.dataFormat &&
        (this.field.dataType == 'N' ||
          this.field.dataType == 'P' ||
          this.field.dataType == 'T')) ||
      (((this.field.dataType == 'L' && this.field.dataFormat != 'B') || this.field.dataType == 'PA') &&
        this.field.refValue) ||
      (this.field.dataType == 'L' && this.field.dataFormat == 'B')
    ) {
      this.fieldCus = JSON.parse(
        JSON.stringify(
          Object.assign(this.field, {
            dataValue: this.field.defaultValue,
          })
        )
      );
    } else {
      this.fieldCus = null;
    }
  }

  changeRequired(e) {
    this.field.isRequired = e.data;
  }
  changeConditional(e) {
    this.field.isApplyConditional = e.data;
  }
  valueChangeIcon(e) {
    if (e && e?.data) this.field.rankIcon = e.data;
  }

  sliderChange(e) {
    this.field.rank = e?.value;
  }
  // khong dc xoa
  // renderingTicks(args: SliderTickEventArgs) {
  //   if (args.tickElement.classList.contains('e-large')) {
  //     args.tickElement.classList.add('e-custom');
  //   }
  // }
  //thay doi view duoiw
  // renderedTicks(args: SliderTickRenderedEventArgs) {
  //   let li = args.ticksWrapper.getElementsByClassName('e-large');
  //   let remarks: any = ['', '', '', '', '', '', '', '', '', '', '', ''];
  //   for (let i = 0; i < li.length; ++i) {
  //     (li[i].querySelectorAll('.e-tick-both')[1] as HTMLElement).innerText =
  //       remarks[i];
  //   }
  // }
  cbxChange(value) {
    let oldStep = this.field['stepID'];
    if (value && value != oldStep) {
      this.field['stepID'] = value;
      this.caculateField = '';
    }
    if (this.field.dataType == 'CF') this.selectFieldNum();
  }

  saveData() {
    if (this.field.dataType == 'CF') {
      if (this.checkCaculateField()) this.field.dataFormat = this.caculateField;
      else return;
    }

    if (
      (!this.field.title || this.field.title.trim() == '') &&
      this.grvSetup['Title']?.isRequire
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['Title']?.headerText + '"'
      );
      return;
    }
    if (
      (!this.field.fieldName || this.field.fieldName.trim() == '') &&
      this.grvSetup['FieldName']?.isRequire
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['FieldName']?.headerText + '"'
      );
      return;
    }
    if (this.fieldNameArr.length > 0) {
      let check = this.fieldNameArr.some(
        (x) =>
          x.fieldName.toLowerCase() == this.field.fieldName.toLowerCase() &&
          x.recID != this.field.recID &&
          x.stepID == this.field.stepID
      );
      if (check) {
        this.notiService.notifyCode(
          'DP026',
          0,
          '"' + this.grvSetup['FieldName']?.headerText + '"'
        );
        return;
      }
    }
    if (!this.field.dataType && this.grvSetup['DataType']?.isRequire) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['DataType']?.headerText + '"'
      );
      return;
    }
    if (
      !this.field.dataFormat &&
      this.field.dataType != 'R' &&
      this.field.dataType != 'A' &&
      this.field.dataType != 'C' &&
      this.field.dataType != 'RM'
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['DataFormat']?.headerText + '"'
      );
      return;
    }

    // if (this.field.dataType == 'L' && !this.field.refType) {
    //   this.notiService.notifyCode(
    //     'SYS009',
    //     0,
    //     '"' + this.grvSetup['RefType']?.headerText + '"'
    //   );
    //   return;
    // }

    if (
      this.field.dataType == 'L' &&
      this.field.dataFormat != 'B' &&
      !this.field.refValue
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['RefValue']?.headerText + '"'
      );
      return;
    }

    if (
      (this.field.note == null || this.field.note.trim() == '') &&
      this.grvSetup['Note']?.isRequire
    ) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['Note']?.headerText + '"'
      );
      return;
    }
    if (!this.field.rankIcon && this.field.dataType == 'R') {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['RankIcon']?.headerText + '"'
      );
      return;
    }
    if (this.field.isApplyDependences && (!this.dependence.refID || !this.dependence.strDependence)) {
      this.notiService.notify('Tham chiếu giá trị chưa hoàn thành, hãy hoàn thiện thiết lập để tiếp tục !', '2');
      return
    }

    this.dialog.close([this.field, this.processNo, this.isEditFieldDuplicate, this.dependence]);

    this.field = new DP_Steps_Fields();
    this.isDuplicateField = false;
    this.isEditFieldDuplicate = false;
  }

  removeAccents(str) {
    if (!str) {
      this.field.fieldName = '';
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
    this.field.fieldName = format;
  }

  //---------Trùng Field------------//
  duplicateField() {
    if (
      this.action == 'edit' &&
      this.isDuplicateField &&
      this.field.fieldName.toLowerCase() == this.fieldNameOld.toLowerCase()
    ) {
      this.field.fieldName = this.fieldNameOld;
      return;
    }
    if (this.fieldNameArr?.length > 0) {
      let checkArrDup = this.fieldNameArr.filter(
        (x) =>
          x.fieldName.toLowerCase() == this.field.fieldName.toLowerCase() &&
          x.stepID != this.field.stepID
      );
      if (checkArrDup?.length > 0) {
        if (this.action == 'edit') {
          this.notiService.notifyCode(
            'DP026',
            0,
            '"' + this.grvSetup['FieldName']?.headerText + '"'
          );
          return;
        }
        this.isDuplicateField = true;
        //thông báo test chưa có mes code
        let nameSteps = checkArrDup.map((x) => x.stepName);
        // let config = new AlertConfirmInputConfig();
        // config.type = 'YesNo';
        // let titleConfirmDup = this.titleConfirm.replace(
        //   '{0}',
        //   '"' + nameSteps.join(';') + '"'
        // );
        //this.notiService
        // .alert(this.title, titleConfirmDup, config)
        // .closed.subscribe((res) => {
        this.notiService
          .alertCode('DP042', null, [
            '<b class="text-danger">"' + nameSteps.join(';') + '"</b>' || '',
          ])
          .subscribe((res) => {
            if (res?.event && res?.event?.status == 'Y') {
              let fieldDup = checkArrDup[0];
              let idx = this.stepList.findIndex(
                (x) => x.recID == fieldDup.stepID
              );
              if (idx != -1) {
                let idxField = this.stepList[idx].fields.findIndex(
                  (x) => x.recID == fieldDup.recID
                );
                if (idxField != -1) {
                  let crrF = JSON.parse(
                    JSON.stringify(this.stepList[idx].fields[idxField])
                  );
                  let recID = this.field.recID;
                  let stepID = this.field.stepID;
                  this.field = crrF;
                  this.field.recID = recID;
                  this.field.stepID = stepID;
                  this.form.formGroup.patchValue(this.field);
                }
              }
            }
          });
      } else {
        this.isDuplicateField = false;
        this.isEditFieldDuplicate = false;
      }
    }
  }

  //---------------End - DuplicateField ------------------//

  //---------------- L - Value List -----------------------//
  async clickAddVll() {
    // 'add vll'
    let action = !this.field.refValue ? 'add' : 'edit';
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
      isCheckBox: this.field.dataFormat == 'S',
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

  cbxChangeVll(value) {
    this.field['refValue'] = value;

    if (!value) {
      // await this.getDefaultVll();
      this.crrVll = null;
      this.datasVll = [];
      //data crrVll
      this.datasVllCrr = [];
      // this.crrValueFirst = null;
      if (this.comboxView) this.comboxView.refresh();
      return;
    }
    if (!this.listVllCus || this.listVllCus?.length == 0) return;
    this.crrDatasVll = this.listVllCus.find((vl) => vl.listName == value);
    if (
      this.crrDatasVll &&
      this.crrDatasVll.listType == '1' &&
      this.crrDatasVll.defaultValues
    ) {
      this.crrVll = this.crrDatasVll;

      var arr = this.crrDatasVll.defaultValues.split(';');

      if (Array.isArray(arr) && arr?.length > 0) {
        this.datasVllCrr = arr.map((x) => {
          let obj = {
            textValue: x,
            value: x,
          };
          return obj;
        });
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
    this.form.formGroup.patchValue(this.field);
    this.crrVll = null;
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

              var idxDeletedCus = this.listVllCus.findIndex(
                (x) => x.value == this.crrVll.listName
              );
              if (idxDeletedCus != -1) {
                this.listVllCus.splice(idxDeletedCus, 1);
              }

              this.field.refValue = '';
              this.datasVllCrr = [];
              this.crrValueFirst = null;
              this.crrVll = null;
              if (this.comboxView) {
                this.comboxView.value = '';
                this.comboxView.refresh();
              }
              if (this.datasVllCbx) {
                this.datasVllCbx.value = '';
                this.datasVllCbx.refresh();
              }
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
      if (!this.crrVll) {
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

  valueChangeCheckBox(e, idx) {
    // if (e.data) {
    //   this.checkBoxVL = e.field;
    // } else {
    //   this.checkBoxVL = null;
    // }
    //this.datasVllCrr[idx]['check'] = e.data;
  }
  //---------------------End  Vll-----------------------------//

  //----------------Column Table -----------------------//
  clickSettingTable() {
    // if (!this.column) this.column = new ColumnTable();
    let option = new DialogModel();
    let formModelTable = new FormModel();
    formModelTable.formName = this.dialog.formModel.formName;
    formModelTable.gridViewName = this.dialog.formModel.gridViewName;
    formModelTable.entityName = this.dialog.formModel.entityName;

    this.dpService
      .getFormGroup(formModelTable.formName, formModelTable.gridViewName)
      .then(async (fg) => {
        formModelTable.formGroup = fg;
        option.FormModel = formModelTable;

        option.zIndex = 1050;
        let obj = {
          // data: this.column,
          action: this.action,
          titleAction: 'Setting columns', //test
          grvSetup: this.grvSetup,
          processNo: this.processNo,
          user: this.user,
          listColumns: this.listColumns,
        };
        let dialogColumn = this.callfc.openForm(
          PopupSettingTableComponent,
          '',
          550,
          400,
          '',
          obj,
          '',
          option
        );
        dialogColumn.closed.subscribe((res) => {
          if (res && res.event) {
            if (res.event[0]) {
              this.listColumns = res.event[0];
              this.settingWidth = this.listColumns[0]?.settingWidth ?? false;
              this.settingCount = this.listColumns[0]?.settingCount ?? false;
              this.totalColumns =
                this.listColumns.findIndex((x) => x?.totalColumns) != -1;

              this.field.dataFormat = JSON.stringify(this.listColumns);
            }
            if (res.event[1] && !this.processNo) {
              this.processNo = res.event[1];
            }
          }
          //....................
        });
      });
  }

  getColumnTable(data) {
    if (!data.dataFormat) {
      this.listColumns = [];
      return;
    }
    let arr = JSON.parse(data.dataFormat);
    if (Array.isArray(arr)) {
      this.listColumns = arr;
      this.settingWidth = this.listColumns[0]?.settingWidth ?? false;
      this.settingCount = this.listColumns[0]?.settingCount ?? false;
      this.totalColumns =
        this.listColumns.findIndex((x) => x?.totalColumns) != -1;
    } else this.listColumns = [];
    this.changeRef.detectChanges();
  }

  showMore() {
    this.isShowMore = !this.isShowMore;
    let width = Util.getViewPort().width.toString();
    this.dialog.setWidth(this.isShowMore ? width : this.widthDefault);
    this.changeRef.detectChanges();
  }
  //---------------------End Column Table-----------------------------//

  //-----------------------------------------------------------//
  //----------------Data Referent - PA-------------------------//
  //-----------------------------------------------------------//

  clickSettingReference() {
    if (!this.field.refValue || !this.entityNamePA) {
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
          [this.entityNamePA, this.field.refValue]
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
        option.zIndex = 1050;
        let obj = {
          datas: grv,
          entityName: this.entityNamePA,
          action: this.action,
          titleAction: this.titleField, //test
          dataRef: JSON.parse(this.field.dataFormat),
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
            this.field.refType = '3';
            this.fieldCus.referType = '3';
            if (res.event && res.event[0]) {
              this.field.dataFormat = JSON.stringify(res.event[0]);
              this.fieldCus.dataFormat = JSON.stringify(res.event[0]);
            } else {
              this.field.dataFormat = '';
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

  //lưu giá trị mặc định
  valueChangeCustom(event) {
    if (event && event.data) {
      var result = event.e;

      this.field.defaultValue = result;
      if (this.fieldCus) {
        this.fieldCus.defaultValue = this.fieldCus.dataValue = result;
      }
    }
  }
  //end

  //--------------------------------------------------//
  //** đánh số tự động - Popup setiing autoNumber    */
  //--------------------------------------------------//
  async openAutoNumPopup() {
    this.getVllFormat();
    let obj = {};
    if (!this.field.dataFormat) {
      //save new autoNumber
      obj = {
        autoNoCode: this.field.recID,
        description: 'DP_Instances_Steps_Field',
        newAutoNoCode: this.field.recID,
        isSaveNew: '1',
      };
    } else {
      //cap nhật
      obj = {
        autoNoCode: this.field.recID,
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
      this.field.dataFormat = fieldNoAutoEx;
      // this.changeDetectorRef.detectChanges();
      this.changeRef.markForCheck();
    }
  }

  async getVllFormat() {
    this.vllDateFormat = await firstValueFrom(this.cache.valueList('L0088'));
  }
  //-----------------------END AUTONUM------------------//

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
    var idx = this.stepList.findIndex(
      (x) => x.recID == this.field.stepID && x.fields?.length > 0
    );
    if (idx != -1) {
      // this.arrFieldNum = this.stepList[idx].fields
      //   .filter((x) => x.dataType == 'N')
      //   .map((x) => x.fieldName);
      this.arrFieldNum = this.stepList[idx].fields
        .filter((x) => x.dataType == 'N' || x.dataType == 'CF') //lafm them
        .map((x) => x.fieldName);
    }
    if (!this.arrFieldNum || this.arrFieldNum?.length == 0)
      this.notiService.notify(
        'Bước thực hiện không có trường tùy chỉnh kiểu số !',
        '3'
      );
  }

  popoverSelectField(p) {
    if (this.arrFieldNum?.length > 0) p.open();
    this.popover = p;
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

  dropDataFormatPA(e) {
    this.field.dataFormat = JSON.stringify(e);
    this.fieldCus = JSON.parse(
      JSON.stringify(
        Object.assign(this.field, {
          dataValue: this.field.defaultValue,
        })
      )
    );
    if (this.tempView) this.tempView.parseValuePA(this.fieldCus.dataValue);
  }

  //-----------------Remind------------------//
  valueChangeChbx(e) {

  }
  //----------------- Conditons Ref------------------//
  clickSettingConditional() {
    let fieldsCondition = this.fieldInStep.filter(x => x.dataType == this.field.dataType && x.dataFormat == this.field.dataFormat)
    if (!fieldsCondition || fieldsCondition?.length == 0) {
      this.notiService.notify('Chưa có trường dữ liệu phù hợp để tham chiếu điều kiện với kiểu dữ liệu vừa tạo ra !', "2")
      return;
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
        let cons = this.field.conditionReference ?? [];
        cons.push(res.event)
        this.field.conditionReference = cons
      }
    })
  }

  //----------------- Dependences------------------//
  changeDependences(e) {
    if (!this.listCbx || this.listCbx.length == 0) {
      this.notiService.notify('Chưa có trường dữ liệu phù hợp để tham chiếu giá trị với kiểu dữ liệu vừa tạo ra !', "2")
      return;
    }
    this.field['isApplyDependences'] = e.data;
    if (this.field.isApplyDependences) {
      this.field.isApplyConditional = false;
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
    this.dependence.strDependence = this.field.fieldName + '={' + e + '}'
  }
  //-------------Default ------------//
  changeUseDeafaut(e) {
    this.field['isUseDefault'] = e.data;
  }
}
