import { ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ButtonModel, CallFuncService, DialogRef, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
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

  addPolicyGeneral(evt) {
    if (evt.id == 'btnAdd') {
      this.HandlePolicyGeneral(
        evt.text + ' ' + this.view.function.description,
        'add',
        null
      );
    }
  }

  clickMF(event, data){
    switch(event.functionID){
      case 'SYS03': //add
        break;

      case 'SYS02': //delete
        break;

      case 'SYS04': //copy
        this.copyValue(event.text, data);
        break;

    }
  }

  copyValue(actionHeaderText, data) {
    this.hrService.copy(data, this.view.formModel, 'RecID').subscribe((res) => {
      this.HandlePolicyGeneral(
        actionHeaderText + ' ' + this.view.function.description,
        'copy',
        res
      );
    });
  }

  HandlePolicyGeneral(actionHeaderText, actionType: string, data: any){
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '850px';
    let dialg = this.callfc.openSide(
      PopupPolicygeneralComponent,
      {
        actionType: actionType,
        dataObj: data,
        headerText: actionHeaderText,
        funcID: this.view.funcID,
      },
      option
    );
    dialg.closed.subscribe((res) => {
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
