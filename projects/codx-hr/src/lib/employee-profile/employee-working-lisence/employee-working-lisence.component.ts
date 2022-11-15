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

import { EmployeeWorkingLisenceDetailComponent } from '../employee-working-lisence-detail/employee-working-lisence-detail.component';

@Component({
  selector: 'lib-employee-working-lisence',
  templateUrl: './employee-working-lisence.component.html',
  styleUrls: ['./employee-working-lisence.component.css']
})
export class EmployeeWorkingLisenceComponent extends UIComponent implements OnInit {
  FormModel: FormModel;
  dialog: DialogRef;
  data;
  itemDetail;
  views: Array<ViewModel> = []

  funcID = ''
  service: 'HR'
  assemblyName = 'HR'
  entity = 'HR_EmpPassports'
  className = 'EmpPassportsBusiness'
  method=''
  idField = ''

  constructor(
    private inject: Injector,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
  ) { 
    super(inject)
  }

  @ViewChild('panelRight') panelRight: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;

  onInit(): void {
  }

  ngAfterViewInit(): void{
    this.views=[
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
        }
      }
    ]
    this.df.detectChanges();
  }

}
