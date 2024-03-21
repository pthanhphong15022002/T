import { ChangeDetectionStrategy, Component, Injector, Optional, ViewChild } from '@angular/core';
import {
  CodxFormComponent,
  CodxInputComponent,
  DialogData,
  DialogRef,
  NotificationsService,
  UIComponent,
} from 'codx-core';
import { map, takeUntil } from 'rxjs/operators';
import { CodxAcService } from '../../../codx-ac.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'lib-items-color-add',
  templateUrl: './items-color-add.component.html',
  styleUrls: ['./items-color-add.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsColorAddComponent extends UIComponent {
  //#region Constructor
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('eleCbxColor') eleCbxColor: CodxInputComponent;
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

  ngAfterViewInit(): void {
    this.form.setValue('colorCode',this.eleCbxColor.ComponentCurrent?.colorPicker?.initialInputValue,{});
  }

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
  valueChange(event){
    this.form.setValue(event.field,event.data,{});
  }
  //#endregion Event

  //#region Method
  onSave() {
    let validate = this.form.validation()
    if(validate) return;
    this.dialog.close({...this.form?.data});
  }
  //#endregion Method

  //#region Function
  //#endregion Function
}
