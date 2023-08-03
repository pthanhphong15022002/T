import { ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ButtonModel, CallFuncService, DialogRef, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewType, FormModel } from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { ActivatedRoute } from '@angular/router';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupPolicyalComponent } from './popup-policyal/popup-policyal.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';

@Component({
  selector: 'lib-employee-policyal',
  templateUrl: './employee-policyal.component.html',
  styleUrls: ['./employee-policyal.component.css']
})
export class EmployeePolicyalComponent extends UIComponent{
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
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
  };

  constructor(
    inject: Injector,
    private hrService: CodxHrService,
    private activatedRoute: ActivatedRoute,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private shareService: CodxShareService,
    private notify: NotificationsService
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

  onClickOpenPopupDetailInfo(){

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

  ngAfterViewChecked() {
    if (!this.formGroup?.value) {
      this.hrService
        .getFormGroup(
          this.view?.formModel?.formName,
          this.view?.formModel?.gridViewName
        )
        .then((res) => {
          this.formGroup = res;
        });
    }
  }

  addPolicyAL(evt) {
    if (evt.id == 'btnAdd') {
      this.HandlePolicyAL(
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
      'PolicyALBusiness',
      'AddPolicyALAsync',
      null
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

  DeletePolicyBeneficiaries(policyID){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBeneficiariesBusiness',
      'DeletePolicyBeneficiariesAsync',
      policyID
    );
  }

  DeletePolicyDetailByPolicyID(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyALBusiness',
      'DeletePolicyDetailByPolicyIDAsync',
      data
    );
  }


  clickMF(event, data){
    switch(event.functionID){
      case 'SYS03': //add
      this.HandlePolicyAL(event.text, this.ActionEdit, data);
        break;

      case 'SYS02': //delete
      this.view.dataService.delete([data]).subscribe((res)=>{
        debugger
        this.deleteFile(data).subscribe((res) => {
          debugger
        })
        this.DeletePolicyBeneficiaries(data.policyID).subscribe((res) => {
          debugger
        })
        this.DeletePolicyDetailByPolicyID(data.policyID).subscribe((res) => {
          debugger
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
      this.HandlePolicyAL(
        actionHeaderText,
        'copy',
        res
      );
    });}


  HandlePolicyAL(actionHeaderText, actionType: string, data: any){
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '850px';
    let dialg = this.callfc.openSide(
      PopupPolicyalComponent,
      {
        actionType: actionType,
        dataObj: data,
        headerText: actionHeaderText + " " + this.view.function.description,
        funcID: this.view.funcID,
      },
      option
    );
    dialg.closed.subscribe((res) => {
      debugger
      if (res.event) {
        if (actionType == this.ActionAdd) {
          this.view.dataService.add(res.event, 0).subscribe();
        } else if (actionType == this.ActionCopy) {
          this.view.dataService.add(res.event, 0).subscribe();
        } else if (actionType == this.ActionEdit) {
          this.view.dataService.update(res.event).subscribe();
        }
        this.df.detectChanges();
      }
    })
  };

}