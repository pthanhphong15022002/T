import { ChangeDetectorRef, Component, Injector, OnInit, Optional } from '@angular/core';
import { CallFuncService, DialogData, DialogModel, DialogRef, FormModel, NotificationsService, UIComponent, Util } from 'codx-core';
import { CodxHrService } from '../../codx-hr.service';
import { FormGroup } from '@angular/forms';
import { PopupMultiselectvllComponent } from '../../employee-policyal/popup-multiselectvll/popup-multiselectvll.component';

@Component({
  selector: 'lib-popup-policybenefits',
  templateUrl: './popup-policybenefits.component.html',
  styleUrls: ['./popup-policybenefits.component.css']
})
export class PopupPolicybenefitsComponent 
extends UIComponent
implements OnInit{
  lstSelectedBenefits: any = []

  formModel: FormModel;
  formGroup: FormGroup;
  dialog: DialogRef;
  funcID: string;
  actionType: string;
  idField = 'PolicyID';
  isAfterRender = false;
  headerText: string;
  benefitPolicyObj: any;
  autoNumField: any;
  benefitFormModel: any;

  currentRec: any;
  currentCbxName: any;
  currentCbxValue: any = [];

  lstPolicyBeneficiariesApply: any = []
  lstPolicyBeneficiariesExclude: any = []

  lstOrgUnitID: any = []
  lstJobLevel: any = []
  lstPositionID: any = []
  lstEmployeeTypeID: any = []
  lstContractTypeID: any = []
  lstEmployeeID: any = []
  lstEmpStatus: any = []
  lstLabourType: any = []
  lstSelectedObj: any = [];
  isHidden = true;
  isHidden2 = true;

  fmPolicyBeneficiaries: FormModel = {
    formName: 'PolicyBeneficiaries',
    gridViewName: 'grvPolicyBeneficiaries',
    entityName: 'HR_PolicyBeneficiaries',
  };

  grvSetup
  grvSetupPolicyDetail
  benefitFuncID = 'HRTEM0403'

  fieldHeaderTexts;
  policyIdEdited = false;
  originPolicyId = '';
  currentTab = '';

  tabInfo: any[] = [
    {
      icon: 'icon-info',
      text: 'Thông tin chung',
      name: 'overallInfo',
    },
    {
      icon: 'icon-info',
      text: 'Mô tả chính sách',
      name: 'policyInfo',
    },
    {
      icon: 'icon-settings',
      text: 'Thiết lập',
      name: 'setting',
    },
    {
      icon: 'icon-how_to_reg',
      text: 'Đối tượng áp dụng',
      name: 'applyObj',
    },
    {
      icon: 'icon-person_remove',
      text: 'Đối tượng loại trừ',
      name: 'subtractObj',
    },
  ];

  constructor(
    private injector: Injector,
    private df: ChangeDetectorRef,
    private notify: NotificationsService,
    private hrSevice: CodxHrService,
    private callfunc: CallFuncService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ){
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.actionType = data?.data?.actionType;
    this.benefitPolicyObj = JSON.parse(JSON.stringify(data?.data?.dataObj));
    if(this.benefitPolicyObj && this.actionType == 'edit'){
      this.originPolicyId = this.benefitPolicyObj.policyID;
    }
  }

  onInit(): void {
    if(!this.benefitFormModel){
      this.hrSevice.getFormModel(this.benefitFuncID).then((formModel) => {
        if(formModel){
          console.log('benefit form model', formModel);
          
          this.benefitFormModel = formModel;
        }
      })
    }

    if (!this.formModel)
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
    else
      this.hrSevice
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
  }

  changeTab(event){
    this.currentTab = event.nextId;
  }

  ValChangeHasInclueObj(event){
    let flag = event.data;

    if(flag == false){
      this.benefitPolicyObj.hasIncludeObjects = false;
    }
  }

  swap(afterIndex, lstData){
    let temp = lstData[afterIndex]
    lstData[afterIndex] = lstData[afterIndex-1]
    lstData[afterIndex-1] = temp;
  }

  fixPriorityIndex(list){
    for(let i = 0; i < list.length; i++){
      list[i].priority = i+1;
    }
  }

  onClickDeleteObject(data){
    this.notify.alertCode('SYS030').subscribe((x) =>{
      if (x.event?.status == 'Y') {
        if(this.currentTab == 'applyObj'){
          let index = this.lstPolicyBeneficiariesApply.indexOf(data);
          if(index != -1){
            this.lstPolicyBeneficiariesApply.splice(index, 1);
            this.lstPolicyBeneficiariesApply = this.hrSevice.sortAscByProperty(this.lstPolicyBeneficiariesApply, 'priority');
            this.fixPriorityIndex(this.lstPolicyBeneficiariesApply)
          }
        }
        else if(this.currentTab == 'subtractObj'){
          let index = this.lstPolicyBeneficiariesExclude.indexOf(data);
          if(index != -1){
            this.lstPolicyBeneficiariesExclude.splice(index, 1);
            this.lstPolicyBeneficiariesExclude = this.hrSevice.sortAscByProperty(this.lstPolicyBeneficiariesExclude, 'priority');
            this.fixPriorityIndex(this.lstPolicyBeneficiariesExclude)
          }
        }
        this.df.detectChanges();
      }
    })
  }

  onClickMoveObjUp(obj){
    let crrPriority = obj.priority;
    let objBeforeIndex : any;
    if(this.currentTab == 'applyObj'){
      objBeforeIndex = this.lstPolicyBeneficiariesApply.findIndex(p => p.priority == crrPriority -1);
      obj.priority -= 1;
      if(objBeforeIndex > -1){
        this.lstPolicyBeneficiariesApply[objBeforeIndex].priority += 1;
        this.swap(objBeforeIndex+1, this.lstPolicyBeneficiariesApply);
      }
    }
    else if(this.currentTab == 'subtractObj'){
      objBeforeIndex = this.lstPolicyBeneficiariesExclude.findIndex(p => p.priority == crrPriority -1);
      obj.priority -= 1;
      if(objBeforeIndex > -1){
        this.lstPolicyBeneficiariesExclude[objBeforeIndex].priority += 1;
        this.swap(objBeforeIndex+1, this.lstPolicyBeneficiariesExclude);
      }
    }
    this.df.detectChanges();
  }

  onClickOpenSelectIncludeObj(){
    if(this.benefitPolicyObj.hasIncludeObjects){
      let opt = new DialogModel();
      let popup = this.callfunc.openForm(
        PopupMultiselectvllComponent,
        null,
        400,
        450,
        null,
        {
          headerText: 'Chọn đối tượng áp dụng',
          vllName : 'HRObject',
          formModel: this.formModel,
          dataSelected: this.benefitPolicyObj.includeObjects
        },
        null,
        opt
      );
      popup.closed.subscribe((res) => {
        if(res.event){
          this.benefitPolicyObj.includeObjects = res.event
          this.lstSelectedObj = res.event.split(';')
          this.df.detectChanges();
        }
      });
    }
  }

  onClickOpenSelectApplyObjDetail(detail, obj){
    
    this.currentRec = obj.recID;
    if(this.benefitPolicyObj.hasIncludeObjects){
      if(detail == '5' || detail == '8'){
        let vll = detail == '5' ? 'HR022':'HR003'
        let dtSelected = [];
        let fil = [];
        if(vll == 'HR022'){
          fil = this.lstLabourType.filter((obj) => obj.rec == this.currentRec);
        }
        else if(vll == 'HR003'){
          fil = this.lstEmpStatus.filter((obj) => obj.rec == this.currentRec);
        }
        for(let i = 0; i < fil.length; i++){
          dtSelected.push(fil[i].id);
        }
        let dtSelectedStr = dtSelected.join(';')
          let opt = new DialogModel();
          let popup = this.callfunc.openForm(
            PopupMultiselectvllComponent,
            null,
            400,
            450,
            null,
            {
              headerText: 'Chọn đối tượng',
              vllName : vll,
              formModel: this.formModel,
              dataSelected: dtSelectedStr
            },
            null,
            opt
          );
          popup.closed.subscribe((res) => {
            let index = this.lstPolicyBeneficiariesApply.findIndex((x: any) => this.currentRec == x['recID'])
            let lstId = res.event.split(';');
            if(vll  == 'HR022'){
              this.lstPolicyBeneficiariesApply[index].labourType = res.event;
              this.lstLabourType = this.lstLabourType.filter((obj) => obj.rec != this.currentRec);
              for(let i = 0; i < lstId.length; i++){
                this.lstLabourType.push({
                  rec:this.lstPolicyBeneficiariesApply[index].recID,
                  id:lstId[i]
                });
              }
            }
            else if(vll = 'HR003'){
              
              this.lstPolicyBeneficiariesApply[index].employeeStatus = res.event;
              this.lstEmpStatus = this.lstEmpStatus.filter((obj) => obj.rec != this.currentRec);
              for(let i = 0; i < lstId.length; i++){
                this.lstEmpStatus.push({
                  rec:this.lstPolicyBeneficiariesApply[index].recID,
                  id:lstId[i]
                });
              }
            }
            // this.lstPolicyBeneficiariesApply[index].
            // this.lstPolicyBeneficiariesApply.push(this.policyBeneficiariesDetail);
            
            this.df.detectChanges();
          });
      }
      else{
        switch(detail){
          case '1':
            
            this.currentCbxName = 'HRDepts';
            this.currentCbxValue = obj.orgUnitID;
            // this.policyBeneficiariesDetail.cbxVllName = 'HRDepts';
            // this.policyBeneficiariesDetail.fieldName = 'OrgUnitID';
            break; 
          case '2':
            this.currentCbxName = 'JobLevels';
            this.currentCbxValue = obj.jobLevel;
            // this.policyBeneficiariesDetail.cbxVllName = 'JobLevels';
            // this.policyBeneficiariesDetail.fieldName = 'JobLevel';
            break; 
          case '3':
            this.currentCbxName = 'PositionsName';
            this.currentCbxValue = obj.positionID;

            // this.policyBeneficiariesDetail.cbxVllName = 'PositionsName';
            // this.policyBeneficiariesDetail.fieldName = 'PositionID';
            break; 
          case '4':
            this.currentCbxName = 'EmployeeTypes';
            this.currentCbxValue = obj.employeeTypeID;

            // this.policyBeneficiariesDetail.cbxVllName = 'EmployeeTypes';
            // this.policyBeneficiariesDetail.fieldName = 'EmployeeTypeID';
            break; 
          case '6':
            this.currentCbxName = 'ContractTypes';
            this.currentCbxValue = obj.contractTypeID;

            // this.policyBeneficiariesDetail.cbxVllName = 'ContractTypes';
            // this.policyBeneficiariesDetail.fieldName = 'ContractTypeID';
            break; 
          case '7':
            this.currentCbxName = 'Employees';
            this.currentCbxValue = obj.employeeID;

            // this.policyBeneficiariesDetail.cbxVllName = 'Employees';
            // this.policyBeneficiariesDetail.fieldName = 'EmployeeID';
            break; 
        }
        this.isHidden = false;
        this.df.detectChanges();
      }
    }
  }

  onInputPolicyID(evt){
    if(this.actionType == 'edit'){
      this.policyIdEdited = true;
    }
  }

  setTitle(evt: any){
    this.headerText += " " +  evt;
    this.df.detectChanges();
  }

  initForm() {
    this.hrSevice.getHeaderText(this.formModel.funcID).then((res) => {
      this.fieldHeaderTexts = res;
    })
    this.cache
    .gridViewSetup(
      this.formModel.formName,
      this.formModel.gridViewName
    )
    .subscribe((res) => {
      this.grvSetup = res;
      console.log('grvSetup', this.grvSetup);
      
    });

    this.cache
    .gridViewSetup(
      'PolicyDetails',
      'grvPolicyDetails'
    )
    .subscribe((res) => {
      this.grvSetupPolicyDetail = res;

    });


    if (this.actionType == 'add') {
      this.hrSevice
        .getDataDefault(
          this.formModel.funcID,
          this.formModel.entityName,
          this.idField
        )
        .subscribe((res: any) => {
          if (res) {
            if(res.key){
              this.autoNumField = res.key;
            }
            res.data.status = '1'
            
            if (res.data.activeOn == '0001-01-01T00:00:00') {
              res.data.activeOn = null;
            }
            this.benefitPolicyObj = res?.data;
            
            this.formModel.currentData = this.benefitPolicyObj;
            this.formGroup.patchValue(this.benefitPolicyObj);
            this.df.detectChanges();
            this.isAfterRender = true;
          }
        });
    } else {
      if (this.actionType === 'edit' || this.actionType === 'copy') {

      }
    }

  }

  ValChangeHasIncludeBenefits(event){
    let flag = event.data;

    if(flag == false){
      this.benefitPolicyObj.hasIncludeBenefits = false;
    }
  }

  addApplyObj(){
    let newObj = {}
    newObj['recID'] = Util.uid();
    newObj['policyID'] = this.benefitPolicyObj.policyID;
    newObj['priority'] = this.lstPolicyBeneficiariesApply.length + 1;
    newObj['policyType'] = 'Benefit';
    newObj['category'] = '0';
    let lstFieldName = []

    for (let i = 0; i < this.lstSelectedObj.length; i++) {
      let fieldName: any;
      switch(this.lstSelectedObj[i]){
        case '1':
          fieldName = 'orgUnitID'
          break;
        case '2':
          fieldName = 'jobLevel'
          break;
        case '3':
          fieldName = 'positionID'
          break;
        case '4':
          fieldName = 'employeeTypeID'
          break;
        case '5':
          fieldName = 'labourType'
          break;
        case '6':
          fieldName = 'contractTypeID'
          break;
        case '7':
          fieldName = 'employeeID'
          break;
        case '8':
          fieldName = 'employeeStatus'
          break;
      }
      lstFieldName.push(fieldName);
      newObj[fieldName] = '';
    }
    this.lstPolicyBeneficiariesApply.push(newObj)
    
    this.df.detectChanges()
  }

  onClickHideComboboxPopup2(e): void {
    if(e == null){
      this.isHidden2 = true;
    this.detectorRef.detectChanges();
      return;
    }
    if(e.id){
        this.benefitPolicyObj.includeBenefits = e.id;
    }
    else{
      this.benefitPolicyObj.includeBenefits = null;
    }
    this.isHidden2 = true;

    if(this.benefitPolicyObj.includeBenefits){
      this.lstSelectedBenefits = this.benefitPolicyObj.includeBenefits.split(';')
    }
    else{
      this.lstSelectedBenefits = [];
    }
    this.detectorRef.detectChanges();
  }

  onClickOpenSelectIncludeBenefits(){
    if(this.benefitPolicyObj.hasIncludeBenefits){
      this.isHidden2 = false;
    }
  }

  loadEmpFullInfo(empID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness',
      'GetEmpFullInfoAsync',
      empID
    )
  }

  onClickHideComboboxPopup(event){
    
    this.isHidden = true;
    if(event == null){
      this.detectorRef.detectChanges();
      return;
    }
    else if(event.id){
      let index = 0;
      if(this.currentTab == 'applyObj'){
        index = this.lstPolicyBeneficiariesApply.findIndex((x: any) => this.currentRec == x['recID'])
      }
      else if(this.currentTab == 'subtractObj'){
        index = this.lstPolicyBeneficiariesExclude.findIndex((x: any) => this.currentRec == x['recID'])
      }
      let lstId = event.id.split(';');
      switch(this.currentCbxName){
        case 'HRDepts':
          if(this.currentTab == 'applyObj'){
            this.lstPolicyBeneficiariesApply[index].orgUnitID = event.id;
          }
          else{
            this.lstPolicyBeneficiariesExclude[index].orgUnitID = event.id;
          }
          this.lstOrgUnitID = this.lstOrgUnitID.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
            this.lstOrgUnitID.push({
              rec:this.currentRec,
              id:lstId[i]
            });
          }
          break;
        case 'JobLevels':
          if(this.currentTab == 'applyObj'){
            this.lstPolicyBeneficiariesApply[index].jobLevel = event.id;
          }
          else{
            this.lstPolicyBeneficiariesExclude[index].jobLevel = event.id;
          }
          this.lstJobLevel = this.lstJobLevel.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
            this.lstJobLevel.push({
              rec:this.currentRec,
              id:lstId[i]
            });
          }
          break;
        case 'PositionsName':
          if(this.currentTab == 'applyObj'){
          this.lstPolicyBeneficiariesApply[index].positionID = event.id;
          }
          else{
            this.lstPolicyBeneficiariesExclude[index].positionID = event.id;
          }
          this.lstPositionID = this.lstPositionID.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
            this.lstPositionID.push({
              rec:this.currentRec,
              id:lstId[i]
            });
          }
          break;
        case 'EmployeeTypes':
          if(this.currentTab == 'applyObj'){
              this.lstPolicyBeneficiariesApply[index].employeeTypeID = event.id;
            }
            else{
              this.lstPolicyBeneficiariesExclude[index].employeeTypeID = event.id;
            }
          this.lstEmployeeTypeID = this.lstEmployeeTypeID.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
            this.lstEmployeeTypeID.push({
              rec:this.currentRec,
              id:lstId[i]
            });
          }
          break;
        case 'ContractTypes':
          if(this.currentTab == 'applyObj'){
            this.lstPolicyBeneficiariesApply[index].contractTypeID = event.id;
          }
          else{
            this.lstPolicyBeneficiariesExclude[index].contractTypeID = event.id;
          }
          this.lstContractTypeID = this.lstContractTypeID.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
            this.lstContractTypeID.push({
              rec:this.currentRec,
              id:lstId[i]
            });
          }
          break;
        case 'Employees':
          if(this.currentTab == 'applyObj'){
          this.lstPolicyBeneficiariesApply[index].employeeID = event.id;
          }
          else{
            
            this.lstPolicyBeneficiariesExclude[index].employeeID = event.id;
          }
          this.lstEmployeeID = this.lstEmployeeID.filter((obj) => obj.rec != this.currentRec);
          for(let i = 0; i < lstId.length; i++){
              this.loadEmpFullInfo(lstId[i]).subscribe((res) => {
                this.lstEmployeeID.push({
                  rec:this.currentRec,
                  id:lstId[i],
                  info: res[0],
                  positionName: res[1]
                })
              })
          }
          break;
    }
  }
}

  onClickMoveObjDown(obj){
    
    let crrPriority = obj.priority;
    let objAfterIndex : any;
    if(this.currentTab == 'applyObj'){
      objAfterIndex = this.lstPolicyBeneficiariesApply.findIndex(p => p.priority == crrPriority +1);
      obj.priority += 1;
      if(objAfterIndex > 0){
        this.lstPolicyBeneficiariesApply[objAfterIndex].priority -= 1;
        this.swap(objAfterIndex, this.lstPolicyBeneficiariesApply);
        // let temp = this.lstPolicyBeneficiariesApply[objAfterIndex]
        // this.lstPolicyBeneficiariesApply[objAfterIndex] = this.lstPolicyBeneficiariesApply[objAfterIndex-1]
        // this.lstPolicyBeneficiariesApply[objAfterIndex-1] = temp;
      }
    }
    else if(this.currentTab == 'subtractObj'){
      objAfterIndex = this.lstPolicyBeneficiariesExclude.findIndex(p => p.priority == crrPriority +1);
      obj.priority += 1;
      if(objAfterIndex > 0){
        this.lstPolicyBeneficiariesExclude[objAfterIndex].priority -= 1;
        this.swap(objAfterIndex, this.lstPolicyBeneficiariesExclude);
      }
    }
    this.df.detectChanges();
  }



  async onSaveForm(){
    if (this.formGroup.invalid) {
      this.hrSevice.notifyInvalid(this.formGroup, this.formModel);
      return;
    }

    if(this.benefitPolicyObj.activeOn && this.benefitPolicyObj.expiredOn){
      if (this.benefitPolicyObj.expiredOn < this.benefitPolicyObj.activeOn) {
        this.hrSevice.notifyInvalidFromTo(
          'ActiveOn',
          'ExpiredOn',
          this.formModel
          )
          return;
        }
    }

    if(this.benefitPolicyObj.hasIncludeBenefits == true && !this.benefitPolicyObj.includeBenefits){
      this.notify.notifyCode('HR018')
    }

    if(this.actionType === 'add' || this.actionType === 'copy'){
      this.AddPolicyBenefits(this.benefitPolicyObj).subscribe((res) => {
        if(res){
            this.notify.notifyCode('SYS006');
            for(let i = 0; i < this.lstPolicyBeneficiariesApply.length; i++){
              debugger
              this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesApply[i]).subscribe((res) => {
                
              })
            }
            // for(let i = 0; i < this.lstPolicyBeneficiariesExclude.length; i++){
            //   this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesExclude[i]).subscribe((res) => {
                
            //   })
            // }
          this.dialog && this.dialog.close(this.benefitPolicyObj);
        }
        else{
          // this.notify.notifyCode('SYS023');
        }
      })
    }
    else if(this.actionType === 'edit'){
      if(this.originPolicyId != '' && this.originPolicyId != this.benefitPolicyObj.policyID){
        this.EditPolicyBenefitsIDChanged().subscribe((res) => {
          if(res){
            this.notify.notifyCode('SYS007');
            this.DeletePolicyBeneficiaries(this.benefitPolicyObj.policyID).subscribe((res) => {
              for(let i = 0; i < this.lstPolicyBeneficiariesApply.length; i++){
                debugger
                this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesApply[i]).subscribe((res) => {
                  
                })
              }
              for(let i = 0; i < this.lstPolicyBeneficiariesExclude.length; i++){
                debugger
                this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesExclude[i]).subscribe((res) => {
                  
                })
              }
              this.dialog && this.dialog.close(this.benefitPolicyObj);
            })
          }
          else{
            this.notify.notifyCode('SYS023');
          }
        })
      }
      else{
        this.EditPolicyBenefits(this.benefitPolicyObj).subscribe((res) => {
          if(res){
            this.notify.notifyCode('SYS007');
            // this.DeletePolicyBeneficiaries(this.benefitPolicyObj.policyID).subscribe((res) => {
            //   for(let i = 0; i < this.lstPolicyBeneficiariesApply.length; i++){
            //     this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesApply[i]).subscribe((res) => {
                  
            //     })
            //   }
            //   for(let i = 0; i < this.lstPolicyBeneficiariesExclude.length; i++){
            //     this.AddPolicyBeneficiaries(this.lstPolicyBeneficiariesExclude[i]).subscribe((res) => {
                  
            //     })
            //   }
            //   this.dialog && this.dialog.close(this.benefitPolicyObj);
            // })
          }
          else{
            this.notify.notifyCode('SYS023');
          }
        })
      }
    }
}

  //#region apis
  AddPolicyBeneficiaries(obj){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBeneficiariesBusiness',
      'AddPolicyBeneficiariesAsync',
      obj
    );
  }

  DeletePolicyBeneficiaries(policyID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBeneficiariesBusiness',
      'DeletePolicyBeneficiariesAsync',
      policyID
    );
  }

  AddPolicyBenefits(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'AddPolicyBenefitsAsync',
      data
    );
  }

  EditPolicyBenefits(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'UpdateBenefitPolicyAsync',
      data
    );
  }

  EditPolicyBenefitsIDChanged(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'UpdatePolicyBenefitPolicyIDChangedAsync',
      [this.benefitPolicyObj, this.originPolicyId]
    );
  }

  //#endregion
}
