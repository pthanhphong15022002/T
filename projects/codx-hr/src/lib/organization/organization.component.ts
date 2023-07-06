import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CRUDService,
  CodxTreeviewComponent,
  DataRequest,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddOrganizationComponent } from './popup-add-organization/popup-add-organization.component';
@Component({
  selector: 'lib-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  // encapsulation: ViewEncapsulation.None,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrgorganizationComponent extends UIComponent {
  console = console;
  views: Array<ViewModel> = [];
  button: ButtonModel;
  orgUnitID: string = '';
  parentID: string = '';
  detailComponent: any;
  dataSource: any[] = [];
  treeComponent?: CodxTreeviewComponent;
  currentView: any;
  currView?: TemplateRef<any>;
  start = '<span class="opacity-50">';
  end = '</span>';
  funcID: string;
  codxTreeView: CodxTreeviewComponent = null;
  dataService: CRUDService = null;
  templateActive: number = 0;
  isCorporation: boolean = false;
  request: any = null;
  viewActive: string = '';
  count: any;
  buttonAdd: ButtonModel = {
    id: 'btnAdd',
  };
  flagLoaded: boolean = false;
  @ViewChild('tempTree') tempTree: TemplateRef<any>;
  @ViewChild('panelRightLef') panelRightLef: TemplateRef<any>;
  @ViewChild('tmpOrgChart') tmpOrgChart: TemplateRef<any>;
  @ViewChild('tmpList') tmpList: TemplateRef<any>;
  @ViewChild('templateList') templateList: TemplateRef<any>;
  @ViewChild('templateTree') templateTree: TemplateRef<any>;

  @ViewChild('tmpMasterDetail') tmpMasterDetail: TemplateRef<any>;
  // inject: Injector;

  constructor(inject: Injector, private activedRouter: ActivatedRoute) {
    super(inject);
  }

  onInit(): void {
    // this.dataService = new CRUDService(this.inject);
    // this.dataService.service = 'HR';
    // this.dataService.assemblyName = 'ERM.Business.HR';
    // this.dataService.className = 'OrganizationUnitsBusiness';
    // this.dataService.method = 'GetOrgAsync';
    // this.dataService.idField = 'OrgUnitID';
    // this.dataService.request.entityName = 'HR_OrganizationUnits';
    // this.detectorRef.detectChanges();

    //this.api.execSv("HR","ERM.Business.HR","OrganizationUnitsBusiness","InitOrgHierarchyAsync").subscribe();
  }

  ngAfterViewInit(): void {
    this.request = new ResourceModel();
    this.request.service = 'HR';
    this.request.assemblyName = 'ERM.Business.HR';
    this.request.className = 'OrganizationUnitsBusiness';
    this.request.method = 'GetDataOrgAsync';
    this.request.autoLoad = false;
    this.request.parentIDField = 'ParentID';
    this.views = [
      // {
      //   id: '1',
      //   type: ViewType.list,
      //   sameData: true,
      //   model: {
      //     template: this.templateList,
      //   },
      // },
      {
        id: '2',
        type: ViewType.listtree,
        sameData: false,
        request: this.request,
        model: {
          template: this.templateTree,
          // resourceModel: { parentIDField: 'ParentID' },
        },
      },
      // {
      //   id: '3',
      //   type: ViewType.tree_masterdetail,
      //   // active: false,
      //   sameData: false,
      //   request: this.request,
      //   model: {
      //     resizable: true,
      //     template: this.tempTree,
      //     panelRightRef: this.tmpMasterDetail,
      //   },
      // },
      {
        id: '4',
        type: ViewType.tree_orgchart,
        sameData: false,
        request: this.request,
        model: {
          resizable: true,
          template: this.tempTree,
          panelRightRef: this.tmpOrgChart,
          // panelRightRef: this.panelRightLef,
          // template2: this.tmpOrgChart,
          // resourceModel: { parentIDField: 'ParentID' },
        },
      },
    ];

    this.detectorRef.detectChanges();
  }

  //loadEmployList
  // loadEmployList(h, orgUnitID: string, abc) {}
  // click moreFC
  clickMF(event: any, data: any) {
    if (event) {
      switch (event.functionID) {
        case 'SYS02': //delete
          this.deleteData(data);
          break;
        case 'SYS03': // edit
          this.editData(data, event);
          break;
        case 'SYS04': // copy
          this.copyData(data, event);
          break;
        default:
          break;
      }
    }
  }

  //Call api delete
  beforeDelete(opt: RequestOption, id) {
    opt.methodName = 'DeleteEOrgChartAsync';
    opt.className = 'OrganizationUnitsBusiness';
    opt.assemblyName = 'HR';
    opt.service = 'HR';
    opt.data = id;
    return true;
  }

  // delete data
  deleteData(data: any) {
    if (data) {
      this.view.dataService
        .delete([data], true, (option: RequestOption) =>
          this.beforeDelete(option, data.orgUnitID)
        )
        .subscribe();
      this.flagLoaded = true;
    }
  }
  // edit data
  editData(data: any, event: any) {
    if (this.view) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      let object = {
        data: data,
        funcID: this.view.formModel.funcID,
        isModeAdd: false,
        titleMore: event.text,
        action: event,
      };
      let popup = this.callfc.openSide(
        PopupAddOrganizationComponent,
        object,
        option,
        this.view.formModel.funcID
      );
      popup.closed.subscribe((res: any) => {
        if (res.event) {
          this.view.dataService.update(res.event).subscribe();
          this.flagLoaded = true;
        }
      });
    }
  }
  // copy data
  copyData(data: any, event: any) {
    if (data && event) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      this.view.dataService.copy().subscribe((result: any) => {
        if (result) {
          let object = {
            data: result,
            funcID: this.view.formModel.funcID,
            isModeAdd: true,
            titleMore: event.text,
            action: event,
          };
          let popup = this.callfc.openSide(
            PopupAddOrganizationComponent,
            object,
            option,
            this.view.formModel.funcID
          );
          popup.closed.subscribe((res: any) => {
            if (res.event) {
              this.view.dataService.add(res.event).subscribe();
            }
          });
        }
      });
    }
  }
  // change view
  // changeView(evt: any) {
  // this.currView = null;
  // if (evt.view) {
  //   this.templateActive = evt.view.type;
  //   this.currView = evt.view.model.template2;
  // }
  // this.detectorRef.detectChanges();
  // }
  // selected change
  onSelectionChanged(evt: any) {
    if (this.view) {
      //Fix load when click on mode list
      let viewActive = this.view.views.find((e) => e.active == true);
      if (viewActive?.id == '1') {
        return;
      } else {
        var data = evt.data || evt;
        this.orgUnitID = data.orgUnitID;
      }
      // this.detectorRef.detectChanges();
    }
  }
  // button add toolbar
  btnClick(e) {
    if (this.view) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      this.view.dataService.addNew().subscribe((result: any) => {
        if (result) {
          result['parentID'] = this.orgUnitID;
          let object = {
            data: result,
            funcID: this.view.formModel.funcID,
            isModeAdd: true,
            titleMore: e.text,
            action: e,
          };
          let popup = this.callfc.openSide(
            PopupAddOrganizationComponent,
            object,
            option,
            this.view.formModel.funcID
          );
          popup.closed.subscribe((res: any) => {
            if (res.event) {
              this.view.dataService.add(res.event).subscribe();
              this.flagLoaded = true;

              this.view.dataService.setDataSelected(res.event);
            }
          });
        }
      });
    }
  }

  viewChanged(event: any) {
    // if (this.viewActive !== event.view.id) {
    if (this.viewActive !== event.view.id && this.flagLoaded) {
      if (event?.view?.id === '1') {
        this.view.dataService.data = [];
        this.view.dataService.parentIdField = '';
      } else {
        this.view.dataService.parentIdField = 'ParentID';
      }

      if (
        this.view.currentView.dataService &&
        this.view.currentView.dataService.currentComponent
      ) {
        this.view.currentView.dataService.data = [];
        this.view.currentView.dataService.currentComponent.dicDatas = {};
      }

      //check update data when CRUD or not
      this.flagLoaded = false;
      this.view.dataService.page = 0;

      //Prevent load data when click same id
      this.viewActive = event.view.id;
      this.view.currentView.dataService.load().subscribe();
      //this.view.dataService.load().subscribe();
    }
  }

  // convert org to tmp
  // getOrgInfor(data) {
  //   this.api
  //     .execSv(
  //       'HR',
  //       'ERM.Business.HR',
  //       'OrganizationUnitsBusiness',
  //       'GetOrgInforAsync',
  //       [data.orgUnitID]
  //     )
  //     .subscribe((res: any) => {
  //       if (res) {
  //         data.parentName = res.parentName;
  //         data.employeeManager = res.employeeManager;
  //         data.positionName = res.positionName;
  //         this.view.dataService.update(data).subscribe();
  //       }
  //     });
  // }

  // search employee in popup view list employee
  searchText: string = '';
  searchUser(event: any) {
    this.searchText = event;
  }

  clickOpen(event) {
    event.stopPropagation();
  }
}
