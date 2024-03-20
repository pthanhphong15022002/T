import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Injector,
  Optional,
  ViewChild,
} from '@angular/core';
import {
  CodxFormComponent,
  DialogData,
  DialogRef,
  ImageViewerComponent,
  NotificationsService,
  UIComponent,
  UploadFile,
} from 'codx-core';
import { Subject, combineLatest } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { CodxAcService } from '../../../codx-ac.service';
import { toCamelCase } from '../../../utils';

@Component({
  selector: 'lib-items-size-add',
  templateUrl: './items-size-add.component.html',
  styleUrls: ['./items-size-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsSizeAddComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('itemSizeImage') itemSizeImage?: ImageViewerComponent;
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
    this.dataDefault = {...dialogData?.data?.dataDefault};
    this.headerText = dialogData?.data?.headerText;

  }
  //#endregion Constructor

  //#region Init
  onInit(): void {
    
  }

  ngAfterViewInit(): void {}

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
    let validate = this.form.validation();
    if(validate) return;
    if (this.itemSizeImage?.imageUpload?.item) {
      this.itemSizeImage
        .updateFileDirectReload(this.form?.data?.recID)
        .subscribe((res) => {
          if (res) {
            this.dialog.close({...this.form?.data});
          }
        });
    }else{
      this.dialog.close({...this.form?.data});
    }
  }
  //#endregion Method

  //#region Function
  //#endregion Function
}
