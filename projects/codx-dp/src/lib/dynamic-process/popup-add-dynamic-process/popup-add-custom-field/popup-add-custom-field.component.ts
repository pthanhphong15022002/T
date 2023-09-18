import {
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
import { DP_Steps_Fields, tempVllDP } from '../../../models/models';
import { Observable, finalize, map } from 'rxjs';
import { X } from '@angular/cdk/keycodes';
import test from 'node:test';

@Component({
  selector: 'lib-popup-add-custom-field',
  templateUrl: './popup-add-custom-field.component.html',
  styleUrls: ['./popup-add-custom-field.component.css'],
})
export class PopupAddCustomFieldComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('addVll') addVll: TemplateRef<any>;
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
  methodTemp = 'GetVllCustormByFormatAsync';
  requestTemp = new DataRequest();
  user: any;
  crrVll: tempVllDP;
  crrDatasVll: any;
  // view Crr
  datasVllCrr = [];
  fieldsCrrVll = { text: 'textValue', value: 'value' };
  crrValueFirst = '';
  element: any;

  constructor(
    private changdef: ChangeDetectorRef,
    private cache: CacheService,
    private notiService: NotificationsService,
    private callfc: CallFuncService,
    private changeDef: ChangeDetectorRef,
    private authstore: AuthStore,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.user = this.authstore.get();
    this.field = JSON.parse(JSON.stringify(dt?.data?.field));
    this.action = dt?.data?.action;
    this.enabled = dt?.data?.enabled;
    this.refValueDataType = dt?.data?.refValueDataType ?? this.refValueDataType;
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
    //this.field.rank = 5;
    // this.cache
    //   .gridViewSetup('DPStepsFields', 'grvDPStepsFields')
    //   .subscribe((res) => {
    //     if (res) {
    //       this.grvSetup = res;
    //     }
    //   });
  }

  ngOnInit(): void {
    // this.field.dataType = 'L';
    // this.field.dataFormat = 'V';
    // if ((this.field.dataFormat = 'V'))
    // test
    this.loadDataVll();
  }

  valueChangeCbx(e) {}

  valueChange(e) {
    if (e.field == 'multiselect') {
      this.field[e.field] = e.data;
      return;
    }
    if (e && e.data && e.field) this.field[e.field] = e.data;
    if (e.field == 'title' || e.field == 'fieldName')
      this.removeAccents(e.data);
    if (e.field == 'dataFormat' && (e.data == 'V' || e.data == 'C')) {
      this.field.refType = e.data == 'C' ? '3' : '2';
      if (this.action != 'edit' && !this.field.refValue) {
        this.crrVll = new tempVllDP();
        this.crrVll.language = this.user.language;
        this.crrVll.createdBy = this.user.userID;
        this.crrVll.listType = '1'; //luu kieu nao de khanh tinh sau 2
        this.crrVll.version = 'x00.01';
      } else {
        this.crrVll = this.listVllCus.find(
          (x) => x.listName == this.field.refValue
        );
        this.changeFormVll();
      }
    }
    this.changdef.detectChanges();
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

    this.dialog.close(this.field);
  }

  removeAccents(str) {
    var format = str
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
    format = format.replaceAll(' ', '_');
    this.field.fieldName = format;
  }

  clickAddVll() {
    // 'add vll'
    let option = new DialogModel();
    option.FormModel = this.dialog.formModel;
    option.zIndex = 3000;
    this.dialogVll = this.callfc.openForm(this.addVll, '', 500, 500, '');
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
    if (!this.crrVll.listName || this.crrVll.listName.trim() == '') {
      this.notiService.notifyCode('Tên value list không được để trống !');
      return;
    }
    if (this.crrVll.listName.includes(' ')) {
      this.notiService.notifyCode(
        'Tên value list không được chứa khoảng trắng để trống !'
      );
      return;
    }
    let fm = this.crrVll.listName.substring(0, 3);
    if (fm != this.fomartVll) {
      this.notiService.notifyCode(
        "Tên value list phải có dạng format 'DPF...' !"
      );
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
      ? 'EditValuelistCustormAsync'
      : 'AddValuelistCustormAsync';

    this.api
      .execSv('SYS', 'SYS', 'ValueListBusiness', menthol, this.crrVll)
      .subscribe((res) => {
        if (res) {
          this.notiService.notifyCode(checkEdit ? 'SYS007' : 'SYS006');
          this.beforeSaveVll(this.crrVll);
          this.dialogVll.close();
        }
      });
  }

  onAddTextValue(e) {
    if (!e.value || e.value.trim() == '') return;

    let dataValue = {
      textValue: e.value,
      value: this.datasVll.length,
    };

    this.datasVll.push(dataValue);
    this.changeDef.detectChanges();
    e.value = '';
    e.focus();
    // let element = document.getElementById('textAddValue');
    // element.focus();
  }

  onEditTextValue(e, i) {
    if (!e.value || e.value.trim() == '') return;
    let dataValue = {
      textValue: e.value,
      value: i,
    };
    this.datasVll[i] = dataValue;
    let eleAdd = document.getElementById('textAddValue');
    if (eleAdd) {
      eleAdd.focus();
      eleAdd.inputMode = '';
    }
    this.changeDef.detectChanges();
  }

  onChangeVll(e) {
    if (e.field == 'multiSelect') {
      this.crrVll[e.field] = e.data;
      return;
    }
    if (e.field == 'listName') {
      if (!e.data || e.data.trim() == '') {
        this.notiService.notifyCode('Tên value list không được để trống !');
        return;
      }
      if (e.data.includes(' ')) {
        this.notiService.notifyCode(
          'Tên value list không được chứa khoảng trắng để trống !'
        );
        return;
      }

      let fm = e.data.substring(0, 3);
      if (fm != this.fomartVll) {
        this.notiService.notifyCode(
          "Tên value list phải có dạng format 'DPF...' !"
        );
        return;
      }
    }

    this.crrVll[e.field] = e.data;
  }

  loadDataVll() {
    this.requestTemp.entityName = 'SYS_ValueList';
    // this.requestTemp.predicate = 'Language=@0 && ListName.StartsWith(@1)';
    // this.requestTemp.dataValue = this.user.language + ';DPF';
    this.requestTemp.predicate = 'Language=@0 ';
    this.requestTemp.dataValue = this.user.language;
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
      this.changeDef.detectChanges();
      // return this.listVll;
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
  cbxChangeVll(value, elm) {
    if (elm) this.element = elm;

    if (value) {
      this.field['refValue'] = value;
    }
    this.crrDatasVll = this.listVllCus.find((vl) => vl.listName == value);

    if (
      this.crrDatasVll &&
      this.crrDatasVll.listType == '1' &&
      this.crrDatasVll.defaultValues
    ) {
      this.crrVll = this.crrDatasVll;
      this.changeFormVll();
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
      this.listVllCus.push(vll);
      this.listVll.push({
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
        this.element.listData =
          this.element.selectData =
          this.element.sortedData =
            this.listVll;
      }
    }
    this.form.formGroup.patchValue(this.field);
    this.changeDef.detectChanges();
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
}
