import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
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
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
@Component({
  selector: 'lib-pop-add-bank',
  templateUrl: './bank-add.component.html',
  styleUrls: ['./bank-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankAddComponent extends UIComponent implements OnInit {
  //#region Contructor
  @ViewChild('form') form: CodxFormComponent;
  dialog: DialogRef;
  dialogData: DialogData;
  headerText: string;
  dataDefault:any;
  constructor(
    inject: Injector,
    private dt: ChangeDetectorRef,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = dialogData.data?.dataDefault;
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region Function
  valueChange(e: any) {
  }
  clearBankAccount() {
    this.form.formGroup.reset();
    //this.bankaccount = new BankAccount();
  }
  
  //#endregion

  //#region CRUD
  onSave() {
    let validate = this.form.validation(true,false); //? chekc validate tỷ giá
    if(validate) return;
    this.dialog.close({bank:{...this.form.data}});
  }
  
  onSaveAdd() {
    
  }
  //#endregion
}
