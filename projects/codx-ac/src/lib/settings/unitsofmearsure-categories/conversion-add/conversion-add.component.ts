import {
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
import { Subject, takeUntil } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-pop-add-conversion',
  templateUrl: './conversion-add.component.html',
  styleUrls: ['./conversion-add.component.css'],
})
export class ConversionAddComponent extends UIComponent implements OnInit {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  dialog!: DialogRef;
  dialogData?: DialogData
  dataDefault: any;
  headerText: any;
  private destroy$ = new Subject<void>();
  constructor(
    injector: Injector,
    private acService: CodxAcService,
    private notiService: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.dataDefault = { ...dialogData?.data?.dataDefault };
    this.headerText = dialogData?.data?.headerText;

  }
  //#endregion Constructor

  //#region Init
  onInit(): void {

  }

  ngAfterViewInit(): void { }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  ngOnDestroy() {
    this.onDestroy();
  }

  /**
   * *Hàm hủy các obsevable subcrible
   */
  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  //#endregion Init

  //#region Event
  //#endregion Event

  //#region Method
  onSave() {
    this.form.save(null, 0, '', '', false)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (!res) return;
        if (res.hasOwnProperty('save')) {
          if (res.save.hasOwnProperty('data') && !res.save.data) return;
        }
        if (res.hasOwnProperty('update')) {
          if (res.update.hasOwnProperty('data') && !res.update.data) return;
        }
        this.dialog.close({ data: {...this.form?.data} });
      })
  }
  //#endregion Method

  //#region Function
  //#endregion Function
}
