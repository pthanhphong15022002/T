import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CodxFormComponent, CodxListviewComponent, DialogData, DialogRef, FormModel, NotificationsService, UIComponent } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';

@Component({
  selector: 'lib-popup-emp-business-travels',
  templateUrl: './popup-emp-business-travels.component.html',
  styleUrls: ['./popup-emp-business-travels.component.css']
})
export class PopupEmpBusinessTravelsComponent extends UIComponent implements OnInit {
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;

  formGroup: FormGroup;
  formModel: FormModel;
  dialog: DialogRef;
  headerText: '';
  funcID;
  employId;
  data;

  isAfterRender = false;
  actionType: string;


  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notitfy: NotificationsService,
    private hrService: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.actionType = data?.data?.actionType;
    if (!this.formModel) {
      this.formModel = new FormModel();
      this.formModel.formName = 'EBusinessTravels';
      this.formModel.entityName = 'HR_EBusinessTravels';
      this.formModel.gridViewName = 'grvEBusinessTravels';
    }
    this.funcID = this.dialog?.formModel?.funcID;
    this.employId = data?.data?.employeeId;
  }

  onInit(): void {
    if(this.formModel){
      this.hrService.getFormGroup(this.formModel.formName, this.formModel.gridViewName).then(fg => {
        if(fg){
          this.formGroup = fg;
          this.initForm();
        }
      })
    }
  }

  initForm(){
    this.isAfterRender = true;
  }

  onSaveForm(isCloseForm: boolean){}

  
  afterRenderListView(event) {
    this.listView = event;
    console.log(this.listView);
  }

  click(data){}

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

}
