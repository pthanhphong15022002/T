import { dialog } from '@syncfusion/ej2-angular-spreadsheet';
import { 
  Component, 
  OnInit,
  ChangeDetectorRef,
  Injector,
  TemplateRef,
  ViewChild
} from '@angular/core';

import{
  SidebarModel,
  UIComponent,
  NotificationsService,
  FormModel,
  DialogModel,
  CallFuncService,
  DialogRef,
  ViewType,
  ViewModel,
} from 'codx-core'

import { EmployeeAllocatedPropertyDetailComponent } from '../employee-allocated-property-detail/employee-allocated-property-detail.component';

@Component({
  selector: 'lib-employee-allocated-property',
  templateUrl: './employee-allocated-property.component.html',
  styleUrls: ['./employee-allocated-property.component.css']
})
export class EmployeeAllocatedPropertyComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  dialog: DialogRef;
  data = ['test list'];
  itemDetail;
  views: Array<ViewModel> = []

  funcID = 'HRT03a1'
  service = 'HR';
  assemblyName = 'HR';
  entity = 'HR_EmpAwards';
  className = 'EmpAwardsBusiness';
  idField = 'recID';

  constructor(
    private inject: Injector,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
  ) { super(inject)}

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
}
