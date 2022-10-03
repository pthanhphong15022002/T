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
    this.dialog.formModel = this.formModel;

    this.esService.setCacheFormModel(this.formModel);
    this.esService
      .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
      .then((fg) => {
        console.log(fg);
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
              this.esService.isSetupAutoNumber.subscribe((res) => {
                if (res != null) {
                  this.formModel.currentData = this.data;
                  this.dialogAutoNum.patchValue(res.value);
                  this.isAfterRender = true;
                }
              });
              this.setViewAutoNumber();
              console.log(this.data);
            }
          });
        }
      });
    this.getVll();
  }

  getVll() {
    this.cache
      .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
      .subscribe((gv) => {
        if (gv) {
          this.cache
            .valueList(gv['DateFormat']?.referedValue ?? 'L0088')
            .subscribe((vllDFormat) => {
              this.vllDateFormat = vllDFormat.datas;
              this.setViewAutoNumber();
            });

          this.cache
            .valueList(gv['StringFormat']?.referedValue ?? 'L0089')
            .subscribe((vllSFormat) => {
              this.vllStringFormat = vllSFormat.datas;
              this.setViewAutoNumber();
            });
        }
      });
  }

  valueChange(event: any, field: string = '') {
    if (!field) field = event?.field;
    if (field && event.component) {
      this.data[field] = event.data;
      this.setViewAutoNumber();
      this.cr.detectChanges();
    }
  }

  onSaveForm() {
    if (this.dialogAutoNum.invalid == true) {
      this.esService.notifyInvalid(
        this.dialogAutoNum,
        this.formModel,
        this.data
      );
      return;
    }

    if (this.isAdd) {
      this.data.lastNumber = 0;
      this.data.step = 1;
      this.data.description = 'description';
    }

    if (this.isAdd) {
      this.esService
        .addEditAutoNumbers(this.data, this.isAdd)
        .subscribe((res) => {
          if (res) {
            this.dialogAutoNum.patchValue(this.data);
            this.esService.setupAutoNumber.next(this.dialogAutoNum);
            if (this.isAdd) {
              this.esService.getAutoNoCode(res.recID);
            }
            this.dialog && this.dialog.close();
          }
        });
    } else {
      this.dialogAutoNum.patchValue(this.data);
      this.esService.setupAutoNumber.next(this.dialogAutoNum);
      this.dialog && this.dialog.close();
      this.cr.detectChanges();
    }
  }

  setViewAutoNumber() {
    if (this.vllStringFormat && this.vllDateFormat && this.data) {
      let indexStrF = this.vllStringFormat.findIndex(
        (p) => p.value == this.data?.stringFormat
      );
      let indexDF = this.vllDateFormat.findIndex(
        (p) => p.value == this.data?.dateFormat
      );
      let stringFormat = '';
      let dateFormat = '';
      if (indexStrF >= 0) {
        stringFormat = this.vllStringFormat[indexStrF].text;
        stringFormat = stringFormat.replace(/&/g, '-').replace(/\s/g, '');
      }

      // replace chuỗi và dấu phân cách
      stringFormat = stringFormat
        .replace(/-/g, this.data?.separator == null ? '' : this.data?.separator)
        .replace(
          'Chuỗi',
          this.data?.fixedString == null ? '' : this.data?.fixedString
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
      let lengthNumber = this.data?.maxLength - stringFormat.length + 2;
      if (lengthNumber < 0) {
        stringFormat = stringFormat.replace('Số', '');
        stringFormat = stringFormat.substring(0, this.data?.maxLength);
      } else if (lengthNumber == 0) {
        stringFormat = stringFormat.replace('Số', '');
      } else {
        let strNumber = '#'.repeat(lengthNumber);
        stringFormat = stringFormat.replace('Số', strNumber);
      }
      this.viewAutoNumber = stringFormat;
      console.log(this.viewAutoNumber);

      this.cr.detectChanges();
    } else {
      this.getVll();
    }
  }

  prarseInt(data) {
    return parseInt(data);
  }
}
