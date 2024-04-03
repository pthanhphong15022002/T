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
  UIComponent,
  CodxFormComponent,
  DialogRef,
  NotificationsService,
  AuthService,
  DialogData,
  CodxGridviewV2Component,
} from 'codx-core';
import { DateTime } from '@syncfusion/ej2-angular-charts';
import {
  EditSettingsModel,
  SelectionSettingsModel,
} from '@syncfusion/ej2-angular-grids';
import { Subject, pipe, takeUntil } from 'rxjs';
import { CodxAcService } from '../../codx-ac.service';

@Component({
  selector: 'lib-suggestion-add',
  templateUrl: './suggestion-add.component.html',
  styleUrls: ['./suggestion-add.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class SuggestionAdd  extends UIComponent implements OnInit {
  //#region Constructor
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('grid') public grid: CodxGridviewV2Component;
  dialog!: DialogRef;
  master: any;
  dateNow: any = new Date();
  mapPredicates = new Map<string, string>();
  mapDataValues = new Map<string, string>();
  noEditSetting: EditSettingsModel = {
    allowEditing: false,
    allowAdding: false,
    allowDeleting: false,
    mode: 'Normal',
  };
  dataSource: any = [];
  objectName: any;
  dateSuggestion: any;
  isClick:any = false;
  headerText:any;
  type:any="0";
  selectionOptions:SelectionSettingsModel = { type: 'Single', checkboxMode: 'ResetOnRowClick'};;
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private auth: AuthService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.master = dialogData.data?.master;
    this.objectName = this.master?.objectName;
  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    this.acService.setPopupSize(this.dialog, '80%', '90%');
    this.loadData(false);
  }
  ngAfterViewInit() {
    this.dt.detectChanges();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Init

  //#region Event

  close() {
    this.onDestroy();
    this.dialog.close();
  }

  valueChange(e: any) {
    if (e && e.data) {
      switch(e.field.toLowerCase()){
        case 'datesuggestion':
          this.dateSuggestion = e.data.fromDate;
          break;
        case 'type':
          this.type = e.data;
          break;
      }
      
    }
  }
  //#region Event

  //#region Function
  onSelected(event: any) {
    // if (event) {
    //   if (this.isClick) {
    //     this.isClick = false;
    //     return;
    //   }
    //   this.isClick = true;
    //   this.grid.gridRef.clearSelection();
    //   this.grid.gridRef.selectRow(event?._rowIndex);
    // }
  }

  onDeselected(event:any){
    if(!event.target) return;
    this.grid.arrSelectedRows = [];
    this.detectorRef.detectChanges();
  }

  loadData(showArlert:any=true) {
    this.api
      .exec('EP', 'RequestsBusiness', 'LoadRequestAsync', [
        this.master.voucherDate,
        this.dateSuggestion,
        this.type,
        this.master.objectID,
      ])
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res) {
          this.dataSource = res;
          this.detectorRef.detectChanges();
        }else{
          if(showArlert) this.notification.notifyCode('AC0027');
        }
      });
  }
  //#endregion Function

  //#region Method
  onApply() {
    console.log(this.grid.arrSelectedRows);
  }
  //#endregion Method
}
