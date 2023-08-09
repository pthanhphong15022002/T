import {
  ChangeDetectionStrategy,
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
import { Accounts} from '../../../models/Accounts.model';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-pop-add-accounts',
  templateUrl: './pop-add-accounts.component.html',
  styleUrls: ['./pop-add-accounts.component.css','../../../codx-ac.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopAddAccountsComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  dialog!: DialogRef;
  accounts: Accounts;
  headerText: any;
  title: any;
  formType: any;
  gridViewSetup: any;
  formModel: FormModel;
  validate: any = 0;
  keyField: any = '';
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
    this.accounts = dialog.dataService!.dataSelected;
    this.keyField = dialog.dataService!.keyField;
    if (this.formType == 'add') {
      this.accounts.detail = true;
    }
    this.cache
      .gridViewSetup(dialog.formModel.formName, dialog.formModel.gridViewName)
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    if (this.accounts != null) {
      if (this.accounts.loanControl) {
        this.accounts.loanControl = '1';
      } else {
        this.accounts.loanControl = '0';
      }
      if (this.accounts.postDetail == '1') {
        this.accounts.postDetail = true;
      } else {
        this.accounts.postDetail = false;
      }
    }
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.form.formGroup.patchValue(this.accounts, {
      onlySelf: true,
      emitEvent: false,
    });
    setTimeout(() => {
      this.dt.detectChanges();
    }, 100);
    
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
    this.accounts[e.field] = e.data;
  }
  valueChangeloan(e: any) {
    if (e.data == '0') {
      this.accounts[e.field] = false;
    } else {
      this.accounts[e.field] = true;
    }
  }
  //#endregion

  //#region Function
  setTitle() {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  checkcontrol() {
    if (this.accounts.loanControl == '0') {
      this.accounts.loanControl = false;
    } else {
      this.accounts.loanControl = true;
    }
    if (this.accounts.postDetail == true) {
      this.accounts.postDetail = '1';
    }else{
      this.accounts.postDetail = '0';
    }
  }
  checkSubLGControl(){
    if(this.accounts.subLGControl && !this.accounts.subLGType)
    {
      this.notification.notifyCode(
        'SYS009',
        0,
        '"' + this.gridViewSetup['SubLGType'].headerText + '"'
      );
      return;
    }
  }
  //#endregion

  //#region CRUD
  onSave() {
    
    //Note
    let ignoredFields: string[] = [];
    if(this.keyField == 'AccountID')
    {
      ignoredFields.push(this.keyField);
    }
    ignoredFields = ignoredFields.map((i) => i.toLowerCase());
    //End Note

    if (
      !this.acService.validateFormData(
        this.form.formGroup,
        this.gridViewSetup,
        [''],
        ignoredFields)
    ) {
      return;
    }
    this.checkSubLGControl();
    if (this.formType == 'add' || this.formType == 'copy') {
      this.checkcontrol();
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.data = [this.accounts];
        })
        .subscribe((res) => {
          if (res && !res.save.error) {
            this.dialog.close(res.save);
          } else {
            this.notification.notifyCode(
              'SYS031',
              0,
              '"' + this.accounts.accountID + '"'
            );
            return;
          }
        });
    }
    if (this.formType == 'edit') {
      this.checkcontrol();
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.methodName = 'UpdateAsync';
          opt.data = [this.accounts];
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
