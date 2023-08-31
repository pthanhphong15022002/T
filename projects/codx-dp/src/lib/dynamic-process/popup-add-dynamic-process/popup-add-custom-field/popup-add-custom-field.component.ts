import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  SliderTickEventArgs,
  SliderTickRenderedEventArgs,
} from '@syncfusion/ej2-angular-inputs';
import {
  CacheService,
  CodxFormComponent,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { DP_Steps_Fields } from '../../../models/models';

@Component({
  selector: 'lib-popup-add-custom-field',
  templateUrl: './popup-add-custom-field.component.html',
  styleUrls: ['./popup-add-custom-field.component.css'],
})
export class PopupAddCustomFieldComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;

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

  constructor(
    private changdef: ChangeDetectorRef,
    private cache: CacheService,
    private notiService: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
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
    // if (!this.field.recID) this.field.recID = Util.uid();
    // this.changdef.detectChanges();
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
}
