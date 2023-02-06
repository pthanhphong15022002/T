import { FormGroup } from '@angular/forms';
import { CodxHrService } from '../../codx-hr.service'
import { Injector, ChangeDetectorRef } from '@angular/core';
import { 
  Component, 
  OnInit,
  Optional,
  ViewChild  
} from '@angular/core';

import {
  CodxFormComponent,
  CodxListviewComponent,
  CRUDService,
  DialogData,
  DialogRef,
  FormModel,
  NotificationsService,
  UIComponent,
 } from 'codx-core';

@Component({
  selector: 'lib-popup-ehealths',
  templateUrl: './popup-ehealths.component.html',
  styleUrls: ['./popup-ehealths.component.scss'],
})
export class PopupEhealthsComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  healthObj: any;
  healthTemp: any;
  lstEHealth
  indexSelected
  funcID: string;
  actionType: string;
  employId: string;
  idField = 'RecID';
  isAfterRender = false;
  headerText: string;
  @ViewChild('form') form: CodxFormComponent;
  @ViewChild('listView') listView: CodxListviewComponent;
  @ViewChild('ultrasound') ultrasound: CodxListviewComponent;
  @ViewChild('bloodtest') bloodtest: CodxListviewComponent;
  dialog2: DialogRef

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    // if (!this.formModel) {
    //   this.formModel = new FormModel();
    //   this.formModel.entityName = 'HR_EHealths';
    //   this.formModel.formName = 'EHealths';
    //   this.formModel.gridViewName = 'grvEHealths';
    // }
    this.dialog = dialog;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.employId = data?.data?.employeeId;
    this.actionType = data?.data?.actionType;
    this.lstEHealth = data?.data?.lstEHealth;
    this.indexSelected = data?.data?.indexSelected != undefined?data?.data?.indexSelected:-1
    if (this.actionType === 'edit' || this.actionType === 'copy') {
      this.healthObj = JSON.parse(JSON.stringify(this.lstEHealth[this.indexSelected]));
    }
  }

  onInit(): void {
    this.hrSevice.getFormModel(this.funcID).then((formModel) => {
      if (formModel) {
        this.formModel = formModel;
        this.hrSevice
          .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
          .then((fg) => {
            if (fg) {
              this.formGroup = fg;
              this.initForm();
            }
          });
      }
    });
  }

  initForm(){
    if (this.actionType == 'add') {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            this.healthObj = res?.data;
            this.healthObj.employeeID = this.employId;
            this.formModel.currentData = this.healthObj;
            this.formGroup.patchValue(this.healthObj);
            this.cr.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {
        this.formGroup.patchValue(this.healthObj);
        this.formModel.currentData = this.healthObj;
        this.cr.detectChanges();
        this.isAfterRender = true;
      }
    }
  }

  onSaveForm() {
    // if (this.formGroup.invalid) {
    //   this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
    //   return;
    // }

    if(this.actionType === 'copy' || this.actionType === 'add'){
      delete this.healthObj.recID
    }
    this.healthObj.employeeID = this.employId 
    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.hrSevice.addEHealth(this.healthObj).subscribe(p => {
        if(p != null){
          this.healthObj.recID = p.recID
          this.notify.notifyCode('SYS006')
          this.lstEHealth.push(JSON.parse(JSON.stringify(this.healthObj)));
          if(this.listView){
            (this.listView.dataService as CRUDService).add(this.healthObj).subscribe();
          }
          // this.dialog.close(p)
        }
        else this.notify.notifyCode('SYS023')
      });
    } 
    else{
      this.hrSevice.editEHealth(this.formModel.currentData).subscribe(p => {
        if(p != null){
          this.notify.notifyCode('SYS007')
        this.lstEHealth[this.indexSelected] = p;
        if(this.listView){
          (this.listView.dataService as CRUDService).update(this.lstEHealth[this.indexSelected]).subscribe()
        }
          // this.dialog.close(this.data)
        }
        else this.notify.notifyCode('SYS021')
      });
    }
  }

  swipeToRightTab(e) {
    if (e.isSwiped) {
      e.cancel = true;
    }
  }

  BloodTestPopup(){
    this.healthTemp = JSON.parse(JSON.stringify(this.healthObj));
    this.dialog2 = this.callfc.openForm(this.bloodtest);
  }

  UltraSoundPopup(){
    this.healthTemp = JSON.parse(JSON.stringify(this.healthObj));
    this.dialog2 = this.callfc.openForm(this.ultrasound);    
  }

  onSave(){
    this.healthObj = JSON.parse(JSON.stringify(this.healthTemp));
    this.dialog2.close()
  }

  // afterRenderListView(event: any) {
  //   this.listView = event;
  //   console.log(this.listView);
  // }

  // click(data) {}
}
