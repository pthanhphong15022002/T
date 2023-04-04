import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
} from 'codx-core';
import { log } from 'console';
import { CodxEsService } from '../../../codx-es.service';

@Component({
  selector: 'lib-popup-add-auto-number',
  templateUrl: './popup-add-auto-number.component.html',
  styleUrls: ['./popup-add-auto-number.component.scss'],
})
export class PopupAddAutoNumberComponent implements OnInit, AfterViewInit {
  dialogAutoNum: FormGroup;
  dialog: DialogRef;
  isAfterRender = false;
  afterFgANumberDefault = false;
  formModel: FormModel;
  fmANumberDefault: FormModel;
  fgANumberDefault: FormGroup;
  functionID;
  // formModelData: FormModel;
  autoNoCode;
  newAutoNoCode;
  isSaveNew: string = '0';
  viewAutoNumber = '';
  description = '';

  lstEnableSeparator = ['0', '1', '2', '3', '4'];

  cbxName: object;
  vllStringFormat;
  vllDateFormat;
  invalidValue = false;

  data: any = {};
  autoDefaultData: any;

  isAdd: boolean = true;

  headerText = 'Thiết lập số tự động';
  subHeaderText = '';
  constructor(
    private cache: CacheService,
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private auth: AuthStore,
    private notify: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    // this.formModelData = data?.data?.formModel;
    this.autoNoCode = data?.data?.autoNoCode;

    this.description = data?.data?.description;

    // Thiết lập số tự động mặc định của function
    this.functionID = data?.data?.functionID;

    //tao moi autoNumber theo autoNumber mẫu
    this.newAutoNoCode = data?.data?.newAutoNoCode;
    this.isSaveNew = data?.data?.isSaveNew ?? '0';

    // delete this.cbxName.
  }

  ngAfterViewInit(): void {}

  ngOnInit(): void {
    this.initForm();
  }

  getViewAutoNumber(dialog) {
    this.setViewAutoNumber();
    return this.viewAutoNumber;
  }

  initForm() {
    this.formModel = new FormModel();
    this.formModel.entityName = 'AD_AutoNumbers';
    this.formModel.formName = 'AutoNumbers';
    this.formModel.gridViewName = 'grvAutoNumbers';
    this.dialog.formModel = this.formModel;

    if (this.functionID) {
      this.fmANumberDefault = new FormModel();
      this.fmANumberDefault.entityName = 'AD_AutoNumberDefaults';
      this.fmANumberDefault.formName = 'AutoNumberDefaults';
      this.fmANumberDefault.gridViewName = 'grvAutoNumberDefaults';

      this.esService
        .getFormGroup(
          this.fmANumberDefault.formName,
          this.fmANumberDefault.gridViewName
        )
        .then((res) => {
          if (res) {
            this.fgANumberDefault = res;
            this.esService
              .getAutoNumberDefaults(this.functionID)
              .subscribe((model) => {
                if (model) {
                  model.autoNumber = this.autoNoCode;
                  this.fmANumberDefault.currentData = model;
                  this.autoDefaultData = model;
                  this.fgANumberDefault.patchValue(this.autoDefaultData);
                  this.cr.detectChanges();
                  this.afterFgANumberDefault = true;
                }
              });
          }
        });

      this.esService.getAutoNumber;
    }

    this.esService.setCacheFormModel(this.formModel);
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((fg) => {
        if (fg) {
          this.dialogAutoNum = fg;
          this.esService.getAutoNumber(this.autoNoCode).subscribe((res) => {
            if (res != null) {
              this.data = res;
              if (res.autoNoCode != null) {
                this.isAdd = false;
                this.formModel.currentData = this.data;
                this.dialogAutoNum.patchValue(res);
                this.isAfterRender = true;
                this.setViewAutoNumber();
              } else {
                this.isAdd = true;
                res.autoNoCode = this.autoNoCode;
                this.formModel.currentData = this.data;
                this.dialogAutoNum.patchValue(res);
                this.isAfterRender = true;
              }

              this.setViewAutoNumber();
            }
          });
        }
      });
    this.getVll();
  }

  getVll() {
    let i = 0;
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((gv) => {
        if (gv) {
          this.cache
            .valueList(gv['DateFormat']?.referedValue ?? 'L0088')
            .subscribe((vllDFormat) => {
              this.vllDateFormat = vllDFormat.datas;
              i++;
              if (i == 2) {
                this.setViewAutoNumber();
              }
            });

          this.cache
            .valueList(gv['StringFormat']?.referedValue ?? 'L0089')
            .subscribe((vllSFormat) => {
              this.vllStringFormat = vllSFormat.datas;
              i++;
              if (i == 2) {
                this.setViewAutoNumber();
              }
            });
        }
      });
  }

  valueChange(event: any, field: string = '') {
    if (!field) field = event?.field;
    if (field && event.component) {
      this.data[field] = event.data;
      if (
        field == 'stringFormat' &&
        !this.lstEnableSeparator.includes(event.data)
      ) {
        this.data.separator = '';
        this.dialogAutoNum.patchValue({ separator: '' });
      }

      if (field != 'autoReset') this.setViewAutoNumber();
      this.cr.detectChanges();
    }
  }

  onSaveForm() {
    if (this.dialogAutoNum.invalid == true) {
      this.esService.notifyInvalid(this.dialogAutoNum, this.formModel);
      return;
    }

    if (this.invalidValue) {
      this.notify.notifyCode('AD018');
      return;
    }

    if (this.isSaveNew == '1') {
      delete this.data.id;
      delete this.data.recID;
      this.data.autoNoCode = this.newAutoNoCode;
      this.data.description = this.description;
      this.esService.addEditAutoNumbers(this.data, true).subscribe((res) => {
        if (res) {
          this.dialogAutoNum.patchValue(this.data);
          this.dialog && this.dialog.close(res);
        }
      });
    } else {
      if (this.isAdd) {
        this.data.lastNumber = 0;
        this.data.step = 1;
        this.data.description = 'description';
        if (this.description) {
          this.data.description = this.description;
        }
      }

      this.esService
        .addEditAutoNumbers(this.data, this.isAdd)
        .subscribe((res) => {
          if (res) {
            this.dialogAutoNum.patchValue(this.data);
            this.dialog && this.dialog.close(res);
          }
        });
    }

    if (this.functionID) {
      this.esService
        .updateAutoNumberDefaults(this.autoDefaultData)
        .subscribe((res) => {
          if (res) {
            this.autoDefaultData = res;
          }
        });
    }
  }

  setViewAutoNumber() {
    if (this.vllStringFormat && this.vllDateFormat && this.data) {
      let dateFormat = '';
      if (this.data?.dateFormat != '0') {
        dateFormat =
          this.vllDateFormat.filter((p) => p.value == this.data?.dateFormat)[0]
            ?.text ?? '';
      }

      let lengthNumber;
      let strNumber = '';

      switch (this.data?.stringFormat) {
        // {value: '0', text: 'Chuỗi & Ngày - Số', default: 'Chuỗi & Ngày - Số', color: null, textColor: null, …}
        case '0': {
          this.viewAutoNumber =
            this.data?.fixedString + dateFormat + this.data?.separator;
          lengthNumber = this.data?.maxLength - this.viewAutoNumber.length;
          if (lengthNumber <= 0) {
            this.invalidValue = true;
          } else {
            this.invalidValue = false;
            strNumber = '#'.repeat(lengthNumber);
          }
          this.viewAutoNumber =
            this.data?.fixedString +
            dateFormat +
            this.data?.separator +
            strNumber;
          break;
        }
        // {value: '1', text: 'Chuỗi & Số - Ngày', default: 'Chuỗi & Số - Ngày', color: null, textColor: null, …}
        case '1': {
          this.viewAutoNumber =
            this.data?.fixedString + this.data?.separator + dateFormat;
          lengthNumber = this.data?.maxLength - this.viewAutoNumber.length;
          if (lengthNumber <= 0) {
            this.invalidValue = true;
          } else {
            this.invalidValue = false;
            strNumber = '#'.repeat(lengthNumber);
          }
          this.viewAutoNumber =
            this.data?.fixedString +
            strNumber +
            this.data?.separator +
            dateFormat;
          break;
        }
        // {value: '2', text: 'Số - Chuỗi & Ngày', default: 'Số - Chuỗi & Ngày', color: null, textColor: null, …}
        case '2': {
          this.viewAutoNumber =
            this.data?.fixedString + this.data?.separator + dateFormat;
          lengthNumber = this.data?.maxLength - this.viewAutoNumber.length;
          if (lengthNumber <= 0) {
            this.invalidValue = true;
          } else {
            this.invalidValue = false;
            strNumber = '#'.repeat(lengthNumber);
          }
          this.viewAutoNumber =
            strNumber +
            this.data?.separator +
            this.data?.fixedString +
            dateFormat;
          break;
        }
        // {value: '3', text: 'Số - Ngày & Chuỗi', default: 'Số - Ngày & Chuỗi', color: null, textColor: null, …}
        case '3': {
          this.viewAutoNumber =
            this.data?.fixedString + this.data?.separator + dateFormat;
          lengthNumber = this.data?.maxLength - this.viewAutoNumber.length;
          if (lengthNumber <= 0) {
            this.invalidValue = true;
          } else {
            this.invalidValue = false;
            strNumber = '#'.repeat(lengthNumber);
          }
          this.viewAutoNumber =
            strNumber +
            this.data?.separator +
            dateFormat +
            this.data?.fixedString;
          break;
        }
        // {value: '4', text: 'Ngày - Số & Chuỗi', default: 'Ngày - Số & Chuỗi', color: null, textColor: null, …}
        case '4': {
          this.viewAutoNumber =
            this.data?.fixedString + this.data?.separator + dateFormat;
          lengthNumber = this.data?.maxLength - this.viewAutoNumber.length;
          if (lengthNumber <= 0) {
            this.invalidValue = true;
          } else {
            this.invalidValue = false;
            strNumber = '#'.repeat(lengthNumber);
          }
          this.viewAutoNumber =
            dateFormat +
            this.data?.separator +
            strNumber +
            this.data?.fixedString;
          break;
        }
        // {value: '5', text: 'Ngày & Chuỗi & Số', default: 'Ngày & Chuỗi & Số', color: null, textColor: null, …}
        case '5': {
          this.viewAutoNumber = this.data?.fixedString + dateFormat;
          lengthNumber = this.data?.maxLength - this.viewAutoNumber.length;
          if (lengthNumber <= 0) {
            this.invalidValue = true;
          } else {
            this.invalidValue = false;
            strNumber = '#'.repeat(lengthNumber);
          }
          this.viewAutoNumber = dateFormat + this.data?.fixedString + strNumber;
          break;
        }
        // {value: '6', text: 'Chuỗi - Ngày', default: 'Chuỗi - Ngày', color: null, textColor: null, …}
        case '6': {
          this.viewAutoNumber =
            this.data?.fixedString + this.data?.separator + dateFormat;
          break;
        }
        // {value: '7', text: 'Ngày - Chuỗi', default: 'Ngày - Chuỗi', color: null, textColor: null, …}
        case '7': {
          this.viewAutoNumber =
            dateFormat + this.data?.separator + this.data?.fixedString;
          break;
        }
      }

      this.viewAutoNumber = this.viewAutoNumber.substring(
        0,
        this.data?.maxLength
      );

      //   let indexStrF = this.vllStringFormat.findIndex(
      //     (p) => p.value == this.data?.stringFormat
      //   );
      //   let indexDF = this.vllDateFormat.findIndex(
      //     (p) => p.value == this.data?.dateFormat
      //   );
      //   let stringFormat = '';
      //   let dateFormat = '';
      //   if (indexStrF >= 0) {
      //     stringFormat = this.vllStringFormat[indexStrF].text;
      //     stringFormat = stringFormat.replace(/&/g, '-').replace(/\s/g, '');
      //   }

      //   // replace dấu phân cách và chuỗi
      //   stringFormat = stringFormat
      //     .replace(/-/g, this.data?.separator == null ? '' : this.data?.separator)
      //     .replace(
      //       'Chuỗi',
      //       this.data?.fixedString == null ? '' : this.data?.fixedString
      //     );

      //   //replace ngày
      //   if (indexDF >= 0) {
      //     dateFormat =
      //       this.vllDateFormat[indexDF].text == 'None'
      //         ? ''
      //         : this.vllDateFormat[indexDF].text;
      //   }
      //   if (dateFormat == '') {
      //     let sIndex = stringFormat.indexOf('Ngày');
      //     if (stringFormat[sIndex] == this.data?.separator) {
      //       //alert('1111111111');
      //     }
      //   }
      //   stringFormat = stringFormat.replace('Ngày', dateFormat);

      //   //replace số và set chiều dài
      //   let lengthNumber = this.data?.maxLength - stringFormat.length + 2;
      //   if (lengthNumber < 0) {
      //     stringFormat = stringFormat.replace('Số', '');
      //     stringFormat = stringFormat.substring(0, this.data?.maxLength);
      //   } else if (lengthNumber == 0) {
      //     stringFormat = stringFormat.replace('Số', '');
      //   } else {
      //     let strNumber = '#'.repeat(lengthNumber);
      //     stringFormat = stringFormat.replace('Số', strNumber);
      //   }
      //   this.viewAutoNumber = stringFormat;
      this.cr.detectChanges();
    } else {
      this.getVll();
    }
  }

  prarseInt(data) {
    return parseInt(data);
  }

  blur(event){
    console.log('blur', event);
    setTimeout(() => {
      if(this.invalidValue){
        this.notify.notifyCode('AD018');
      }
    }, 500);setTimeout
  }
}
