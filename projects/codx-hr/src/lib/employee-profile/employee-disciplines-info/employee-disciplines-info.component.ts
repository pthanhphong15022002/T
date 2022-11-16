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

import { EmployeeDisciplinesDetailComponent } from '../employee-disciplines-detail/employee-disciplines-detail.component';

@Component({
  selector: 'lib-employee-disciplines-info',
  templateUrl: './employee-disciplines-info.component.html',
  styleUrls: ['./employee-disciplines-info.component.css']
})
export class EmployeeDisciplinesInfoComponent extends UIComponent implements OnInit {
  formModel: FormModel;
  dialog: DialogRef;
  data;
  itemDetail;
  views: Array<ViewModel> = []

  funcID = 'HRT03a1'
  service = 'HR';
  assemblyName = 'HR';
  entity = 'HR_EmpDisciplines';
  className = 'EmpDisciplinesBusiness';
  idField = 'recID';

  constructor(
    private inject: Injector,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
  ) { super(inject) }

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
