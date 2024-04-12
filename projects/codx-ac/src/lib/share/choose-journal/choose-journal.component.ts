import { ChangeDetectionStrategy, Component, Injector, Optional } from '@angular/core';
import { CRUDService, DataRequest, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxAcService } from '../../codx-ac.service';
import { Subject, map, takeUntil } from 'rxjs';
import { CashreceiptsAddComponent } from '../../vouchers/cashreceipts/cashreceipts-add/cashreceipts-add.component';
import { CashPaymentAddComponent } from '../../vouchers/cashpayments/cashpayments-add/cashpayments-add.component';

@Component({
  selector: 'lib-choose-journal',
  templateUrl: './choose-journal.component.html',
  styleUrls: ['./choose-journal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChooseJournalComponent extends UIComponent {
  dialog!: DialogRef;
  type:any;
  model:any;
  journalNo:any;
  headerText:any;
  journal:any;
  baseCurr: any;
  isNext:any = false;
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private notification: NotificationsService,
    private acService: CodxAcService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.type = dialogData.data.type;
    this.model = {
      journalType:this.type
    }
  }
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '350px', '150px');
    (this.dialog.dialog as any).properties.minHeight = 0;
    this.cache
      .viewSettingValues('ACParameters')
      .pipe(map((data) => data.filter((f) => f.category === '1')?.[0]))
      .subscribe((res) => {
        let dataValue = JSON.parse(res.dataValue);
        this.baseCurr = dataValue?.BaseCurr || '';
      });
  }

  valueChange(event: any) {
    if(event?.data == null){
      this.isNext = false;
      this.detectorRef.detectChanges();
    }else{
      this.journalNo = event?.data;
      this.getJournal();
    }
  }

  onSave() { 
    this.dialog.close({journalNo:this.journalNo,journal:this.journal});
  }

  getJournal() {
    let options = new DataRequest();
    options.entityName = 'AC_Journals';
    options.pageLoading = false;
    options.predicates = 'JournalNo=@0';
    options.dataValues = this.journalNo;
    this.api
      .execSv('AC', 'Core', 'DataBusiness', 'LoadDataAsync', options)
      .pipe(map((r) => r?.[0] ?? []))
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.journal = res[0];
        this.isNext = true;
        this.detectorRef.detectChanges();
      });
  }
}
