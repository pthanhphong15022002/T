import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  UIComponent,
  CodxFormComponent,
  DialogRef,
  FormModel,
  CacheService,
  ApiHttpService,
  CallFuncService,
  NotificationsService,
  DialogData,
} from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { CashPaymentLine } from '../../models/CashPaymentLine.model';

@Component({
  selector: 'lib-pop-add-linecash',
  templateUrl: './pop-add-linecash.component.html',
  styleUrls: ['./pop-add-linecash.component.css'],
})
export class PopAddLinecashComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  dialog!: DialogRef;
  headerText: string;
  formModel: FormModel;
  gridViewSetup: any;
  validate: any = 0;
  type: any;
  cashpaymentline: CashPaymentLine;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.cashpaymentline = dialogData.data?.data;
    this.type = dialogData.data?.type;
    this.cache
      .gridViewSetup('CashPaymentsLines', 'grvCashPaymentsLines')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    //this.form.formGroup.patchValue(this.purchaseInvoicesLines);
  }
  close() {
    this.dialog.close();
  }
  valueChange(e: any) {
    this.cashpaymentline[e.field] = e.data;
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.cashpaymentline);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.cashpaymentline[keymodel[i]] == null ||
              String(this.cashpaymentline[keymodel[i]]).match(/^ *$/) !== null
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
  onSave() {
    switch (this.type) {
      case 'add':
        this.checkValidate();
        if (this.validate > 0) {
          this.validate = 0;
          return;
        }
        break;
      case 'edit':
        this.api
          .exec('AC', 'CashPaymentsLinesBusiness', 'UpdateLineAsync', [
            this.cashpaymentline,
          ])
          .subscribe((res: any) => {});
        break;
    }
    window.localStorage.setItem(
      'dataline',
      JSON.stringify(this.cashpaymentline)
    );
    this.dialog.close();
  }
}
