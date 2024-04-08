import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { AuthService, ButtonModel, CallFuncService, NotificationsService, ResourceModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { CodxFdService } from '../codx-fd.service';
import { PopupWalletHistoryComponent } from '../wallets-emp/popup-wallet-history/popup-wallet-history.component';

@Component({
  selector: 'lib-achievements',
  templateUrl: './achievements.component.html',
  styleUrls: ['./achievements.component.scss']
})
export class AchievementsComponent extends UIComponent{
  user = null;
  grvSetup: any;
  views: Array<ViewModel> = [];
  button: ButtonModel = null;
  itemSelected: any = null;
  cardType = '';
  selectedID: string = '';
  grdViewSetup: any = null;
  ratingVLL: string = '';
  policyID: string;

  /* #region request */
  request: ResourceModel;
  idField = 'employeeID';
  entityName = 'HR_Employees';
  entityPermission = 'HR_Employees';
  formName = 'EmployeeInfomation';
  gridViewName = 'grvEmployeeInfomation';
  service = 'HR';
  assemblyName = 'ERM.Business.HR';
  className = 'EmployeesBusiness_Old';
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
    private callFC: CallFuncService,
    private fdService: CodxFdService,
  ) {
    super(inject);
    this.user = this.auth.userValue;
  }

  onInit(): void {
  }

  ngAfterViewInit(): void {
    this.request = new ResourceModel();
    this.request.service = 'HR';
    this.request.assemblyName = 'ERM.Business.HR';
    this.request.className = 'EmployeesBusiness_Old';
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

  getPolicy() {
    const predicates = 'Category = @0 and ApplyFor = @1 and ItemType = @2';
    let dataValue = '3;4;4';
    this.fdService
      .getListPolicyByPredicate(predicates, dataValue)
      .subscribe((res) => {
        if (res) {
          this.policyID = res[0]?.policyID;
        }
      });
  }

  clickMF(moreFunc: any, data: any) {
    this.itemSelected = data;
    if (moreFunc.functionID == 'FDK0111' || moreFunc.functionID == 'FDW0111') {
      // xem lịch sử xu hoặc điểm
      this.openPopupHistory(data);
    } else if (moreFunc.functionID == 'FDW0112') {
      // kích hoạt ví
      this.fdService
        .activeWallet(this.itemSelected.domainUser)
        .subscribe((res) => {
          if (res) this.notiService.notifyCode('SYS007');
        });
    } else if (
      moreFunc.functionID == 'FDW0113' ||
      moreFunc.functionID == 'FDK0112'
    ) {
      // chạy lại số dư
      this.fdService
        .refreshWallet('3', this.policyID, this.itemSelected.domainUser)
        .subscribe((res) => {
          if (res) this.notiService.notifyCode('SYS007');
        });
    }
  }

  openPopupHistory(item) {
    var obj = {
      userID: item.domainUser,
      formModel: this.view.formModel,
      modeView: 'achievement',
    };

    let popup = this.callfc.openForm(
      PopupWalletHistoryComponent,
      '',
      1400,
      1500,
      '',
      obj,
      ''
    );
    popup.closed.subscribe((res: any) => {
      if (!res || res.closedBy == 'escape' || !res.event) return;
    });
  }

}
