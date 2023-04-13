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
  CodxInputComponent,
} from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { CashReceiptsLines } from '../../models/CashReceiptsLines.model';
import { JournalService } from '../../journals/journals.service';

@Component({
  selector: 'lib-pop-add-linereceipts',
  templateUrl: './pop-add-linereceipts.component.html',
  styleUrls: ['./pop-add-linereceipts.component.css'],
})
export class PopAddLinereceiptsComponent extends UIComponent implements OnInit {
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('cbxAccountID') cbxAccountID: CodxInputComponent;
  @ViewChild('cbxOffsetAcctID') cbxOffsetAcctID: CodxInputComponent;
  dialog!: DialogRef;
  headerText: string;
  formModel: FormModel;
  gridViewSetup: any;
  validate: any = 0;
  type: any;
  cashreceiptslines: CashReceiptsLines;
  constructor(
    private inject: Injector,
    cache: CacheService,
    private acService: CodxAcService,
    api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    private journalService: JournalService,
    @Optional() dialog?: DialogRef,
    @Optional() private dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.cashreceiptslines = dialogData.data?.data;
    this.type = dialogData.data?.type;
    this.cache
      .gridViewSetup('CashReceiptsLines', 'grvCashReceiptsLines')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }

  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.cashreceiptslines);

    this.journalService.setAccountCbxDataSourceByJournal(
      this.dialogData.data.journal,
      this.cbxAccountID,
      this.cbxOffsetAcctID
    );

    this.form.formGroup.patchValue({
      accountID: this.cbxAccountID.crrValue,
      offsetAcctID: this.cbxOffsetAcctID.crrValue,
    });
  }
  close() {
    this.dialog.close();
  }
  valueChange(e) {
    this.cashreceiptslines[e.field] = e.data;
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.cashreceiptslines);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.cashreceiptslines[keymodel[i]] == null ||
              String(this.cashreceiptslines[keymodel[i]]).match(/^ *$/) !== null
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
    window.localStorage.setItem(
      'dataline',
      JSON.stringify(this.cashreceiptslines)
    );
    this.dialog.close();
  }
}
