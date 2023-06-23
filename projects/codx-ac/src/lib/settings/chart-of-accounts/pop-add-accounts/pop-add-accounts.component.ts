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
import { Accounts} from '../../../models/Accounts.model';
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
  Accounts: Accounts;
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
    this.Accounts = dialog.dataService!.dataSelected;
    if (this.formType == 'add') {
      this.Accounts.detail = true;
    }
    this.cache
      .gridViewSetup(dialog.formModel.formName, dialog.formModel.gridViewName)
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
    if (this.Accounts.accountID != null) {
      if (this.Accounts.loanControl) {
        this.Accounts.loanControl = '1';
      } else {
        this.Accounts.loanControl = '0';
      }
      if (this.Accounts.postDetail == '1') {
        this.Accounts.postDetail = true;
      } else {
        this.Accounts.postDetail = false;
      }
    }
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
    this.formModel = this.form?.formModel;
    this.form.formGroup.patchValue(this.Accounts);
  }
  //#endregion

  //#region Event
  valueChange(e: any) {
    this.Accounts[e.field] = e.data;
  }
  valueChangeloan(e: any) {
    if (e.data == '0') {
      this.Accounts[e.field] = false;
    } else {
      this.Accounts[e.field] = true;
    }
  }
  //#endregion

  //#region Function
  setTitle() {
    this.title = this.headerText;
    this.dt.detectChanges();
  }
  checkcontrol() {
    if (this.Accounts.loanControl == '0') {
      this.Accounts.loanControl = false;
    } else {
      this.Accounts.loanControl = true;
    }
    if (this.Accounts.postDetail == true) {
      this.Accounts.postDetail = '1';
    }else{
      this.Accounts.postDetail = '0';
    }
  }
  checkSubLGControl(){
    if(this.Accounts.subLGControl && !this.Accounts.subLGType)
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
      this.checkcontrol();
      this.dialog.dataService
        .save((opt: RequestOption) => {
          opt.data = [this.Accounts];
        })
        .subscribe((res) => {
          if (res && !res.save.error) {
            this.dialog.close(res.save);
          } else {
            this.notification.notifyCode(
              'SYS031',
              0,
              '"' + this.Accounts.accountID + '"'
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
          opt.data = [this.Accounts];
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
