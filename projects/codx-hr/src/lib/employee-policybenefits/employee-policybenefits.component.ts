import { ChangeDetectorRef, Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ButtonModel, CallFuncService, DialogRef, NotificationsService, SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { ActivatedRoute } from '@angular/router';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { PopupPolicybenefitsComponent } from './popup-policybenefits/popup-policybenefits.component';

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
    console.log('view ne', this.view);
  }

  Getchildbenefits(benefitID){

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

  addPolicyBenefit(evt) {
    // if (evt.id == 'btnAdd') {
    //   this.HandlePolicyBenefit(
    //     evt.text,
    //     'add',
    //     null
    //   );
    // }

    this.add().subscribe((res) => {
      
    })
  }

  add(){
    return this.api.execSv<any>(
      'HR',
      'HR',
      'PolicyBenefitsBusiness',
      'AddPolicyBenefitsAsync',
      null
    );
  }

  onClickOpenPopupDetailInfo(){

  }

  clickMF(event, data){
    switch(event.functionID){
      case 'SYS03': //add
      this.HandlePolicyBenefit(event.text, this.ActionEdit, data);
        break;

      case 'SYS02': //delete
      this.view.dataService.delete([data]).subscribe();
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
    debugger
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    console.log('header text ne', this.view.function.description);
    
    let dialg = this.callfc.openSide(
      PopupPolicybenefitsComponent,
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
