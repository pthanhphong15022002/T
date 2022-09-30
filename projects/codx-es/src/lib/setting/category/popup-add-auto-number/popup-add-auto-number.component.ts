import { ifStmt } from '@angular/compiler/src/output/output_ast';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CodxService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
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
  formModel: FormModel;
  formModelData: FormModel;
  autoNoCode;
  viewAutoNumber = '';

  cbxName: object;
  vllStringFormat;
  vllDateFormat;

  data: any = {};

  isAdd: boolean = true;

  headerText = 'Thiết lập số tự động';
  subHeaderText = '';
  constructor(
    private cache: CacheService,
    private cr: ChangeDetectorRef,
    private esService: CodxEsService,
    private auth: AuthStore,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.formModelData = data?.data?.formModel;
    this.autoNoCode = data?.data?.autoNoCode;
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

    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((fg) => {
        console.log(fg);

        if (fg) {
          this.dialogAutoNum = fg;
          this.esService.getAutoNumber(this.autoNoCode).subscribe((res) => {
            if (res != null) {
              this.data = res;
              this.formModel.currentData = this.data;
              if (res.autoNoCode != null) {
                this.isAdd = false;
                this.dialogAutoNum.patchValue(res);
                this.isAfterRender = true;
                this.setViewAutoNumber();
              } else {
                this.isAdd = true;
                res.autoNoCode = this.autoNoCode;
                this.dialogAutoNum.patchValue(res);
                this.isAfterRender = true;
              }
              this.esService.isSetupAutoNumber.subscribe((res) => {
                if (res != null) {
                  this.dialogAutoNum.patchValue(res.value);
                  this.isAfterRender = true;
                }
              });
              this.setViewAutoNumber();
              console.log(this.dialogAutoNum.value);
            }
          });
        }
      });

    this.esService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) {
          this.cbxName = res;
          console.log('cbxName', this.cbxName);
          this.cache.valueList('L0088').subscribe((vllDFormat) => {
            this.vllDateFormat = vllDFormat.datas;
          });

          this.cache.valueList('L0089').subscribe((vllSFormat) => {
            this.vllStringFormat = vllSFormat.datas;
          });
        }
      });
  }

  valueChange(event: any, field: string = '') {
    if (!field) field = event?.field;
    if (field && event.component) {
      if (event?.data === Object(event?.data))
        this.dialogAutoNum.patchValue({ [event['field']]: event.data.value });
      else this.dialogAutoNum.patchValue({ [event['field']]: event.data });
      this.setViewAutoNumber();
    }
  }

  onSaveForm() {
    if (this.dialogAutoNum.invalid == true) {
      this.esService.notifyInvalid(this.dialogAutoNum, this.formModel);
      return;
    }

    if (this.isAdd) {
      this.dialogAutoNum.value.lastNumber = 0;
      this.dialogAutoNum.value.step = 1;
      this.dialogAutoNum.value.description = 'description';
    }

    if (this.isAdd) {
      this.esService
        .addEditAutoNumbers(this.dialogAutoNum, this.isAdd)
        .subscribe((res) => {
          if (res) {
            this.esService.setupAutoNumber.next(this.dialogAutoNum);
            if (this.isAdd) {
              this.esService.getAutoNoCode(res.recID);
            }
            this.dialog && this.dialog.close();
          }
        });
    } else {
      this.esService.setupAutoNumber.next(this.dialogAutoNum);
      this.dialog && this.dialog.close();
      this.cr.detectChanges();
    }
  }

  setViewAutoNumber() {
    debugger;
    let indexStrF = this.vllStringFormat.findIndex(
      (p) => p.value == this.dialogAutoNum.value.stringFormat
    );
    let indexDF = this.vllDateFormat.findIndex(
      (p) => p.value == this.dialogAutoNum.value.dateFormat
    );
    let stringFormat = '';
    let dateFormat = '';
    if (indexStrF >= 0) {
      stringFormat = this.vllStringFormat[indexStrF].text;
      stringFormat = stringFormat.replace(/&/g, '-').replace(/\s/g, '');
    }

    // replace chuỗi và dấu phân cách
    stringFormat = stringFormat
      .replace(
        /-/g,
        this.dialogAutoNum.value.separator == null
          ? ''
          : this.dialogAutoNum.value.separator
      )
      .replace(
        'Chuỗi',
        this.dialogAutoNum.value.fixedString == null
          ? ''
          : this.dialogAutoNum.value.fixedString
      );

    //replace ngày
    if (indexDF >= 0) {
      dateFormat =
        this.vllDateFormat[indexDF].text == 'None'
          ? ''
          : this.vllDateFormat[indexDF].text;
    }
    stringFormat = stringFormat.replace('Ngày', dateFormat);

    //replace số và set chiều dài
    let lengthNumber =
      this.dialogAutoNum.value.maxLength - stringFormat.length + 2;
    if (lengthNumber < 0) {
      stringFormat = stringFormat.replace('Số', '');
      stringFormat = stringFormat.substring(
        0,
        this.dialogAutoNum.value.maxLength
      );
    } else if (lengthNumber == 0) {
      stringFormat = stringFormat.replace('Số', '');
    } else {
      let strNumber = '#'.repeat(lengthNumber);
      stringFormat = stringFormat.replace('Số', strNumber);
    }
    this.viewAutoNumber = stringFormat;
    console.log(this.viewAutoNumber);

    this.cr.detectChanges();
  }

  prarseInt(data) {
    return parseInt(data);
  }
}
