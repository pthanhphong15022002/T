import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
  Util,
} from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-currency-exchangerate-add',
  templateUrl: './currency-exchangerate-add.component.html',
  styleUrls: ['./currency-exchangerate-add.component.css','../../../codx-ac.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExchangerateAddComponent extends UIComponent implements OnInit {

  //#region Contructor
  @ViewChild('form') public form: CodxFormComponent;
  headerText: string;
  dialog!: DialogRef;
  dialogData!: DialogData;
  formModel: FormModel;
  dataDefaultExRate: any;
  private destroy$ = new Subject<void>();
  constructor(
    private inject: Injector,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    @Optional() dialog: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.dataDefaultExRate = {...dialogData.data?.dataDefaultExRate};
    this.dialogData = {...dialogData};
  }
  //#endregion Contructor

  //#region Init
  onInit(): void {}

  ngAfterViewInit() {}

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion Init

  //#region Method

  /**
   * *Hàm lưu tỷ giá
   * @param type 
   * @returns 
   */
  onSave(type) {
    let index = this.dialogData.data?.lstExchangeRate.findIndex(x => x.toDate == this.form.data.toDate && x.sourceType == this.form.data.sourceType && x.recID != this.form.data.recID);
    if (index > -1) {
      this.notification.notifyCode('AC0031',0,'');
      return;
    }
    this.dialog.close({...this.form.data});
  }
  //#endregion Method
}
