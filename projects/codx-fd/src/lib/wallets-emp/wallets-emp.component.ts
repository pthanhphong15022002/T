import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  AuthService,
  ButtonModel,
  CallFuncService,
  NotificationsService,
  ResourceModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';

@Component({
  selector: 'lib-wallets-emp',
  templateUrl: './wallets-emp.component.html',
  styleUrls: ['./wallets-emp.component.scss'],
})
export class WalletsEmpComponent extends UIComponent {
  user = null;
  grvSetup: any;
  views: Array<ViewModel> = [];
  button: ButtonModel[] = null;
  itemSelected: any = null;
  cardType = '';
  selectedID: string = '';
  grdViewSetup: any = null;
  ratingVLL: string = '';

  /* #region request */
  request: ResourceModel;
  idField = 'employeeID';
  entityName = 'HR_Employees';
  // entityPermission = 'HR_Employees';
  // formName = 'EmployeeInfomation';
  // gridViewName = 'grvEmployeeInfomation';
  service = 'HR';
  assemblyName = 'ERM.Business.HR';
  className = 'EmployeesBusiness';
  method = 'GetListEmployeeAsync';
  /* #endregion */

  /* #region template */
  @ViewChild('tempTree') tempTree: TemplateRef<any>;
  @ViewChild('tmpMasterDetail') tmpMasterDetail: TemplateRef<any>;
  /* #endregion */

  constructor(
    private inject: Injector,
    private notifiSV: NotificationsService,
    private auth: AuthService,
    private notiService: NotificationsService,
    private callFC: CallFuncService
  ) {
    super(inject);
    this.user = this.auth.userValue;
  }

  onInit(): void {}

  ngAfterViewInit(): void {
    this.request = new ResourceModel();
    this.request.service = 'HR';
    this.request.assemblyName = 'ERM.Business.HR';
    this.request.className = 'EmployeesBusiness';
    this.request.method = 'GetListEmployeeAsync';
    this.request.autoLoad = false;
    this.request.parentIDField = 'ParentID';
    this.request.idField = 'orgUnitID';

    this.views = [
      {
        id: '2',
        type: ViewType.tree_masterdetail,
        request: this.request,
        sameData: false,
        model: {
          resizable: false,
          isCustomize: true,
          template: this.tempTree,
          panelRightRef: this.tmpMasterDetail,
          resourceModel: { parentIDField: 'ParentID', idField: 'OrgUnitID' },
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  initDataService() {
    this.view.dataService.parentIdField = 'ParentID';
    this.view.dataService.idField = 'orgUnitID';
    this.view.idField = 'orgUnitID';
  }

  selectedChange(val: any) {
    this.itemSelected = val.data;
    this.detectorRef.detectChanges();
  }

  viewChanging(event: any) {
    if (event?.view?.id === '2' || event?.id === '2') {
      this.view.dataService.parentIdField = 'ParentID';
      this.view.dataService.idField = 'orgUnitID';
      this.view.idField = 'orgUnitID';
    }
  }

  viewChanged(event: any) {
    if (event?.view?.id == '2' || event?.id == '2') {
      this.view.currentView.dataService.load().subscribe();
    }
  }
}
