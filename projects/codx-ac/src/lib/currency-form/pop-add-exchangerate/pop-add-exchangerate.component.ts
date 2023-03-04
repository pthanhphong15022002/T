import { formatDate } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { Currency } from '../../models/Currency.model';
import { ExchangeRates } from '../../models/ExchangeRates.model';

@Component({
  selector: 'lib-pop-add-exchangerate',
  templateUrl: './pop-add-exchangerate.component.html',
  styleUrls: ['./pop-add-exchangerate.component.css'],
})
export class PopAddExchangerateComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  @Input() headerText: string;
  dialog!: DialogRef;
  formModel: FormModel;
  exchangerate: ExchangeRates;
  objectExchange: Array<ExchangeRates> = [];
  gridViewSetup: any;
  validate: any = 0;
  type: any;
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.objectExchange = dialogData.data?.dataex;
    this.type = dialogData.data?.type;
    this.exchangerate = dialog.formModel.currentData;
    this.cache
      .gridViewSetup('ExchangeRates', 'grvExchangeRates')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    if (dialogData.data?.data != null) {
      this.exchangerate = dialogData.data?.data;
    }
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.exchangerate.recID = Guid.newGuid();
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
    this.exchangerate[e.field] = e.data;
  }
  //#endregion

  //#region Function
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.exchangerate);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.exchangerate[keymodel[i]] == null ||
              this.exchangerate[keymodel[i]] == ''
            ) {
              this.notification.notifyCode(
                'SYS009',
                0,
                '"' + this.gridViewSetup[keygrid[index]].headerText + '"'
              );
              this.validate++;
            }
          }
        }
      }
    }
  }
  clearExchangerate() {
    this.form.formGroup.reset();
    this.exchangerate = new ExchangeRates();
    this.exchangerate.recID = Guid.newGuid();
    this.exchangerate.toTime = new Date();
  }
  //#endregion

  //#region Method
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (isNaN(this.exchangerate.exchangeRate)) {
        this.notification.notify('Tỷ giá phải là số', '2');
        this.validate++;
        return;
      }
      window.localStorage.setItem(
        'dataexchangeRate',
        JSON.stringify(this.exchangerate)
      );
      this.dialog.close();
    }
  }
  onSaveAdd() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (isNaN(this.exchangerate.exchangeRate)) {
        this.notification.notify('Tỷ giá phải là số', '2');
        this.validate++;
        return;
      }
      this.objectExchange.push({ ...this.exchangerate });
      this.clearExchangerate();
    }
  }
  //#endregion
}
//#region Guid
class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}
//#endregion
