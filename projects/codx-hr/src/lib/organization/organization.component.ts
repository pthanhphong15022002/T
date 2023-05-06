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
import { CodxAdService } from 'projects/codx-ad/src/public-api';
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
  isCorporation:boolean = false;
  @ViewChild('tempTree') tempTree: TemplateRef<any>;
  @ViewChild('panelRightLef') panelRightLef: TemplateRef<any>;
  @ViewChild('tmpOrgChart') tmpOrgChart: TemplateRef<any>;
  @ViewChild('tmpList') tmpList: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;

  @ViewChild('tmpMasterDetail') tmpMasterDetail: TemplateRef<any>;

  constructor(
    private inject: Injector) {
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
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        id: '1',
        type: ViewType.list,
        sameData: true,
        active: false,
        model: {
          template: this.itemTemplate,
        },
      },
    ];
    this.detectorRef.detectChanges();

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
          this.view.dataService.update(res.event).subscribe();
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
      this.view.dataService.copy()
      .subscribe((result: any) => {
        if (result) {
          let object = {
            data: result,
            funcID: this.view.formModel.funcID,
            isModeAdd: true,
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
              this.view.dataService.add(res.event).subscribe();
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
    if (this.view) {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      this.view.dataService.addNew()
      .subscribe((result: any) => {
        if (result) {
          result["parentID"] = this.orgUnitID;
          let object = {
            data: result,
            funcID: this.view.formModel.funcID,
            isModeAdd: true,
            titleMore: e.text,
            action:e
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
