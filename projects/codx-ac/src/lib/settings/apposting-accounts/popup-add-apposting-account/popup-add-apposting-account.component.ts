import {
  AfterViewInit,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CodxFormComponent,
  CRUDService,
  DialogData,
  DialogRef,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { IAPPostingAccount } from '../interfaces/IAPPostingAccount.interface';

@Component({
  selector: 'lib-popup-add-apposting-account',
  templateUrl: './popup-add-apposting-account.component.html',
  styleUrls: ['./popup-add-apposting-account.component.css'],
})
export class PopupAddAPPostingAccountComponent
  extends UIComponent
  implements AfterViewInit
{
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  apPostingAccount: IAPPostingAccount = {} as IAPPostingAccount;
  formTitle: string = '';
  breadcrumb: string = '';
  gridViewSetup: any;
  isEdit: boolean = false;

  constructor(
    private injector: Injector,
    private notiService: NotificationsService,
    @Optional() public dialogRef: DialogRef,
    @Optional() public dialogData: DialogData
  ) {
    super(injector);

    this.formTitle = dialogData.data.formTitle;
    this.breadcrumb = dialogData.data.breadcrumb;
    this.isEdit = dialogData.data.formType === 'edit' ? true : false;
    this.apPostingAccount = dialogRef.dataService?.dataSelected;
    this.apPostingAccount.moduleID = dialogData.data.moduleId.toString();
    this.apPostingAccount.postType = dialogData.data.postType;

    console.log('postType', this.apPostingAccount.postType);
  }
  //#endregion

  //#region Init
  onInit(): void {
    this.cache
      .gridViewSetup(
        this.dialogRef.formModel.formName,
        this.dialogRef.formModel.gridViewName
      )
      .subscribe((res) => {
        this.gridViewSetup = res;
      });
  }

  ngAfterViewInit(): void {
    console.log(this.form);
  }
  //#endregion

  //#region Event
  handleInputChange(e) {
    console.log(e);
    this.apPostingAccount[e.field] = e.data;
  }
  //#endregion

  //#region Method
  save(closeAfterSaving: boolean): void {
    console.log(this.apPostingAccount);
    console.log(this.form.formGroup);

    // validate
    const controls = this.form.formGroup.controls;
    let isValid = true;
    for (const propName in controls) {
      if (controls[propName].invalid) {
        // form Dieu khoan doens't have this input
        if (
          propName === 'payableAcctID' &&
          this.apPostingAccount.postType === '20'
        ) {
          continue;
        }

        this.notiService.notifyCode(
          'SYS009',
          0,
          `"${this.gridViewSetup[this.toPascalCase(propName)]?.headerText}"`
        );

        isValid = false;
      }
    }

    if (!isValid) {
      return;
    }

    this.dialogRef.dataService
      .save((req: RequestOption) => {
        req.methodName =
          this.dialogData.data.formType === 'add'
            ? 'AddAPPostingAccountAsync'
            : 'UpdateAPPostingAccountAsync';
        req.className = 'APPostingAccountsBusiness';
        req.assemblyName = 'ERM.Business.AC';
        req.service = 'AC';
        req.data = this.apPostingAccount;

        return true;
      })
      .subscribe((res) => {
        console.log({ res });

        if (res.save || res.update) {
          if (closeAfterSaving) {
            this.dialogRef.close();
          } else {
            this.form.formGroup.reset();
            this.apPostingAccount.note = '';
            delete this.apPostingAccount.recID;

            (this.dialogRef.dataService as CRUDService).addNew().subscribe();
          }
        }
      });
  }
  //#endregion

  //#region Function
  clearRightInput(prop) {
    this.form.formGroup.controls[prop].reset();
  }

  toPascalCase(camelCase: string): string {
    return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
  }
  //#endregion
}
