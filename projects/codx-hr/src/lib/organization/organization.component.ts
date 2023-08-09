import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
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
import { CodxHrService } from '../codx-hr.service';
import { OrganizationOrgchartComponent } from './organization-orgchart/organization-orgchart.component';
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
  codxTreeView: CodxTreeviewComponent = null;
  dataService: CRUDService = null;
  templateActive: number = 0;
  isCorporation: boolean = false;
  request: any = null;
  viewActive: string = '';
  count: any;
  buttonAdd: any = null;
  activeMFC:boolean = true; // ẩn hiện morefunction trong trang SDTC ngoài portal
  flagLoaded: boolean = false;
  @ViewChild('tempTree') tempTree: TemplateRef<any>;
  @ViewChild('panelRightLef') panelRightLef: TemplateRef<any>;
  @ViewChild('tmpOrgChart') tmpOrgChart: TemplateRef<any>;
  @ViewChild('tmpList') tmpList: TemplateRef<any>;
  @ViewChild('templateList') templateList: TemplateRef<any>;
  @ViewChild('templateTree') templateTree: TemplateRef<any>;
  @ViewChild(OrganizationOrgchartComponent)
  child: OrganizationOrgchartComponent;

  @ViewChild('tmpMasterDetail') tmpMasterDetail: TemplateRef<any>;
  // inject: Injector;

  constructor(
    inject: Injector,
    private activedRouter: ActivatedRoute,
    private hrService: CodxHrService,
    private df: ChangeDetectorRef
  ) {
    super(inject);
  }

  onInit(): void {
    // xử lý ẩn hiện button thêm + moreFC trong trang SDTC ngoài portal
    this.activedRouter.params.subscribe((param:any) => {
      let funcID = param["funcID"]; 
      if (funcID.includes('WP')) {
        this.button = null; 
        this.activeMFC = false;
      }
      else
      {
        this.button = {
          id: 'btnAdd',
        };
        this.activeMFC = true;
      }
    });
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
      {
        id: '1',
        type: ViewType.list,
        sameData: true,
        model: {
          template: this.templateList,
        },
      },
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
          template: this.tempTree,
          panelRightRef: this.tmpOrgChart,
          // panelRightRef: this.panelRightLef,
          // template2: this.tmpOrgChart,
          // resourceModel: { parentIDField: 'ParentID' },
        },
      },
    ];

    // this.detectorRef.detectChanges();
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
          //this.view.dataService.setDataSelected(data);
          this.copyData(data, event);
          //this.df.detectChanges();
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
    if (data) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;

      this.hrService
        .copy(data, this.view.formModel, 'OrgUnitID')
        .subscribe((res) => {
          // this.hrService
          //   .getDataDefault(
          //     this.view.formModel.funcID,
          //     'HR_OrganizationUnits',
          //     'OrgUnitID'
          //   )
          //   .subscribe((res) => {

          if (res) {
            let object = {
              data: res,
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
                this.view.dataService.add(res.event, 0).subscribe();
                this.flagLoaded = true;
              }
            });
          }
        });
    }
  }
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

  selectItemFromChild: string = '';

  getIdFromChild(e) {
    this.selectItemFromChild = e;
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
          if (this.selectItemFromChild) {
            result['parentID'] = this.selectItemFromChild;
          } else {
            result['parentID'] = this.orgUnitID;
          }
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
              this.view.dataService.add(res.event, 0).subscribe();
              //Update view chart diagram
              this.child.GetChartDiagram();
              this.flagLoaded = true;
            }
          });
        }
      });
    }
  }

  viewChanged(event: any) {
    if (this.viewActive !== event.view.id) {
      // if (this.viewActive !== event.view.id && this.flagLoaded) {
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
      // this.flagLoaded = false;
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
    this.lstMyTeam = [];
    this.pageIndex = 1;
    this.getMyTeam();
  }

  pageIndex: number = 1;
  total: number = 0;
  lstMyTeam: any[] = [];
  scrolling: boolean = false;
  orgId: string;

  //get my team
  getMyTeam() {
    this.api
      .execSv(
        'HR',
        'ERM.Business.HR',
        'OrganizationUnitsBusiness',
        'GetTreeEmployeeAsync',
        [this.orgId, this.pageIndex, this.searchText]
      )
      .subscribe((res: any[]) => {
        if (res && res[0].length > 0) {
          if (this.pageIndex == 1 || this.pageIndex == 2) {
            this.total = res[1];
          }
          this.lstMyTeam.push(...res[0]);
          if (this.lstMyTeam.length < this.total) {
            this.scrolling = true;
            this.pageIndex = this.pageIndex + 1;
          } else this.scrolling = false;
        } else this.scrolling = false;
        //this.dt.detectChanges();
      });
  }

  scroll(e: HTMLDivElement) {
    var total = e.offsetHeight + e.scrollTop;

    // if (this.scrolling && total == e.scrollHeight) {
    //   this.scrolling = false;
    //   this.getMyTeam();
    // }
    if (
      this.scrolling &&
      total <= e.scrollHeight + 2 &&
      total > e.scrollHeight - 2
    ) {
      this.scrolling = false;
      this.getMyTeam();
    }
  }

  //Click load employee
  clickOpen(event, data, employee) {
    this.lstMyTeam = employee.slice(0, 10);
    this.orgId = data;
    this.scrolling = true;
    this.pageIndex = 2;
    event.stopPropagation();
  }
}
