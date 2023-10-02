import {
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
import { ColumnTable, tempVllDP } from 'projects/codx-dp/src/lib/models/models';
import { Observable, finalize, firstValueFrom, map } from 'rxjs';

import { PopupAddVllCustomComponent } from '../popup-add-vll-custom/popup-add-vll-custom.component';
import { CodxDpService } from 'projects/codx-dp/src/lib/codx-dp.service';

@Component({
  selector: 'lib-popup-add-column-table',
  templateUrl: './popup-add-column-table.component.html',
  styleUrls: ['./popup-add-column-table.component.css'],
})
export class PopupAddColumnTableComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('tempViewTable') tempViewTable: TemplateRef<any>;
  @ViewChild('datasVllCbx') datasVllCbx: ComboBoxComponent; //list cbx
  @ViewChild('comboxView') comboxView: ComboBoxComponent; ///cobx xem truoc ViewForm Field
  @ViewChild('valueListType') valueListType: CodxInputComponent;

  column: ColumnTable;
  dialog: DialogRef;
  user: any;
  action = 'add';
  processNo: any;
  titleAction = 'Column ne';
  grvSetup: any;
  loaded: any = false;
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
  formModelTable: FormModel;

  constructor(
    private changdef: ChangeDetectorRef,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private changeRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private dpService: CodxDpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.formModelTable = this.dialog.formModel;
    this.column = JSON.parse(JSON.stringify(dt?.data?.data));
    this.listColumns = dt?.data?.listColumns;
    this.user = dt?.data?.user;
    this.action = dt?.data?.action;

    this.titleAction = dt?.data?.titleAction;
    this.grvSetup = dt?.data?.grvSetup;
    this.loaded = dt?.data?.loaded; ///da load data Vll
    //vll
    this.processNo = dt?.data?.processNo; //de sinh vll
    this.maxNumber = dt?.data?.maxNumber ?? 0;
    this.listVllCus = dt?.data?.listVllCus ?? [];
    this.listVll = dt?.data?.listVll ?? [];

    if (this.action == 'add' || this.action == 'copy')
      this.column.recID = Util.uid();
  }

  ngOnInit(): void {
    if (this.column?.dataType == 'L' && this.column?.dataFormat == 'V')
      this.loadDataVll();
  }

  async valueChange(e) {
    if (e.field == 'multiselect') {
      this.column[e.field] = e.data;
      return;
    }
    if (e && e.data && e.field) this.column[e.field] = e.data;
    if (e.field == 'title' || e.field == 'fieldName') {
      this.removeAccents(e.data);
    }

    if (e.field == 'dataFormat' && (e.data == 'V' || e.data == 'C')) {
      if (e.data == 'V') this.loadDataVll();
      this.column.refType = e.data == 'C' ? '3' : '2';
      if (this.action != 'edit' && !this.column.refValue) {
        // this.crrVll = new tempVllDP();
        // this.crrVll.language = this.user.language;
        // this.crrVll.createdBy = this.user.userID;
        // this.crrVll.listType = '1'; //luu kieu nao de khanh tinh sau 2
        // this.crrVll.version = 'x00.01';
        // await this.getDefaultVll();
      } else {
        this.crrVll = this.listVllCus.find(
          (x) => x.listName == this.column.refValue
        );
        // this.changeFormVll();
      }
    }

    this.changdef.detectChanges();
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

  cbxChange(value) {
    if (value) this.column['stepID'] = value;
  }

  saveData() {
    if (!this.listColumns || this.listColumns?.length == 0) {
      this.notiService.notify('Bảng dữ liệu chưa được thiết lập', '3'); //chơ mes Khanh
      return;
    }
    if (!this.isChecked && !this.checkValidate()) return;
    this.listColumns.push(JSON.parse(JSON.stringify(this.column)));
    this.dialog.close([this.listColumns, this.processNo]);
    this.column = new ColumnTable(); //tắt bùa
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
    let isExit = this.listColumns.some((x) => x.fieldName == format);
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
            this.dpService.genAutoNumber('DP01', 'DP_Processes', 'ProcessNo')
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

  saveVll() {
    if (!this.crrVll.note || this.crrVll.note.trim() == '') {
      this.notiService.notifyCode('Nội dung vll không được để trống !');
      return;
    }

    if (!this.datasVll || this.datasVll?.length == 0) {
      this.notiService.notifyCode('Danh sách lựa chọn không được để trống !');
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

  // onAddTextValue(e) {
  //   if (!e.value || e.value.trim() == '') return;

  //   let dataValue = {
  //     textValue: e.value,
  //     value: this.datasVll.length,
  //   };

  //   this.datasVll.push(dataValue);

  //   e.value = '';
  //   e.focus();
  //   if (this.viewComboxForm) this.viewComboxForm.refresh();
  //   this.changeRef.detectChanges();
  // }

  // onEditTextValue(e, i) {
  //   if (!e.value || e.value.trim() == '') return;
  //   let dataValue = {
  //     textValue: e.value,
  //     value: i,
  //   };
  //   this.datasVll[i] = dataValue;
  //   let eleAdd = document.getElementById('textAddValue');
  //   if (eleAdd) {
  //     eleAdd.focus();
  //     eleAdd.inputMode = '';
  //   }
  //   this.idxEdit = -1;

  //   if (!this.viewComboxForm) this.viewComboxForm.refresh();
  //   this.changeRef.detectChanges();
  // }

  // onChangeVll(e) {
  //   if (e.column == 'multiSelect') {
  //     this.crrVll[e.column] = e.data;
  //     return;
  //   }
  //   if (e.column == 'listName') {
  //     if (!e.data || e.data.trim() == '') {
  //       this.notiService.notifyCode('Tên value list không được để trống !');
  //       return;
  //     }
  //     if (e.data.includes(' ')) {
  //       this.notiService.notifyCode(
  //         'Tên value list không được chứa khoảng trắng để trống !'
  //       );
  //       return;
  //     }

  //     let fm = e.data.substring(0, 3);
  //     if (fm != this.fomartVll) {
  //       this.notiService.notifyCode(
  //         "Tên value list phải có dạng format 'DPF...' !"
  //       );
  //       return;
  //     }
  //   }

  //   this.crrVll[e.column] = e.data;
  // }

  async loadDataVll() {
    if (this.loaded) return;
    if (!this.processNo) {
      this.processNo = await firstValueFrom(
        this.dpService.genAutoNumber('DP01', 'DP_Processes', 'ProcessNo')
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

  async cbxChangeVll(value, elm) {
    if (elm) this.element = elm;
    this.column['refValue'] = value;
    if (!value) {
      //data form
      // this.crrVll = new tempVllDP();
      // this.crrVll.language = this.user.language;
      // this.crrVll.createdBy = this.user.userID;
      // this.crrVll.listType = '1'; //luu kieu nao de khanh tinh sau 2
      // this.crrVll.version = 'x00.01';
      await this.getDefaultVll();
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

  // deletedValue(i) {
  //   if (i == -1) return;
  //   this.datasVll.splice(i, 1);
  //   // this.idxDeleted = -1;
  //   if (this.viewComboxForm) this.viewComboxForm.refresh();
  // }

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
            this.dpService.genAutoNumber('DP01', 'DP_Processes', 'ProcessNo')
          );

        this.crrVll.listName = 'DPF' + this.processNo + '-' + this.maxNumber;
      } else {
        timeOut += 500;
        this.getDefaultVll(timeOut);
      }
    }, timeOut);
  }

  saveDataAndContinue() {
    if (!this.checkValidate()) return;
    this.listColumns.push(JSON.parse(JSON.stringify(this.column)));
    this.column = new ColumnTable();
    this.column.recID = Util.uid();
    this.column.fieldName = '';
    this.column.dataType = null;
    this.form.formGroup.patchValue(this.column);
    this.changeRef.detectChanges();
    this.isChecked = true;
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

    if (this.column.dataType == 'L' && !this.column.refType) {
      this.notiService.notifyCode(
        'SYS009',
        0,
        '"' + this.grvSetup['RefType']?.headerText + '"'
      );
      return false;
    }

    if (this.column.dataType == 'L' && !this.column.refValue) {
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
}
