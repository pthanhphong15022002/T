import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { ChartOfAccounts } from '../../../models/ChartOfAccounts.model';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-pop-add-accounts',
  templateUrl: './pop-add-accounts.component.html',
  styleUrls: ['./pop-add-accounts.component.css'],
})
export class PopAddAccountsComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  dialog!: DialogRef;
  chartOfAccounts: ChartOfAccounts;
  headerText: any;
  title: any;
  formType: any;
  gridViewSetup: any;
  formModel: FormModel;
  validate: any = 0;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-rule', text: 'Thiết lập', name: 'Establish' },
  ];
  constructor(
    inject: Injector,
    override cache: CacheService,
    override api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.chartOfAccounts = dialog.dataService!.dataSelected;
    if (this.formType == 'add') {
      this.chartOfAccounts.detail = true;
    }
    this.cache
      .gridViewSetup('ChartOfAccounts', 'grvAccountsAC')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    if (this.chartOfAccounts.accountID != null) {
      if (this.chartOfAccounts.loanControl) {
        this.chartOfAccounts.loanControl = '1';
      } else {
        this.chartOfAccounts.loanControl = '0';
      }
    }
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.chartOfAccounts);
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
    this.chartOfAccounts[e.field] = e.data;
  }
  valueChangeloan(e: any) {
    if (e.data == '0') {
      this.chartOfAccounts[e.field] = false;
    } else {
      this.chartOfAccounts[e.field] = true;
    }
  }
  //#endregion

  //#region Function
  setTitle() {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  checkValidate() {
    var keygrid = Object.keys(this.gridViewSetup);
    var keymodel = Object.keys(this.chartOfAccounts);
    for (let index = 0; index < keygrid.length; index++) {
      if (this.gridViewSetup[keygrid[index]].isRequire == true) {
        for (let i = 0; i < keymodel.length; i++) {
          if (keygrid[index].toLowerCase() == keymodel[i].toLowerCase()) {
            if (
              this.chartOfAccounts[keymodel[i]] == null ||
              String(this.chartOfAccounts[keymodel[i]]).match(/^ *$/) !== null
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
  checkLoancontrol() {
    if (this.chartOfAccounts.loanControl == '0') {
      this.chartOfAccounts.loanControl = false;
    } else {
      this.chartOfAccounts.loanControl = true;
    }
  }
  checkSubLGControl(){
    if(this.chartOfAccounts.subLGControl && this.chartOfAccounts.subLGType == null)
    {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['SubLGType'].headerText + '"'
      );
      this.validate++;
    }
  }
  //#endregion

  //#region CRUD
  onSave() {
    if (
      !this.acService.validateFormData(this.form.formGroup, this.gridViewSetup)
    ) {
      return;
    }
    this.checkSubLGControl();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    }
    if (this.formType == 'add' || this.formType == 'copy') {
      this.checkLoancontrol();
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.data = [this.chartOfAccounts];
        })
        .subscribe((res) => {
          if (res && !res.save.error) {
            this.dialog.close(res.save);
          } else {
            this.notification.notifyCode(
              'SYS031',
              0,
              '"' + this.chartOfAccounts.accountID + '"'
            );
            return;
          }
        });
    }
    if (this.formType == 'edit') {
      this.checkLoancontrol();
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'UpdateAsync';
          opt.data = [this.chartOfAccounts];
        })
        .subscribe((res) => {
          if (res.save || res.update) {
            this.dialog.close();
            this.dt.detectChanges();
          }
        });
    }
  }
  //#endregion
}
