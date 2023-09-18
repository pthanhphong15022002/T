import { ChangeDetectorRef, Component, Injector, OnInit, Optional, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CodxFormComponent, DataRequest, DialogData, DialogRef, FormModel, LayoutAddComponent, NotificationsService, UIComponent } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-popup-equitjob',
  templateUrl: './popup-equitjob.component.html',
  styleUrls: ['./popup-equitjob.component.css']
})
export class PopupEquitjobComponent extends UIComponent implements OnInit{
  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  quitJobObj: any;
  actionType: string;
  crrEContract: any;
  employeeId: string;
  idField = 'RecID';
  isAfterRender = false;
  headerText: string;

  quitJobFuncID = 'HRTEM0403';

  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'commonInfo',
    },
    {
      icon: 'icon-info',
      text: 'Trách nhiệm nhân viên',
      name: 'empResponsible',
    },
    {
      icon: 'icon-info',
      text: 'Trách nhiệm công ty',
      name: 'compResponsible',
    },
  ]

  @ViewChild('form') form: LayoutAddComponent;
  // @ViewChild('layout', { static: true }) layout: LayoutAddComponent;

  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private notify: NotificationsService,
    private df: ChangeDetectorRef,
    private hrSevice: CodxHrService,
    private codxShareService: CodxShareService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ) {
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.employeeId = data?.data?.employeeId;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    this.quitJobObj = JSON.parse(JSON.stringify(data?.data?.dataObj));

    if(this.quitJobObj){
      console.log('data nhan vao', data);
    }
  }

  // initForm(){
  //   if (this.actionType == 'add') {
  //     this.hrSevice
  //       .getDataDefault(
  //         this.formModel.funcID,
  //         this.formModel.entityName,
  //         this.idField
  //       )
  //       .subscribe((res: any) => {
  //         if (res) {
  //           this.quitJobObj = res?.data;
  //           this.quitJobObj.employeeID = this.employeeId;
  //           this.formModel.currentData = this.quitJobObj;
  //           this.formGroup.patchValue(this.quitJobObj);
  //           this.cr.detectChanges();
  //           this.isAfterRender = true;
  //           console.log('data sau khi init', this.quitJobObj);
            
  //         }
  //       });
  //   } else {
  //     if (this.actionType === 'edit' || this.actionType === 'copy') {
  //       this.formModel.currentData = this.quitJobObj;
  //       this.formGroup.patchValue(this.quitJobObj);
  //       this.cr.detectChanges();
  //       this.isAfterRender = true;
  //     }
  //   }
  // }

  initForm() {
    this.formGroup.patchValue(this.quitJobObj);
    this.formModel.currentData = this.quitJobObj;
    this.cr.detectChanges();
    this.isAfterRender = true;
  }

  getECurrentContract(){
    if (!this.crrEContract) {
      //HR_EContracts
      let rqContract = new DataRequest();
      rqContract.entityName = 'HR_EContracts';
      rqContract.dataValues = this.employeeId + ';false;true';
      rqContract.predicates =
        'EmployeeID=@0 and IsAppendix=@1 and IsCurrent=@2';
      rqContract.page = 1;
      rqContract.pageSize = 1;

      this.hrSevice.getCrrEContract(rqContract).subscribe((res) => {
        debugger
        console.log('current contract', res);
        
        if (res && res[0]) {
          this.crrEContract = res[0][0];
        }
        else{
          this.crrEContract = null;
        }
        this.df.detectChanges();
      });
    }
  }

  setTitle(evt: any){
    this.headerText += " " +  evt;
    this.cr.detectChanges();
  }


  onInit(): void {
    this.getECurrentContract();

    if (!this.formGroup)
      this.hrSevice.getFormModel(this.funcID).then((formModel) => {
        if (formModel) {
          this.formModel = formModel;
          this.hrSevice
            .getFormGroup(this.formModel.formName, this.formModel.gridViewName , this.formModel)
            .then((fg) => {
              if (fg) {
                this.formGroup = fg;
                this.initForm();
              }
            });
        }
      });
    else
      this.hrSevice
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName , this.formModel)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
  }

  HandleInputSubmitDate(evt){
    this.quitJobObj.submitDate = evt.data;
    debugger
    if(this.quitJobObj.stoppedOn != null){
      if(this.crrEContract){
        this.hrSevice.getEContractQuitFortelDays(this.crrEContract).subscribe((res) => {
          console.log('so ngay la', res);
          
          if(res){
            this.quitJobObj.quitForetellDays = res;
        this.formGroup.patchValue({ quitForetellDays: this.quitJobObj.quitForetellDays });
          }
        })
      }

      if(this.quitJobObj.submitDate >= this.quitJobObj.stoppedOn){
        this.quitJobObj.violatedDays = 0;
        this.formGroup.patchValue({ violatedDays: this.quitJobObj.violatedDays });
      }
      else{
        let submitD = new Date(this.quitJobObj.submitDate)
        let stopOn = new Date(this.quitJobObj.stoppedOn)

        let dif = stopOn.getTime() - submitD.getTime();
        this.quitJobObj.violatedDays = dif / (1000 * 60 * 60 * 24) + 1;
        this.formGroup.patchValue({ violatedDays: this.quitJobObj.violatedDays });
      }
      console.log('so ngay nghi som', this.quitJobObj.violatedDays);
      
    }
  }

  HandleInputStopOn(evt){
    this.quitJobObj.stoppedOn = evt.data;
    if(this.quitJobObj.submitDate != null){
      if(this.crrEContract){
        this.hrSevice.getEContractQuitFortelDays(this.crrEContract).subscribe((res) => {
          console.log('so ngay la', res);
          if(res){
            this.quitJobObj.quitForetellDays = res;
        this.formGroup.patchValue({ quitForetellDays: this.quitJobObj.quitForetellDays });
          }
        })
      }
      if(this.quitJobObj.submitDate >= this.quitJobObj.stoppedOn){
        this.quitJobObj.violatedDays = 0;
        this.formGroup.patchValue({ violatedDays: this.quitJobObj.violatedDays });
      }
      else{
        let submitD = new Date(this.quitJobObj.submitDate)
        let stopOn = new Date(this.quitJobObj.stoppedOn)

        let dif = stopOn.getTime() - submitD.getTime();
        this.quitJobObj.violatedDays = dif / (1000 * 60 * 60 * 24) + 1;
        this.formGroup.patchValue({ violatedDays: this.quitJobObj.violatedDays });
      }
      console.log('so ngay nghi som', this.quitJobObj.violatedDays);

    }
  }

  onSaveForm() {
    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      this.form.form.validation(false);
      return;
    }

    this.hrSevice.SaveEmployeeQuitJobInfo(this.quitJobObj).subscribe((p) => {
      if (p != null) {
        console.log('du lieu tra ve', p);
        
        this.notify.notifyCode('SYS007');
        this.dialog && this.dialog.close(p);
      } else this.notify.notifyCode('SYS021');
    });
  }

}
