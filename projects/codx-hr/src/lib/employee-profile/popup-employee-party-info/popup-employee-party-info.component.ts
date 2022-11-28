import { CodxHrService } from './../../codx-hr.service'; 
import { Injector } from '@angular/core';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import{
  CodxFormComponent,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,

} from 'codx-core';
@Component({
  selector: 'lib-popup-employee-party-info',
  templateUrl: './popup-employee-party-info.component.html',
  styleUrls: ['./popup-employee-party-info.component.css']
})
export class PopupEmployeePartyInfoComponent extends UIComponent implements OnInit {
  onInit(): void {
  }
  
  formModel: FormModel
  dialog: DialogRef
  data
  isAfterRender = false
  headerText: ''
  @ViewChild('form') form: CodxFormComponent;
  
  constructor(
    private injector: Injector,
    private notify: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector)
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    if(this.formModel){
      this.isAfterRender = true
    }
    this.data = dialog?.dataService?.dataSelected
   }



onSaveForm(){
  this.hrService.saveEmployeeUnionAndPartyInfo(this.data).subscribe(p => {
    if(p === "True"){
      this.notify.notifyCode('SYS007')
      this.dialog.close()
    }
  })
}
}
