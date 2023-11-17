import { ChangeDetectionStrategy, Component, Injector, Optional } from '@angular/core';
import { DialogData, DialogRef, NotificationsService, UIComponent } from 'codx-core';
import { Subject } from 'rxjs';
import { CodxAcService } from '../../../codx-ac.service';

@Component({
  selector: 'lib-allocation-add',
  templateUrl: './allocation-add.component.html',
  styleUrls: ['./allocation-add.component.css'],
  changeDetection : ChangeDetectionStrategy.OnPush
})
export class AllocationAddComponent extends UIComponent { 
  //#region Constructor
  dialog!: DialogRef;
  isStep:any = false;
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private notification: NotificationsService,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    
  }
  //#endregion Constructor

  //#region Init

  onInit(): void {
    this.acService.setPopupSize(this.dialog, '60%', '80%');
  }

  ngAfterViewInit() {}

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }

  onDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion Init

  //#region Event
  close(){
    this.dialog.close();
    this.onDestroy();
  }
  //#endregion Event

  //#region Function
  onNextStep(){
    this.isStep = true;
    this.detectorRef.detectChanges();
  }

  onBack(){
    this.isStep = false;
    this.detectorRef.detectChanges();
  }

  onAccept(){

  }
  //#endregion Function
}
