import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
import { PopupAddNewHRComponent } from './popup-add-new-hr/popup-add-new-hr.component';

@Component({
  selector: 'lib-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
})
export class EmployeeListComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef
  ) {
    super(inject);
  }

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;

  itemSelected;
  onInit(): void {}

  ngAfterViewInit() {
    this.button = {
      id: 'btnAdd',
    };
    this.views = [
      {
        id: '1',
        type: ViewType.grid,
        active: true,
        sameData: true,
        model: {
          panelLeftRef: this.panelLeftRef,
          // resources: this.columnsGrid,
        },
      },
    ];
  }

  addNewHR() {
    let option = new SidebarModel();
    option.DataService = this.view?.dataService;
    option.FormModel = this.view?.formModel;

    option.Width = '800px';
    let addNewHRDialog = this.callfc.openSide(
      PopupAddNewHRComponent,
      null,
      option
    );
  }
}
