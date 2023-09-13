import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  CRUDService,
  CodxTreeviewComponent,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxHrService } from '../codx-hr.service';
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
  views: Array<ViewModel>;
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
  buttonAdd: ButtonModel;
  formModelEmployee;
  activeMFC: boolean = true; // ẩn hiện morefunction trong trang SDTC ngoài portal
  flagLoaded: boolean = false;
  funcIDCheck;
  @ViewChild('tempTree') tempTree: TemplateRef<any>;
  @ViewChild('panelRightLef') panelRightLef: TemplateRef<any>;
  @ViewChild('tmpOrgChart') tmpOrgChart: TemplateRef<any>;
  @ViewChild('tmpList') tmpList: TemplateRef<any>;
  @ViewChild('templateList') templateList: TemplateRef<any>;
  @ViewChild('templateTree') templateTree: TemplateRef<any>;
  // @ViewChild(OrganizationOrgchartComponent)
  // child: OrganizationOrgchartComponent;

  @ViewChild('tmpMasterDetail') tmpMasterDetail: TemplateRef<any>;
  // inject: Injector;

  constructor(inject: Injector, private hrService: CodxHrService) {
    super(inject);
  }

  onInit(): void {
    this.hrService.getFormModel('HRT03a1').then((res) => {
      if (res) {
        this.formModelEmployee = res;
      }
    });

    // xử lý ẩn hiện button thêm + moreFC trong trang SDTC ngoài portal
    this.router.params.subscribe((param: any) => {
      let funcID = param['funcID'];

      //Set funcID to check view list mode in afterviewinit
      this.funcIDCheck = funcID;
      if (funcID.includes('WP')) {
        this.buttonAdd = null;
        this.activeMFC = false;
      } else {
        this.buttonAdd = {
          id: 'btnAdd',
        };
        this.activeMFC = true;
      }
      this.detectorRef.detectChanges();
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

    if (this.funcIDCheck.includes('WP')) {
      this.views = [
        {
          id: '1',
          type: ViewType.list,
          sameData: true,
          model: {
            template: this.templateList,
          },
        },
      ];
    } else {
      this.views = [
        {
          id: '2',
          type: ViewType.listtree,
          sameData: false,
          request: this.request,
          model: {
            template: this.templateTree,
          },
        },
        {
          id: '3',
          type: ViewType.tree_orgchart,
          sameData: false,
          request: this.request,
          model: {
            template: this.tempTree,
            panelRightRef: this.tmpOrgChart,
          },
        },
      ];
    }
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
          res.orgUnitID = '';
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

  itemAdded;
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
              //Update view chart diagram
              this.itemAdded = res.event;

              this.view.dataService.add(res.event).subscribe();
              // this.child.GetChartDiagram();
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
  click = false;
  pageIndex: number = 1;
  total: number = 0;
  lstMyTeam: any[] = [];
  scrolling: boolean = false;
  orgId: string;

  searchUser(event: any) {
    this.searchText = event;
    this.lstMyTeam = [];
    this.pageIndex = 1;

    if (this.searchText !== '' || this.searchText === '') {
      this.scrolling = false;

      if (!this.scrolling) {
        this.getMyTeam();
      }
    }
  }

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
      total > e.scrollHeight - 2 &&
      this.click
    ) {
      this.scrolling = false;
      this.getMyTeam();
    }
    //Use reset div height
    this.click = true;
  }

  clickOpen(event, data, employee) {
    this.lstMyTeam = [];
    this.pageIndex = 2;
    if (employee.length > 10) {
    } else {
      this.lstMyTeam = employee.slice(0, 10);
    }
    this.searchText = '';
    this.scrolling = true;

    this.orgId = data;
    //Use reset div height
    this.click = false;
    event.stopPropagation();
  }

  preventDedefault(e) {
    e.stopPropagation();
  }
}
