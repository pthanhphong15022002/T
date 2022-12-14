import {
  ChangeDetectorRef,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  ButtonModel,
  CodxFormDynamicComponent,
  CodxTreeviewComponent,
  CRUDService,
  DialogModel,
  DialogRef,
  NotificationsService,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxAdService } from 'projects/codx-ad/src/public-api';
import { PopupAddPositionsComponent } from './popup-add-positions/popup-add-positions.component';
import { ReportinglineDetailComponent } from './reportingline-detail/reportingline-detail.component';

@Component({
  selector: 'lib-reportingline',
  templateUrl: './reportingline.component.html',
  styleUrls: ['./reportingline.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ReportinglineComponent extends UIComponent {
  @ViewChild('tmpTree') tmpTree: TemplateRef<any>;
  @ViewChild('tmpRightRef') tmpRightRef: TemplateRef<any>;
  @ViewChild('tmpOrgchart') tmpOrgchart: TemplateRef<any>;
  @ViewChild('tmpList') tmpList: TemplateRef<any>;

  views: Array<ViewModel> = [];
  button?: ButtonModel;
  dialog!: DialogRef;
  moreFuncs: Array<ButtonModel> = [];
  funcID: string;
  posInfo: any = {};
  employees: any = [];
  itemSelected: any;
  countResource = 0;
  listEmployeeSearch = [];
  popoverCrr: any;
  allRoles: any;
  lstRoles: any;
  searchField: any;
  listEmployee = [];
  popoverDataSelected: any;
  orgUnitID: any;
  ListViewService: CRUDService;
  predicates = 'PositionID = @0';
  dataValues: string = '';
  isLoaded: boolean = false;
  detailComponent: any = null;
  dataSelected: any = null;
  positionID: string = '';
  request: ResourceModel;
  codxTreeView: CodxTreeviewComponent = null;
  isCorporation: boolean;
  constructor(
    private notifiSv: NotificationsService,
    inject: Injector,
    private dt: ChangeDetectorRef,
    private adService: CodxAdService
  ) {
    super(inject);
  }

  onInit(): void {
    this.funcID = this.router.snapshot.params['funcID'];
    this.request = new ResourceModel();
    this.request.service = 'HR';
    // this.request.assemblyName = 'CO';
    // this.request.className = 'MeetingsBusiness';
    // this.request.method = 'GetListMeetingsAsync';
    //this.request.idField = 'meetingID';
    this.adService.getListCompanySettings().subscribe((res) => {
      if (res) {
        this.isCorporation = res.isCorporation;
      }
    });
  }
  ngAfterViewInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.views = [
      {
        id: '1',
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.tmpList,
        },
      },
      {
        id: '2',
        type: ViewType.tree_orgchart,
        active: false,
        sameData: false,
        request: this.request,
        model: {
          resizable: true,
          template: this.tmpTree,
          panelRightRef: this.tmpOrgchart,
          resourceModel: { parentIDField: 'ReportTo' },
        },
      },
    ];
    //this.view.dataService.parentIdField = 'ReportTo';
    this.detectorRef.detectChanges();
  }

  viewChange(event: any) {}
  orgChartViewInit(component: any) {
    if (component) {
      this.detailComponent = component;
    }
  }
  // btn add toolbar click
  btnClick(event: any) {
    if (this.view) {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      if (this.views[1].active) {
        // modeView tree-orgchart
        let currentView: any = this.view.currentView;
        if (currentView) {
          this.codxTreeView = currentView.currentComponent?.treeView;
        }
      }
      this.view.dataService.addNew().subscribe((result: any) => {
        if (result) {
          let data = {
            dataService: this.view.dataService,
            formModel: this.view.formModel,
            data: result,
            function: this.funcID,
            isAddMode: true,
            titleMore: event.text,
            isCorporation: this.isCorporation,
          };
          let form = this.callfc.openSide(
            PopupAddPositionsComponent,
            data,
            option,
            this.funcID
          );
          form.closed.subscribe((res: any) => {
            if (res?.event?.save) {
              let node = res.event.save.data;
              this.codxTreeView.setNodeTree(node);
            }
          });
        }
      });
    }
  }
  // click moreFunction
  clickMF(event: any, data: any = null) {
    if (event) {
      switch (event.functionID) {
        case 'SYS03':
          this.edit(event, data);
          break;
        case 'SYS04':
          this.copy(event, data);
          break;
        case 'SYS02':
          this.delete(data);
          break;
      }
    }
  }
  edit(event: any, data: any) {
    if (this.view && data && event) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.view.dataService
        .edit(this.view.dataService.dataSelected)
        .subscribe((res) => {
          let object = {
            dataService: this.view.dataService,
            formModel: this.view.formModel,
            data: res,
            function: this.view.formModel.funcID,
            isAddMode: false,
            titleMore: event.text,
          };
          this.callfc.openSide(
            CodxFormDynamicComponent,
            object,
            option,
            this.view.formModel.funcID
          );
        });
    }
  }
  copy(event: any, data: any) {
    if (event && data) {
      this.view.dataService.dataSelected = data;
      this.view.dataService.copy(data).subscribe((res) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '550px';
        let object = {
          dataService: this.view.dataService,
          formModel: this.view.formModel,
          data: res,
          function: this.view.formModel.funcID,
          isAddMode: true,
          titleMore: event.text,
        };
        this.callfc.openSide(
          CodxFormDynamicComponent,
          object,
          option,
          this.view.formModel.funcID
        );
        // popup.closed.subscribe((res:any) => {
        //   debugger
        //   if(res?.event?.save)
        //   {
        //     let node = res.event.save.data;
        //     this.codxTreeView.setNodeTree(node);
        //   }
        // });
      });
    }
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'Delete';
    opt.className = 'PositionsBusiness';
    opt.assemblyName = 'ERM.Business.HR';
    opt.data = itemSelected.positionID;
    return true;
  }
  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.itemSelected = this.view.dataService.data[0];
          this.detectorRef.detectChanges();
        }
      });
  }
  loadEmployByCountStatus() {}

  // selected data
  onSelectionChanged(event) {
    if (this.view) {
      // let viewActive = this.view.views.find((e) => e.active == true);
      // if (viewActive?.id == '1') return;
      this.dataSelected = event.data;
      this.positionID = event.data.positionID;
      this.detectorRef.detectChanges();
    }
  }

  doubleClickItem(data: any) {
    if (this.view && data) {
      let option = new DialogModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.IsFull = true;
      this.callfc.openForm(
        ReportinglineDetailComponent,
        '',
        0,
        0,
        '',
        data,
        '',
        option
      );
    }
  }
  searchUser($event) {}
  searchChange(event: any) {}
}
