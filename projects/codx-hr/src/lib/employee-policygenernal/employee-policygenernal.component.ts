import { ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ButtonModel, CallFuncService, CodxService, DialogRef, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { ActivatedRoute } from '@angular/router';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxOdService } from 'projects/codx-od/src/public-api';
import { PopupPolicygeneralComponent } from './popup-policygeneral/popup-policygeneral.component';

@Component({
  selector: 'lib-employee-policygenernal',
  templateUrl: './employee-policygenernal.component.html',
  styleUrls: ['./employee-policygenernal.component.css']
})
export class EmployeePolicygenernalComponent extends UIComponent {
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
    console.log('view ne', this.view);
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

  addPolicyGeneral(evt) {
    if (evt.id == 'btnAdd') {
      this.HandlePolicyGeneral(
        evt.text,
        'add',
        null
      );
    }
  }

  changeItemDetail(evt){
    this.itemSelected = evt.data;
  }

  clickMF(event, data){
    switch(event.functionID){
      case 'SYS03': //add
      this.HandlePolicyGeneral(event.text, this.ActionEdit, data);
        break;

      case 'SYS02': //delete
      this.view.dataService.delete([data]).subscribe();

      // this.DeletePolicyGeneral(data).subscribe((res) => {
      //   debugger
      //   if(res == true){
      //     this.notify.notifyCode('SYS008');
      //   }
      // });

        break;

      case 'SYS04': //copy
        this.copyValue(event.text, data);
        break;

    }
  }

  copyValue(actionHeaderText, data) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      this.HandlePolicyGeneral(
        actionHeaderText,
        'copy',
        res
      );
    });
  }

  DeletePolicyGeneral(data){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyGeneralBusiness_Old',
      'DeletePolicyGeneralAsync',
      data.policyID
    );
  }

  HandlePolicyGeneral(actionHeaderText, actionType: string, data: any){
    debugger
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    let dialg = this.callfc.openSide(
      PopupPolicygeneralComponent,
      {
        actionType: actionType,
        dataObj: data,
        headerText: actionHeaderText + " " + this.view.function.description,
        funcID: this.view.funcID,
      },
      option
    );
    dialg.closed.subscribe((res) => {
      if (res.event) {
        debugger
        if (actionType == this.ActionAdd) {
          this.view.dataService.add(res.event, 0).subscribe();
        } else if (actionType == this.ActionCopy) {
          this.view.dataService.add(res.event, 0).subscribe();
        } else if (actionType == this.ActionEdit) {
          debugger
          if(res.event && res.event?.editPrimaryKey && res.event.editPrimaryKey == true){
            this.view.dataService.delete([res.event.oldData], false,null,null,null,null, null, false).subscribe(() => {
              this.view.dataService.add(res.event, 0).subscribe();
            });
          }
          else{
            this.view.dataService.update(res.event).subscribe();
          }
        }
        this.df.detectChanges();
      }
    })
  };

}
