import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ConsoleLogger } from '@microsoft/signalr/dist/esm/Utils';
import {
  ButtonModel,
  CodxFormDynamicComponent,
  CodxTreeviewComponent,
  CRUDService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
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
  dataSource: any[] = [];
  dataCard: any = new Array();
  treeComponent?: CodxTreeviewComponent;
  currentView: any;
  currView?: TemplateRef<any>;
  start = '<span class="opacity-50">';
  end = '</span>';
  funcID: string = "";
  codxTreeView:CodxTreeviewComponent= null;
  templateActive:number = 0;

  dataService:CRUDService = null;
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
    this.dataService = new CRUDService(this.inject);
    this.dataService.service = "HR";
    this.dataService.assemblyName = "ERM.Business.HR";
    this.dataService.className = "OrganizationUnitsBusiness";
    this.dataService.method = "GetOrgAsync";
    this.dataService.idField = "OrgUnitID";
    this.dataService.request.entityName = "HR_OrganizationUnits";
    this.detectorRef.detectChanges();
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
        id: '1',
        type: ViewType.tree_list,
        sameData: true,
        active: false,
        model: {
          resizable: true,
          template: this.tempTree,
          panelRightRef: this.panelRightLef,
          template2: this.tmpList,
          resourceModel: { parentIDField: 'ParentID' }
        },
      },
      {
        id: '2',
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
    if (evt.view) 
    {
      this.templateActive = evt.view.type;
      this.currView = evt.view.model.template2;
    }
    this.detectorRef.detectChanges();
  }
  // selected change
  onSelectionChanged(evt: any) {
    var data = evt.data || evt;
    if (data && this.orgUnitID !== data.orgUnitID) 
    {
      this.orgUnitID = data.orgUnitID;
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

  // get data master detail
  data:any[] = [];
  getDataMasterDetail(orgUnitID:string){
    this.api.execSv(
      "HR",
      "ERM.Business.HR",
      "OrganizationUnitsBusiness",
      "GetEmployeesMasterDetailAsync",
      [orgUnitID])
      .subscribe((res:any) => {
        debugger
        this.data= res[0];
      });
  }
}
