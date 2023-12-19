import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { AuthStore, CodxComboboxComponent, CodxFormComponent, CodxInputComponent, DialogData, DialogRef, NotificationsService, RequestOption, UIComponent } from 'codx-core';
import { CodxAcService } from '../../../codx-ac.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-pop-add-run-periodic',
  templateUrl: './run-periodic-add.component.html',
  styleUrls: ['./run-periodic-add.component.css'],
})
export class RunPeriodicAddComponent extends UIComponent {

  //region Constructor
  @ViewChild('form') public form: CodxFormComponent;
  @ViewChild('eleCbxItemGroupID') eleCbxItemGroupID: CodxInputComponent;
  headerText: any;
  dialog!: DialogRef;
  dataDefault:any;  
  isPreventChange:any;
  morName:any;
  private destroy$ = new Subject<void>();
  constructor(
    inject: Injector,
    private acService: CodxAcService,
    private dt: ChangeDetectorRef,
    private notification: NotificationsService,
    private routerActive: ActivatedRoute,
    @Optional() dialog?: DialogRef,
    @Optional() dialogData?: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    this.headerText = dialogData.data?.headerText;
    this.dataDefault = {...dialogData.data?.dataDefault};
    this.morName = dialogData.data?.morName;
  }

  //#endregion

  //#region Init

  onInit(): void {
  }

  ngAfterViewInit() {
  }

  //#endregion

  //region Event
  //endRegion Event

  //region Function

  valuechange(event){
    if(this.isPreventChange){
      return;
    }
    let field = event?.field || event?.ControlName;
    let value = event?.data || event?.crrValue;
    switch (field.toLowerCase()) {
      case 'itemgroupid':
        this.form.setValue('itemID',null,{});
        this.detectorRef.detectChanges();
        break;
    }
  }
  //endRegion Function

  //#region Method
  onSave(){
    let validate = this.form.validation(false);
    if(validate) return;
    let paras = {
      itemGroupID : this.form.data?.itemGroupID,
      itemID : this.form?.data?.itemID,
      warehouseID : this.form?.data?.warehouseID,
      accountID : this.form?.data?.accountID
    }
    this.form.setValue('paras',JSON.stringify(paras),{});
    this.api.exec('AC','RunPeriodicBusiness','RunSimulationAsync',[this.form.data,this.morName]).subscribe((res:any)=>{
      if (res) {
        this.notification.notifyCode('AC0029', 0, this.morName);
        this.dialog.dataService.add(res).subscribe();
        this.dialog.close();
      }else{
        this.notification.notifyCode('AC0030', 0, this.morName);
      }
    })
  }
  //#endregion Method
}
