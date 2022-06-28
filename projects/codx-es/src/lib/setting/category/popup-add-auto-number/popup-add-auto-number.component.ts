import { Component, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  AuthStore,
  CacheService,
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
export class PopupAddAutoNumberComponent implements OnInit {
  dialogAutoNum: FormGroup;
  dialog: DialogRef;
  isAfterRender = false;
  formModel: FormModel;
  formModelData: FormModel;
  autoNoCode;
  lastNumber = '';

  cbxName;
  vllStringFormat;
  vllDateFormat;

  isAdd: boolean = true;

  headerText = 'Thiết lập số tự động';
  subHeaderText = '';

  constructor(
    private auth: AuthStore,
    private cache: CacheService,
    private fb: FormBuilder,
    private esService: CodxEsService,
    @Optional() dialog: DialogRef,
    @Optional() data: DialogData
  ) {
    this.dialog = dialog;
    this.formModelData = data?.data[0];
    this.autoNoCode = data?.data[1];
    this.isAdd = data?.data[2];
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
          console.log(res);

          this.dialogAutoNum = res;
          this.isAfterRender = true;
        }
      });

    // this.cbxName = this.esService.getComboboxName1(
    //   this.formModel.formName,
    //   this.formModel.gridViewName
    // );
    // console.log('cbxName', this.cbxName);

    // console.log(this.cbxName.DateFormat);

    this.esService
      .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
      .then((res) => {
        if (res) {
          debugger;
          this.cbxName = res;
          console.log('cbxName', this.cbxName);
          let obj = JSON.parse(JSON.stringify(res));
          console.log(obj);

          console.log('cbxName', this.cbxName['StringFormat']);

          this.cache
            .valueList(this.cbxName['DateFormat'])
            .subscribe((vllDFormat) => {
              this.vllDateFormat = vllDFormat.datas;
              console.log(this.vllDateFormat);
            });

          this.cache
            .valueList(this.cbxName['StringFormat'])
            .subscribe((vllSFormat) => {
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
  }

  onSaveForm() {
    if (this.dialogAutoNum.invalid == true) {
      return;
    }

    let res = this.esService.addEditAutoNumbers(this.dialogAutoNum, this.isAdd);
    console.log('result', res);
  }
}
