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
  ButtonModel,
} from 'codx-core'

import { EmployeeLegalPassportFormComponent } from '../employee-legal-passport-form/employee-legal-passport-form.component';

@Component({
  selector: 'lib-employee-legal-passport-info',
  templateUrl: './employee-legal-passport-info.component.html',
  styleUrls: ['./employee-legal-passport-info.component.css']
})
export class EmployeeLegalPassportInfoComponent extends UIComponent implements OnInit {

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
