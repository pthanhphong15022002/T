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
import { Subject, takeUntil } from 'rxjs';
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
  objectID:any;
  objectType : any;
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
    this.objectID = dialogData.data?.objectID;
    this.objectType = dialogData.data?.objectType;
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
    this.form.setValue('objectID',this.objectID,{});
    this.form.setValue('objectType',this.objectType,{});
    this.form.save(null, 0, '', '', false).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(!res) return;
      if(res.hasOwnProperty('save')){
        if(res.save.hasOwnProperty('data') && !res.save.data) return;
      }
      if(res.hasOwnProperty('update')){
        if(res.update.hasOwnProperty('data') && !res.update.data) return;
      }
      this.dialog.close({bank:{...this.form.data}});
    })
  }
  //#endregion
}
