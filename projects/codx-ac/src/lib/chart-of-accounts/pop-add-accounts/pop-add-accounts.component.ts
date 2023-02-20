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
  @ViewChild('form') form: CodxFormComponent;
  dialog!: DialogRef;
  chartOfAccounts: ChartOfAccounts;
  headerText: string;
  title: string;
  formType: any;
  gridViewSetup: any;
  formModel: FormModel;
  accID: string;
  parID: string;
  subLGType: string;
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
    this.cache
      .gridViewSetup('ChartOfAccounts', 'grvChartOfAccounts')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
          console.log(this.gridViewSetup);
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

  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
  }
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
  onSave() {
    if (this.accID.trim() == '' || this.accID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['AccountID'].headerText + '"'
      );
      return;
    }
    if (this.parID.trim() == '' || this.parID == null) {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['ParentID'].headerText + '"'
      );
      return;
    }
    if (this.chartOfAccounts.subLGControl) {
      if (this.subLGType == '' || this.subLGType == null) {
        this.notification.notify('Hãy chọn loại công nợ', '2');
        return;
      }
    }
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
