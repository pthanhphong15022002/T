import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  SliderTickEventArgs,
  SliderTickRenderedEventArgs,
} from '@syncfusion/ej2-angular-inputs';
import {
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
  DP_Steps_Fields,
  tempVllDP,
} from '../../../models/models';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';
import { X } from '@angular/cdk/keycodes';
import test from 'node:test';
import { ComboBoxComponent } from '@syncfusion/ej2-angular-dropdowns';
import { CodxDpService } from '../../../codx-dp.service';
import { PopupAddVllCustomComponent } from './popup-add-vll-custom/popup-add-vll-custom.component';
import { PopupSettingTableComponent } from './popup-setting-table/popup-setting-table.component';
import { PopupSettingReferenceComponent } from './popup-setting-reference/popup-setting-reference.component';
import { CodxInputCustomFieldComponent } from 'projects/codx-share/src/lib/components/codx-input-custom-field/codx-input-custom-field.component';
import { CodxFieldsFormatValueComponent } from 'projects/codx-share/src/lib/components/codx-fields-detail-temp/codx-fields-format-value/codx-fields-format-value.component';

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
  fileNameArr = [];
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

  //column Table
  // column: ColumnTable;
  listColumns = [];
  settingWidth = false;
  settingCount = false;
  isShowMore = false;
  widthDefault = '550';

  //Field PA
  entityNamePA = '';
  servicePA: string;
  fieldCus: any;

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
    this.creatFieldCustom();
    this.widthDefault = this.dialog.dialog.width
      ? this.dialog.dialog.width.toString()
      : '550';
    if (this.action == 'add' || this.action == 'copy')
      this.field.recID = Util.uid();

    this.titleAction = dt?.data?.titleAction;
    this.stepList = dt?.data?.stepList;
    this.grvSetup = dt.data?.grvSetup;
    if (this.stepList?.length > 0) {
      this.stepList.forEach((obj) => {
        if (obj?.fields?.length > 0) {
          let arrFn = obj?.fields.map((x) => {
            let obj = { fieldName: x.fieldName, recID: x.recID };
            return obj;
          });
          this.fileNameArr = this.fileNameArr.concat(arrFn);
        }
      });
    }
  }

  ngOnInit(): void {
    if (this.field.dataType == 'L' && this.field.dataFormat == 'V')
      this.loadDataVll();
    if (this.field.dataType == 'TA') {
      this.getColumnTable(this.field);
    }
  }

  async valueChange(e) {
    if (e.field == 'multiselect') {
      this.field[e.field] = e.data;
      return;
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
    if (e.field == 'dataFormat' && (e.data == 'V' || e.data == 'C')) {
      if (e.data == 'V') this.loadDataVll();
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
    if (e.field == 'refValue' && this.field.dataType == 'PA') {
      this.field.refType = '3';
      this.servicePA = e?.component?.itemsSelected[0]?.Service;
      this.entityNamePA = e?.component?.itemsSelected[0]?.TableName;
    }
    this.creatFieldCustom();

    // this.changdef.detectChanges(); thua
  }

  creatFieldCustom() {
    if (
      (this.field.dataFormat &&
        (this.field.dataType == 'N' ||
          this.field.dataType == 'P' ||
          this.field.dataType == 'T')) ||
      ((this.field.dataType == 'L' || this.field.dataType == 'PA') &&
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
    }
  }

  changeRequired(e) {
    this.field.isRequired = e.data;
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
    if (value) this.field['stepID'] = value;
  }

  saveData() {
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
    if (this.fileNameArr.length > 0) {
      let check = this.fileNameArr.some(
        (x) =>
          x.fieldName.toLowerCase() == this.field.fieldName.toLowerCase() &&
          x.recID != this.field.recID
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
      this.field.dataType != 'C'
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

    this.dialog.close([this.field, this.processNo]);
    this.field = new DP_Steps_Fields(); //tắt bùa
  }

  removeAccents(str) {
    if (!str) return;
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

  //----------------Value List -----------------------//
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
    // this.dialogVll = this.callfc.openForm(this.addVll, '', 500, 550, '');
    let obj = {
      data: this.crrVll,
      datasVll: this.datasVll,
      action: action,
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

  closeDialog() {}

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
    // this.requestTemp.predicate = 'Language=@0 ';
    // this.requestTemp.dataValue = this.user.language;
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
      // this.changeFormVll();
      var arr = this.crrDatasVll.defaultValues.split(';');

      if (Array.isArray(arr) && arr?.length > 0) {
        this.datasVllCrr = arr.map((x) => {
          let obj = {
            textValue: x,
            value: x,
          };
          return obj;
        });
        // this.crrValueFirst = this.datasVllCrr[0].textValue;
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
    } else this.listColumns = [];
    this.changeRef.detectChanges();
  }

  showMore() {
    this.isShowMore = !this.isShowMore;
    let width = '1000';
    if (this.isShowMore) width = '1000'; ///test

    this.dialog.setWidth(this.isShowMore ? width : this.widthDefault);
    this.changeRef.detectChanges();
  }
  //---------------------End Column Table-----------------------------//

  //----------------Data Referent__PA-------------------------//
  clickSettingReference() {
    if (!this.field.refValue || !this.entityNamePA) {
      this.notiService.notify(
        'Hãy chọn đối tượng liên kết trước khi thiết lập',
        '3'
      );
      return;
    }

    //bùa vậy vì ko có cách nào lấy grv bằng entityname cả
    let formName = this.entityNamePA.replace('_', '');
    let gridViewName = 'grv' + formName;
    // let formName = 'CMCustomers';
    // let gridViewName = 'grv' + formName;

    this.cache.gridViewSetup(formName, gridViewName).subscribe((grv) => {
      if (grv) {
        let option = new DialogModel();
        console.log(grv);
        option.zIndex = 1050;
        let obj = {
          datas: grv,
          entityName: this.entityNamePA,
          action: this.action,
          titleAction: 'Thêm trường liên kết', //test
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
      var result = event.e?.data;
      var field = event.data;
      switch (field.dataType) {
        case 'P':
        case 'L':
        case 'PA':
          result = event.e;
          break;
      }
      this.field.defaultValue = result;
      if (this.fieldCus) {
        this.fieldCus.defaultValue = this.fieldCus.dataValue = result;
      }
    }
  }
  //end
}
