import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import {
  ButtonModel,
  CodxFormDynamicComponent,
  CodxTreeviewComponent,
  CRUDService,
  FormatvaluePipe,
  FormModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { map, Observable, of } from 'rxjs';
import { CodxHrService } from '../codx-hr.service';
import { PopupAddOrganizationComponent } from './popup-add-organization/popup-add-organization.component';

@Component({
  selector: 'lib-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrgorganizationComponent extends UIComponent {
  views: Array<ViewModel> = [];
  button: ButtonModel;
  orgUnitID: string = '';
  parentID: string = '';
  detailComponent: any;
  dataDetail: any = new Array();
  dataCard: any = new Array();
  treeComponent?: CodxTreeviewComponent;
  currentView: any;
  currView?: TemplateRef<any>;
  numberLV: string = '3';
  onlyDepartment?: boolean = false;
  formModelEmployee: FormModel = {
    formName: 'Employees',
    gridViewName: 'grvEmployees',
  };
  setupEmp?: any;
  start = '<span class="opacity-50">';
  end = '</span>';
  funcID: string = "";
  codxTreeView:CodxTreeviewComponent= null;
  @ViewChild('tempTree') tempTree: TemplateRef<any>;
  @ViewChild('panelRightLef') panelRightLef: TemplateRef<any>;
  @ViewChild('tmpOrgChart') tmpOrgChart: TemplateRef<any>;
  @ViewChild('tmpList') tmpList: TemplateRef<any>;
  @ViewChild('tmpMasterDetail') tmpMasterDetail: TemplateRef<any>;

  constructor(private inject: Injector) 
  {
    super(inject);
  }

  onInit(): void {
    this.router.params.subscribe((params) => {
      if (params['funcID']) 
      {
        this.funcID = params['funcID'];
        if (!this.funcID.includes('WP')) {
          this.button = {
            id: 'btnAdd',
          };
        }
      }
    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.tree_orgchart,
        sameData: true,
        active: false,
        model: {
          resizable: true,
          template: this.tempTree,
          panelRightRef: this.panelRightLef,
          template2: this.tmpOrgChart,
          resourceModel: { parentIDField: 'ParentID' }

        },
      },
      {
        id: '2',
        type: ViewType.tree_list,
        sameData: true,
        active: true,
        model: {
          resizable: true,
          template: this.tempTree,
          panelRightRef: this.panelRightLef,
          template2: this.tmpList,
          resourceModel: { parentIDField: 'ParentID' }
        },
      },
      {
        id: '3',
        type: ViewType.tree_masterdetail,
        sameData: true,
        active: false,
        model: {
          resizable: true,
          template: this.tempTree,
          panelRightRef: this.panelRightLef,
          template2: this.tmpMasterDetail,
        }
      }
    ];
    this.view.dataService.parentIdField = 'ParentID';
    this.detectorRef.detectChanges();
  }
  // change view
  changeView(evt: any) {
    this.currView = null;
    if (evt.view) {
      this.currView = evt.view.model.template2;
    }
  }
  // selected change
  onSelectionChanged(evt: any) {
    var data = evt.data || evt;
    if (data && this.orgUnitID != data.orgUnitID) {
      this.orgUnitID = data.orgUnitID;
      this.parentID = data.parentID;
      this.detectorRef.detectChanges();
    }
  }
  // button add toolbar
  btnClick(e) {
    if (this.view) 
    {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      let currentView:any = this.view.currentView;
      if(currentView)
      {
        this.codxTreeView = currentView.currentComponent?.treeView;
      }
      this.view.dataService.addNew()
      .subscribe((result: any) => {
        if (result) {
          result.parentID = this.view.dataService.dataSelected.orgUnitID;
          let data = {
            dataService: this.view.dataService,
            formModel: this.view.formModel,
            data: result,
            function: this.funcID,
            isAddMode: true,
            titleMore: e.text,
          };
          let popup = this.callfc.openSide(
            CodxFormDynamicComponent,
            data,
            option,
            this.funcID
          );
        }
      });
    }
  }
  loadEmployList(e, orgid, status) {}
}
