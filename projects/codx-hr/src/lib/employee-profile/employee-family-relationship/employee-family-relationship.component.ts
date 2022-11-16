import { 
  Component, 
  ChangeDetectorRef, 
  Injector, 
  TemplateRef, 
  ViewChild, 
  OnInit
} from '@angular/core';

import {
  SidebarModel,
  UIComponent,
  NotificationsService,
  FormModel,
  DialogModel,
  CallFuncService,
  DialogRef,
  ViewType,
  ViewModel,
  ButtonModel,
} from 'codx-core'
import { EmployeeFamilyRelationshipDetailComponent } from '../employee-family-relationship-detail/employee-family-relationship-detail.component';

@Component({
  selector: 'lib-employee-family-relationship',
  templateUrl: './employee-family-relationship.component.html',
  styleUrls: ['./employee-family-relationship.component.css']
})
export class EmployeeFamilyRelationshipComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  dialog: DialogRef;
  data;
  itemDetail;
  views: Array<ViewModel> = [];

  funcID = 'TMT0201'
  service = 'TM';
  assemblyName = 'TM';
  entity = 'TM_Task';
  className = 'TaskBusiness';
  method='GetTaskAsync'
  idField = 'recID';


  // funcID = 'HRT03a1'
  // service = 'HR';
  // assemblyName = 'HR';
  // entity = 'HR_EFamilies';
  // className = 'EmployeesBusiness';
  // idField = 'recID';

  constructor(
    private inject: Injector,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
  ) {
    super(inject)
    // this.funcID = this.dialog.formModel.funcID;
   }

   @ViewChild('panelRight') panelRight: TemplateRef<any>;
   @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;

  onInit(): void {
  }

  ngAfterViewInit(): void{
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
        }
      }
    ];
    this.df.detectChanges();
  }

  changeItemDetail(event){
    this.itemDetail = event?.data;
  }

  click(evt: ButtonModel){
    switch(evt.id){
      case 'btnAdd':
        this.addNew();
        break;
    }
  }

  addNew(evt?){
    this.view.dataService.dataSelected = this.data;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px'
    let dialogAdd = this.callfunc.openSide(
      EmployeeFamilyRelationshipDetailComponent,{
        isAdd: true,
        headerText: 'Quan hệ gia đình',
      },
      option
    );
    dialogAdd.closed.subscribe((res) => {
      if(!res?.event) this.view.dataService.clear();
    })
  }
}
