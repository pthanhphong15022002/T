import { ChangeDetectorRef, Component, Injector, Optional } from '@angular/core';
import { DialogData, DialogRef, FormModel, UIComponent } from 'codx-core';
import { CodxHrService } from 'projects/codx-hr/src/public-api';

@Component({
  selector: 'lib-popup-include-exclude-obj',
  templateUrl: './popup-include-exclude-obj.component.html',
  styleUrls: ['./popup-include-exclude-obj.component.css']
})
export class PopupIncludeExcludeObjComponent extends UIComponent {
  formGroup: any;
  constructor(
    private injector: Injector,
    private cr: ChangeDetectorRef,
    private df: ChangeDetectorRef,
    private hrSevice: CodxHrService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  ){
    super(injector);
    this.dialog = dialog;
    this.formModel = dialog?.formModel;
    this.headerText = data?.data?.headerText;
    this.funcID = data?.data?.funcID;
    this.policyObj = JSON.parse(JSON.stringify(data?.data?.dataObj));
  }
  
  dialog: DialogRef;
  policyObj: any;
  headerText: string;
  formModel: FormModel;
  lstOrgUnitID: any = []
  lstJobLevel: any = []
  lstPositionID: any = []
  lstEmployeeTypeID: any = []
  lstContractTypeID: any = []
  lstEmployeeID: any = []
  lstEmpStatus: any = []
  lstLabourType: any = []
  isAfterRender = false;

  lstSelectedObj: any = [];
  lstSelectedExcludeObj: any = [];

  lstPolicyBeneficiariesApply: any = []
  lstPolicyBeneficiariesExclude: any = []

  fmPolicyBeneficiaries: FormModel = {
    formName: 'PolicyBeneficiaries',
    gridViewName: 'grvPolicyBeneficiaries',
    entityName: 'HR_PolicyBeneficiaries',
  };

  onInit(): void {
    if (!this.formModel)
      this.hrSevice.getFormModel(this.funcID).then((formModel) => {
        if (formModel) {
          this.formModel = formModel;
          this.hrSevice
            .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
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
        .getFormGroup(this.formModel.formName, this.formModel.gridViewName, this.formModel)
        .then((fg) => {
          if (fg) {
            this.formGroup = fg;
            this.initForm();
          }
        });
  }

  loadEmpFullInfo(empID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'EmployeesBusiness_Old',
      'GetEmpFullInfoAsync',
      empID
    )
  }

  // GetApplyObjs(){
  //   return this.api.execSv<any>(
  //     'HR',
  //     'HR',
  //     'PolicyALBusiness_Old',
  //     'GetApplyObjsAsync',
  //     ['AL', this.policyObj.policyID, 0]
  //   );
  // }

  GetPolicyBeneficiaries(policyID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBeneficiariesBusiness_Old',
      'GetBeneficiariesAsync',
      policyID
    );
  }

  SplitToSubList(lstData){
    for(let i = 0; i < lstData.length; i++){
      let lstTemp = []
      if(lstData[i].orgUnitID){
        lstTemp =lstData[i].orgUnitID.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstOrgUnitID.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
      if(lstData[i].jobLevel){
        lstTemp =lstData[i].jobLevel.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstJobLevel.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
      if(lstData[i].positionID){
        lstTemp =lstData[i].positionID.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstPositionID.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
      if(lstData[i].labourType){
        lstTemp =lstData[i].labourType.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstLabourType.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
      if(lstData[i].employeeTypeID){
        lstTemp =lstData[i].employeeTypeID.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstEmployeeTypeID.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
      if(lstData[i].contractTypeID){
        lstTemp =lstData[i].contractTypeID.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstContractTypeID.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
      if(lstData[i].employeeID){
        lstTemp =lstData[i].employeeID.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.loadEmpFullInfo(lstTemp[j]).subscribe((res) => {
            this.lstEmployeeID.push({
              rec:lstData[i].recID,
              id:lstTemp[j],
              info: res[0],
              positionName: res[1]
            })
          })
        }
      }
      if(lstData[i].employeeStatus){
        lstTemp =lstData[i].employeeStatus.split(';')
        for(let j = 0; j < lstTemp.length; j++){
          this.lstEmpStatus.push({
            rec:lstData[i].recID,
            id:lstTemp[j]
          })
        }
      }
    }
  }

  initForm() {
        // this.GetApplyObjs().subscribe((res) => {
        //   this.lstPolicyBeneficiariesApply = res;
        // })

        if(this.policyObj.hasIncludeObjects == true){
          if(this.policyObj.includeObjects){
            this.lstSelectedObj = this.policyObj.includeObjects.split(';')
          }
        }
        if(this.policyObj.hasExcludeObjects == true){
          if(this.policyObj.excludeObjects){
            this.lstSelectedExcludeObj = this.policyObj.excludeObjects.split(';')
          }
        }
        this.GetPolicyBeneficiaries(this.policyObj.policyID).subscribe((res) => {
          this.lstPolicyBeneficiariesApply = res.filter((obj) => obj.category == 0);
        this.lstPolicyBeneficiariesApply = this.hrSevice.sortAscByProperty(this.lstPolicyBeneficiariesApply, 'priority');
          this.SplitToSubList(this.lstPolicyBeneficiariesApply);

          this.lstPolicyBeneficiariesExclude = res.filter((obj) => obj.category == 1);
        this.lstPolicyBeneficiariesExclude = this.hrSevice.sortAscByProperty(this.lstPolicyBeneficiariesExclude, 'priority');

          this.SplitToSubList(this.lstPolicyBeneficiariesExclude);
          this.formGroup.patchValue(this.policyObj);
          this.formModel.currentData = this.policyObj;
        })
        this.formGroup.patchValue(this.policyObj);
        this.formModel.currentData = this.policyObj;
        debugger
        this.cr.detectChanges();
        this.isAfterRender = true;
  }

}
