import { AfterViewInit, Component, Injector, Optional, TemplateRef, ViewChild } from '@angular/core';
import { AuthStore, CacheService, DialogData, DialogRef, FormModel, NotificationsService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxCmService } from '../../codx-cm.service';

@Component({
  selector: 'lib-popup-assgin-deal',
  templateUrl: './popup-assgin-deal.component.html',
  styleUrls: ['./popup-assgin-deal.component.scss']
})
export class PopupAssginDealComponent extends UIComponent
implements AfterViewInit
{
  [x: string]: any;
views: Array<ViewModel> | any = [];
@ViewChild('body') body: TemplateRef<any>;
dialogRef: DialogRef;
formModel:FormModel
title = '';
cbbEmpData:any;
employee:any;
activeTab: string;
subHeaderText:string = '';

objectID:string = '';
employeeName: any;
gridViewSetup: any;

constructor(
  private injector: Injector,
  private notificationsService: NotificationsService,
  private authStore: AuthStore,
  private codxCmService: CodxCmService,
  @Optional() dialogData?: DialogData,
  @Optional() dialogRef?: DialogRef
) {
  super(injector);
  this.dialogRef = dialogRef;
  this.title = dialogData?.data.titleAction;
  this.gridViewSetup = dialogData?.data.gridViewSetup;
  this.subHeaderText = 'Công tác quản lý các mảng Dịch vụ hạ tầng, Dịch vụ tiện tích, Dịch vụ Điện nước'
}

ngAfterViewInit(): void {
}

onInit(): void {

}
loadTabView() {
  this.detectorRef.detectChanges();
}

click(event: any) {
  switch (event) {
  }
}
clickMenu(item) {

  this.detectorRef.detectChanges();
}
cancel() {
  this.dialogRef.close();
}

cbxEmpChange(evt: any) {
  if (evt?.data != null && evt?.data != '') {
    this.objectID = evt.data;
    this.cbbEmpData= evt?.data;
    this.codxCmService.getEmployeesByEmpID(this.objectID).subscribe((user) => {
        if (user) {
         this.assignTo(user);
        }
      });
    this.detectorRef.detectChanges();
  }
}
assignTo(user:any){
  this.employeeName = user?.employeeName;
  this.orgUnitName = user?.orgUnitName;
  this.positionName = user?.positionName;
}
deleteOrg() {
  this.employeeName ='';
  this.orgUnitName ='';
  this.positionName ='';
  this.objectID ='';
  this.detectorRef.detectChanges();
}


onSaveForm() {

}

}
