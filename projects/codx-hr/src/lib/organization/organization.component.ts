import {
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
  funcID: string = '';
  codxTreeView: CodxTreeviewComponent = null;
  dataService: CRUDService = null;
  templateActive: number = 0;
  @ViewChild('tempTree') tempTree: TemplateRef<any>;
  @ViewChild('panelRightLef') panelRightLef: TemplateRef<any>;
  @ViewChild('tmpOrgChart') tmpOrgChart: TemplateRef<any>;
  @ViewChild('tmpList') tmpList: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;

  @ViewChild('tmpMasterDetail') tmpMasterDetail: TemplateRef<any>;

  constructor(private inject: Injector) {
    super(inject);
  }

  onInit(): void {
    this.router.params.subscribe((params) => {
      if (params['funcID']) {
        this.funcID = params['funcID'];
        if (!this.funcID.includes('WP')) {
          this.button = {
            id: 'btnAdd',
          };
        }
      }
    });
    // this.dataService = new CRUDService(this.inject);
    // this.dataService.service = 'HR';
    // this.dataService.assemblyName = 'ERM.Business.HR';
    // this.dataService.className = 'OrganizationUnitsBusiness';
    // this.dataService.method = 'GetOrgAsync';
    // this.dataService.idField = 'OrgUnitID';
    // this.dataService.request.entityName = 'HR_OrganizationUnits';
    this.detectorRef.detectChanges();
  }

  ngAfterViewInit(): void {
    this.views = [
      // {
      //   id: '1',
      //   type: ViewType.tree_orgchart,
      //   sameData: true,
      //   active: false,
      //   model: {
      //     resizable: true,
      //     template: this.tempTree,
      //     panelRightRef: this.panelRightLef,
      //     template2: this.tmpOrgChart,
      //     resourceModel: { parentIDField: 'ParentID' },
      //   },
      // },
      {
        id: '1',
        type: ViewType.list,
        sameData: true,
        active: false,
        model: {
          template: this.itemTemplate,
        },
      },
      // {
      //   id: '2',
      //   type: ViewType.tree_masterdetail,
      //   sameData: true,
      //   active: false,
      //   model: {
      //     resizable: true,
      //     template: this.tempTree,
      //     panelRightRef: this.panelRightLef,
      //     template2: this.tmpMasterDetail,
      //   },
      // },
    ];
    // this.view.dataService.parentIdField = 'ParentID';
    this.detectorRef.detectChanges();
    // this.dataService.currentComponent =
      // this.view?.dataService?.currentComponent;
  }

  //loadEmployList
  loadEmployList(h, orgUnitID: string, abc) {}
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
  // delete data
  deleteData(data: any) {
    if (data) {
      this.view.dataService.delete([data],true).subscribe();
      // (this.dataService as CRUDService).delete([data], true).subscribe();
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
        action:event
      };
      let popup = this.callfc.openSide(
        PopupAddOrganizationComponent,
        object,
        option,
        this.view.formModel.funcID
      );
      popup.closed.subscribe((res: any) => {
        if (res.event) {
          let org = res.event[0];
          // let tmpOrg = res.event[1];
          this.getOrgInfor(org);
          // this.view.dataService.update(tmpOrg).subscribe();
          // this.view.dataService.add(org).subscribe();
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
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      this.view.dataService.copy(data).subscribe((result: any) => {
        if (result) {
          let data = {
            dataService: this.view.dataService,
            formModel: this.view.formModel,
            data: result,
            funcID: this.view.formModel.funcID,
            isAddMode: true,
            action:event,
            titleMore: event.text,
          };
          let popup = this.callfc.openSide(
            CodxFormDynamicComponent,
            data,
            option,
            this.view.formModel.funcID
          );
          popup.closed.subscribe((res: any) => {
            if (res.event.save.data) {
              let org = res.event.save.data;
              this.orgUnitID = org.orgUnitID;
              this.getOrgInfor(org);
              this.detectorRef.detectChanges();
            }
          });
        }
      });
    }
  }
  // change view
  changeView(evt: any) {
    this.currView = null;
    if (evt.view) {
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
    }
  }
  // button add toolbar
  btnClick(e) {
    debugger
    if (this.view) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      // let currentView: any = this.view.currentView;
      // if (currentView) {
      //   this.codxTreeView = currentView.currentComponent?.treeView;
      // }
      this.view.dataService.addNew()
      .subscribe((result: any) => {
        if (result) {
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
          popup.closed.subscribe((res: any) => {
            if (res.event.save.data) {
              let org = res.event.save.data;
              this.orgUnitID = org.orgUnitID;
              this.getOrgInfor(org);
              this.detectorRef.detectChanges();
            }
          });
        }
      });
    }
  }

  // convert org to tmp
  getOrgInfor(data){
    this.api.execSv("HR","ERM.Business.HR","OrganizationUnitsBusiness","GetOrgInforAsync",[data.orgUnitID])
    .subscribe((res:any) => {
      if(res){
        data.parentName = res.parentName;
        data.employeeManager = res.employeeManager;
        data.positionName = res.positionName;
        this.view.dataService.update(data).subscribe();
      }
    });
  }
}
