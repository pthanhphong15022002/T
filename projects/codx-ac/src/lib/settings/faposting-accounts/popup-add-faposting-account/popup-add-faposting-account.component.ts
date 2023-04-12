import { Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  CRUDService,
  DialogData,
  DialogRef,
  NotificationsService,
  RequestOption,
  UIComponent,
} from 'codx-core';
import { IFAPostingAccount } from '../interfaces/IFAPostingAccount.interface';

@Component({
  selector: 'lib-popup-add-faposting-account',
  templateUrl: './popup-add-faposting-account.component.html',
  styleUrls: ['./popup-add-faposting-account.component.css'],
})
export class PopupAddFAPostingAccountComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  faPostingAccount: IFAPostingAccount = {} as IFAPostingAccount;
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
    this.faPostingAccount = dialogRef.dataService?.dataSelected;
    this.faPostingAccount.moduleID = dialogData.data.moduleId.toString();
    this.faPostingAccount.postType = dialogData.data.postType;
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

  ngAfterViewInit() {
    console.log(this.form);
  }
  //#endregion

  //#region Event
  handleInputChange(e) {
    console.log(e);
    this.faPostingAccount[e.field] = e.data;
  }
  //#endregion

  //#region Method
  save(closeAfterSaving: boolean): void {
    console.log(this.faPostingAccount);
    console.log(this.form.formGroup);

    // validate
    const controls = this.form.formGroup.controls;
    let isValid = true;
    for (const propName in this.form.formGroup.controls) {
      if (
        propName != 'moduleID' &&
        propName != 'postType' &&
        controls[propName].invalid
      ) {
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
            ? 'AddFAPostingAccountAsync'
            : 'UpdateFAPostingAccountAsync';
        req.className = 'FAPostingAccountsBusiness';
        req.assemblyName = 'ERM.Business.AC';
        req.service = 'AC';
        req.data = this.faPostingAccount;

        return true;
      })
      .subscribe((res) => {
        console.log({ res });

        if (res.save || res.update) {
          if (closeAfterSaving) {
            this.dialogRef.close();
          } else {
            this.form.formGroup.reset();
            this.faPostingAccount.note = '';
            delete this.faPostingAccount.recID;

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
