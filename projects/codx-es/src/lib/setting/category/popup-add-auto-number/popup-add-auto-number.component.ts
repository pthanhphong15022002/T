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
  lastNumber = '';

  cbxName: object;
  vllStringFormat;
  vllDateFormat;

  isAdd: boolean = true;

  headerText = 'Thiết lập số tự động';
  subHeaderText = '';
  parent: FormGroup;
  constructor(
    private api: ApiHttpService,
    private auth: AuthStore,
    private cache: CacheService,
    private cr: ChangeDetectorRef,
    private fb: FormBuilder,
    private esService: CodxEsService,
    private codxService: CodxService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.formModelData = data?.data[0].formModel;
    this.autoNoCode = data?.data[0].autoNoCode;
    this.isAdd = data?.data[0].isAdd;
    this.parent = data.data[0].formGroup;
  }

  ngAfterViewInit(): void {
    this.cache.valueList('L0088').subscribe((vllDFormat) => {
      this.vllDateFormat = vllDFormat.datas;
      console.log(this.vllDateFormat);
    });

    this.cache.valueList('L0089').subscribe((vllSFormat) => {
      this.vllStringFormat = vllSFormat.datas;
      console.log(this.vllStringFormat);
    });
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.formModel = new FormModel();
    this.formModel.entityName = 'AD_AutoNumbers';
    this.formModel.formName = 'AutoNumbers';
    this.formModel.gridViewName = 'grvAutoNumbers';
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) {
          this.dialogAutoNum = res;
          this.isAfterRender = true;
          this.dialogAutoNum.patchValue({
            lastNumber: this.parent.value.lastNumber,
          });

          if (this.isAdd) {
            this.codxService
              .getAutoNumber(
                this.formModel.funcID,
                this.formModel.entityName,
                'AutoNoCode'
              )
              .subscribe((dt: any) => {
                this.dialogAutoNum.patchValue({ autoNoCode: dt });
              });
          } else {
            if (this.autoNoCode) {
              this.dialogAutoNum.patchValue({ autoNoCode: this.autoNoCode });
            }
          }
        }
      });

    this.esService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) {
          this.cbxName = res;
          console.log(res['DateFormat']);
          console.log('cbxName', this.cbxName);
          this.cache.valueList('L0088').subscribe((vllDFormat) => {
            this.vllDateFormat = vllDFormat.datas;
            console.log(this.vllDateFormat);
          });

          this.cache.valueList('L0089').subscribe((vllSFormat) => {
            this.vllStringFormat = vllSFormat.datas;
            console.log(this.vllStringFormat);
          });
        }
      });
  }

  valueChange(event: any) {
    if (event?.field) {
      if (event?.data === Object(event?.data))
        this.dialogAutoNum.patchValue({ [event['field']]: event.data.value });
      else this.dialogAutoNum.patchValue({ [event['field']]: event.data });
    }

    this.setLastNumber();
    this.cr.detectChanges();
  }

  onSaveForm() {
    if (this.dialogAutoNum.invalid == true) {
      return;
    }
    this.dialogAutoNum.value.description = this.dialogAutoNum.value.lastNumber;
    this.dialogAutoNum.value.lastNumber = 0;
    this.dialogAutoNum.value.step = 1;
    // let res = this.esService.addEditAutoNumbers(this.dialogAutoNum, this.isAdd);
    // this.esService
    //   .addEditAutoNumbers(this.dialogAutoNum, this.isAdd)
    //   .subscribe((res) => {
    //     console.log(res);
    //   });
    this.api
      .callSv(
        'SYS',
        'ERM.Business.AD',
        'AutoNumbersBusiness',
        'SettingAutoNumberAsync',
        [this.dialogAutoNum.value, this.isAdd]
      )
      .subscribe((res) => {
        console.log(res);
      });
  }

  setLastNumber() {
    let indexStrF = this.vllStringFormat.findIndex(
      (p) => p.value == this.dialogAutoNum.value.stringFormat.toString()
    );
    let indexDF = this.vllDateFormat.findIndex(
      (p) => p.value == this.dialogAutoNum.value.dateFormat?.toString()
    );
    let stringFormat = '';
    let dateFormat = '';
    if (indexStrF >= -1) {
      stringFormat = this.vllStringFormat[indexStrF].text;
      stringFormat = stringFormat.replace(/&/g, '-').replace(/\s/g, '');
    }

    // replace chuỗi và dấu phân cách
    stringFormat = stringFormat
      .replace(
        'Chuỗi',
        this.dialogAutoNum.value.fixedString == null
          ? ''
          : this.dialogAutoNum.value.fixedString
      )
      .replace(
        /-/g,
        this.dialogAutoNum.value.separator == null
          ? ''
          : this.dialogAutoNum.value.separator
      );

    //replace ngày
    if (indexDF >= 0) {
      console.log(this.vllDateFormat[indexDF].text);

      dateFormat =
        this.vllDateFormat[indexDF].text == 'None'
          ? ''
          : this.vllDateFormat[indexDF].text;
    }
    stringFormat = stringFormat.replace('Ngày', dateFormat);

    //replace số và set chiều dài
    let lengthNumber =
      this.dialogAutoNum.value.maxLength - stringFormat.length - 2;
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
    console.log(stringFormat);

    this.dialogAutoNum.patchValue({ lastNumber: stringFormat });
    this.cr.detectChanges();
  }
}
