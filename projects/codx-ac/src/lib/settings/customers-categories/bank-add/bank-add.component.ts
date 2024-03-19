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
  DataRequest,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { Subject, map, takeUntil } from 'rxjs';
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
  lstBank:any = [];
  private destroy$ = new Subject<void>();
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
    this.lstBank = dialogData.data?.lstBank;
  }
  //#endregion

  //#region Init
  onInit(): void {}
  ngAfterViewInit() {
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion

  //#region Function
  
  //#endregion

  //#region CRUD
  onSave() {
    let validate = this.form.validation();
    if (validate) return;
    let index = this.lstBank.findIndex(x => x.bankAcctID == this.form.data.bankAcctID);
    if(index > -1){
      this.notification.notifyCode(
        'SYS031',
        0,
        '"' + this.form.gridviewSetup["BankAcctID"].headerText + '"'
      );
      return;
    }else{
      let options = new DataRequest();
      options.entityName = 'BS_BankAccounts';
      options.pageLoading = false;
      options.predicates = 'BankAcctID=@0 and RecID !=@1';
      options.dataValues = `${this.form.data.bankAcctID};${this.form.data.recID}`;
      this.api
        .execSv('BS', 'Core', 'DataBusiness', 'LoadDataAsync', options)
        .pipe(map((r) => r?.[0] ?? [])).subscribe((res: any) => {
          if (res && res.length) {
            this.notification.notifyCode(
              'SYS031',
              0,
              '"' + this.form.data.bankAcctID + '"'
            );
            return;
          }else{
            this.dialog.close({...this.form.data});
          }
        })
    }
  }
  //#endregion
}
