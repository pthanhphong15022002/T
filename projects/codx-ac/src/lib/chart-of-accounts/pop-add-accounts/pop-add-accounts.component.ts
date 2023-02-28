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
import { CodxAcService } from '../../codx-ac.service';
import { ChartOfAccounts } from '../../models/ChartOfAccounts.model';

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
  accID: any;
  parID: any;
  subLGType: any;
  validate: any = 0;
  tabInfo: any[] = [
    { icon: 'icon-info', text: 'Thông tin chung', name: 'Description' },
    { icon: 'icon-playlist_add_check', text: 'Thiết lập', name: 'Establish' },
  ];
  constructor(
    private inject: Injector,
    override cache: CacheService,
    private acService: CodxAcService,
    override api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.accID = '';
    this.parID = '';
    this.subLGType = '';
    this.headerText = dialogData.data?.headerText;
    this.formType = dialogData.data?.formType;
    this.chartOfAccounts = dialog.dataService!.dataSelected;
    if (this.formType == 'add') {
      this.chartOfAccounts.detail = true;
    }
    this.cache
      .gridViewSetup('ChartOfAccounts', 'grvChartOfAccounts')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    if (this.chartOfAccounts.accountID != null) {
      this.accID = this.chartOfAccounts.accountID;
      this.parID = this.chartOfAccounts.parentID;
      this.subLGType = this.chartOfAccounts.subLGType;
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
  }
  //#endregion

  //#region Functione
  valueChange(e: any) {
    this.chartOfAccounts[e.field] = e.data;
  }
  valueChangeAccID(e: any) {
    this.accID = e.data;
    this.chartOfAccounts[e.field] = this.accID;
  }
  valueChangeloan(e: any) {
    if (e.data == '0') {
      this.chartOfAccounts[e.field] = false;
    } else {
      this.chartOfAccounts[e.field] = true;
    }
  }
  valueChangeParID(e: any) {
    this.parID = e.data;
    this.chartOfAccounts[e.field] = this.parID;
  }
  valueChangeSubtype(e: any) {
    this.subLGType = e.data;
    this.chartOfAccounts[e.field] = this.subLGType;
  }
  setTitle(e: any) {
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
              this.chartOfAccounts[keymodel[i]] == ''
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
  //#endregion

  //#region CRUD
  onSave() {
    this.checkValidate();
    if (this.validate > 0) {
      this.validate = 0;
      return;
    } else {
      if (this.formType == 'add') {
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'AddAsync';
            opt.className = 'AccountsBusiness';
            opt.assemblyName = 'AC';
            opt.service = 'AC';
            opt.data = [this.chartOfAccounts];
            return true;
          })
          .subscribe((res) => {
            if (res.save) {
              this.dialog.close(res.save);
            } else {
              this.notification.notifyCode('SYS031', 0, '"' + this.accID + '"');
              return;
            }
          });
      }
      if (this.formType == 'edit') {
        if (this.chartOfAccounts.loanControl == '0') {
          this.chartOfAccounts.loanControl = false;
        } else {
          this.chartOfAccounts.loanControl = true;
        }
        this.dialog.dataService
          .save((opt: RequestOption) => {
            opt.methodName = 'UpdateAsync';
            opt.className = 'AccountsBusiness';
            opt.assemblyName = 'AC';
            opt.service = 'AC';
            opt.data = [this.chartOfAccounts];
            return true;
          })
          .subscribe((res) => {
            if (res.save || res.update) {
              this.dialog.close();
              this.dt.detectChanges();
            }
          });
      }
    }
  }
  //#endregion
}
