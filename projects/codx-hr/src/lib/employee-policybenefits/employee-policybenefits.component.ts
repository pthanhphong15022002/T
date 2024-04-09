import { ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthStore, ButtonModel, CallFuncService, CodxService, DialogModel, DialogRef, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { ActivatedRoute } from '@angular/router';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupPolicybenefitsComponent } from './popup-policybenefits/popup-policybenefits.component';
import { PopupIncludeExcludeObjComponent } from '../employee-policyal/popup-include-exclude-obj/popup-include-exclude-obj.component';

@Component({
  selector: 'lib-employee-policybenefits',
  templateUrl: './employee-policybenefits.component.html',
  styleUrls: ['./employee-policybenefits.component.css']
})
export class EmployeePolicybenefitsComponent extends UIComponent {
  @ViewChild('templateList') itemTemplate?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  ActionAdd = 'add'
  ActionEdit = 'edit'
  ActionCopy = 'copy'
  ActionDelete = 'delete'
  views: Array<ViewModel> = [];
  formGroup: FormGroup;
  dialog!: DialogRef;
  grvSetup: any;
  itemSelected: any;
  buttonAdd: ButtonModel[] = [{
    id: 'btnAdd',
  }];

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activatedRoute: ActivatedRoute,
    private auth: AuthStore,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private shareService: CodxShareService,
    private notify: NotificationsService,
    public override codxService : CodxService
  ){
    super(inject)
  }

  GetGvSetup() {
    let funID = this.activatedRoute.snapshot.params['funcID'];
    this.cache.functionList(funID).subscribe((fuc) => {
      this.cache
        .gridViewSetup(fuc?.formName, fuc?.gridViewName)
        .subscribe((res) => {
          this.grvSetup = res;
        });
    });
  }

  onInit(): void {
    this.GetGvSetup();
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          headerTemplate: this.headerTemplate,
        },
      },
    ];
  }

  Getchildbenefits(benefitID){

  }


  selectedChange(evt){
    this.itemSelected = evt.data;
  }


  ngAfterViewChecked() {
    if (!this.formGroup?.value) {
      this.hrService
        .getFormGroup(
          this.view?.formModel?.formName,
          this.view?.formModel?.gridViewName,
          this.view?.formModel
        )
        .then((res) => {
          this.formGroup = res;
        });
    }

  }

  addPolicyBenefit(evt) {
    if (evt.id == 'btnAdd') {
      this.HandlePolicyBenefit(
        evt.text,
        'add',
        null
      );
    }

    // this.add().subscribe((res) => {
    // })
  }

  add(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness_Old',
      'AddPolicyBenefitsAsync',
      null
    );
  }

  DeletePolicyDetailByPolicyID(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness_Old',
      'DeletePolicyDetailByPolicyIDAsync',
      data
    );
  }

  DeletePolicyConstraint(policyID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness_Old',
      'DeletePolicyConstraintsByPolicyIDAsync',
      policyID
    );
  }

  DeletePolicyBeneficiaries(policyID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBeneficiariesBusiness_Old',
      'DeletePolicyBeneficiariesAsync',
      policyID
    );
  }

  onClickOpenPopupDetailInfo(){

  }

  ViewIncludeExcludeObjects(data: any){
    if(data.hasIncludeObjects == false && data.hasExcludeObjects == false){
      return;
    }
    debugger
    let option = new DialogModel();
    option.zIndex = 999;
    let popup = this.callfunc.openForm(
      PopupIncludeExcludeObjComponent,
      null,
      550,
      550,
      this.view.funcID,
      {
        formModel: this.view.formModel,
        headerText: '',
        funcID: this.view.funcID,
        dataObj: data,
      },
      null,
      option
    );
  }

  deleteFile(data){
    //code xóa file luôn khi record chứa file bị xóa
    return this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'DeleteByObjectIDAsync',
        [data.policyID, this.view.formModel.entityName, true]
      );
}

  clickMF(event, data){
    switch(event.functionID){
      case 'SYS03': //edit
      this.HandlePolicyBenefit(event.text, this.ActionEdit, data);
        break;

      case 'SYS02': //delete
      this.view.dataService.delete([data]).subscribe((res) => {
        debugger
        if(data.attachments > 0){
          this.deleteFile(data).subscribe((res) => {
          })
        }
        if(data.hasIncludeObjects == true || data.hasExcludeObjects == true){
          this.DeletePolicyBeneficiaries(data.policyID).subscribe((res) =>{
          })
        }
        if(data.isConstraintOther){
          this.DeletePolicyConstraint(data.policyID).subscribe((res) => {
          })
        }
        this.DeletePolicyDetailByPolicyID(data).subscribe((res) => {
        })
      });
        break;

      case 'SYS04': //copy
        this.copyValue(event.text, data);
        break;

    }
  }

  copyValue(actionHeaderText, data) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      this.HandlePolicyBenefit(
        actionHeaderText,
        'copy',
        res
      );
    });
  }

  HandlePolicyBenefit(actionHeaderText, actionType: string, data: any){
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '850px';
    console.log('header text ne', this.view.function.description);
    let dialg = this.callfc.openSide(
      PopupPolicybenefitsComponent,
      {
        actionType: actionType,
        dataObj: data,
        headerText: actionHeaderText + " ", //+ this.view.function.description,
        funcID: this.view.funcID,
      },
      option
    );
    dialg.closed.subscribe((res) => {
      if(res.event){
        this.view.dataService.data = [];
        this.view.dataService.load().subscribe((rrr) => {
          // this.view.dataService.data = rrr;
        });
      }
      // if (res.event) {
      //   if (actionType == this.ActionAdd) {
      //     this.view.dataService.add(res.event, 0).subscribe();
      //   } else if (actionType == this.ActionCopy) {
      //     this.view.dataService.add(res.event, 0).subscribe();
      //   } else if (actionType == this.ActionEdit) {
      //     debugger
      //     if(res.event && res.event?.editPrimaryKey && res.event.editPrimaryKey == true){
      //       debugger
      //       this.view.dataService.delete([res.event.oldData], false,null,null,null,null, null, false).subscribe(() => {
      //         this.view.dataService.add(res.event, 0).subscribe();
      //       });
      //     }
      //     else{
      //       this.view.dataService.update(res.event).subscribe();
      //     }
      //   }
      //   this.df.detectChanges();
      // }
    })
  };

}
