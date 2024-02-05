import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthService,
  ButtonModel,
  CRUDService,
  CallFuncService,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
  ViewsComponent,
} from 'codx-core';
import { PopupApprovalComponent } from './popup-approval/popup-approval.component';
import { PopupAddCardsComponent } from '../cards/popup-add-cards/popup-add-cards.component';

@Component({
  selector: 'lib-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ApprovalsComponent extends UIComponent {
  user = null;
  buttonAdd: ButtonModel[];
  views: Array<ViewModel> = [];
  itemSelected: any = null;
  cardType = '';
  selectedID: string = '';
  grdViewSetup: any = null;
  ratingVLL: string = '';
  service = 'FD';
  assemblyName = 'ERM.Business.FD';
  className = 'CardsBusiness';
  method = 'GetListCardByApprovalAsync';

  activeCoins: string;
  activeKudos: string;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('view') viewComponent: ViewsComponent;

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

  onInit(): void {
    this.router.params.subscribe((param: any) => {
      if (param) {
        let funcID = param['funcID'];
        if (funcID) {
          this.funcID = funcID;
          this.cache.functionList(funcID).subscribe((func: any) => {
            if (func) {
              this.cache
                .gridViewSetup(func.formName, func.gridViewName)
                .subscribe((grd: any) => {
                  if (grd) {
                    this.ratingVLL = grd['Rating']['referedValue'];
                  }
                });
            }
          });
        }
      }
    });
    // this.getSetting();
  }

  ngAfterViewInit() {
    this.buttonAdd = [{
      id: 'btnAdd',
    }];

    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRightRef,
        },
      },
    ];
  }

  getSetting() {
    // Get activeCoins and activeKudos
    // this.api
    //   .call(
    //     'ERM.Business.FD',
    //     'WalletsBusiness',
    //     'GetDataForSettingWalletNewAsync',
    //     []
    //   )
    //   .subscribe((res) => {
    //     if (res && res.msgBodyData[0].length > 0) {
    //       const listActiveCoins = res.msgBodyData[0][1];
    //       const listActiveKudos = res.msgBodyData[0][3];
    //       if (listActiveCoins) {
    //         this.activeCoins = listActiveCoins.find(
    //           (x) => x.fieldName == 'Manual' && x.transType == 'ActiveCoins'
    //         )?.fieldValue;
    //       }
    //       if (listActiveKudos) {
    //         this.activeKudos = listActiveKudos.find(
    //           (x) => x.fieldName == 'Manual' && x.transType == 'ActiveMyKudos'
    //         )?.fieldValue;
    //       }
    //     }
    //   });
  }

  accept(item) {
    // if (this.activeCoins == '1' || this.activeKudos == '1') {
    //   this.openPopupApproval(item);
    // } else this.update(item, 1);
    if (item.cardType) {
      this.api
        .execSv<any>(
          'SYS',
          'SYS',
          'SettingValuesBusiness',
          'GetByModuleAsync',
          ['FDParameters', item.cardType]
        )
        .subscribe((res) => {
          const dataValueJson = res.dataValue;
          if (dataValueJson) {
            const dataValue = JSON.parse(dataValueJson);
            this.activeCoins = dataValue?.ManualCoins || '0';
            this.activeKudos = dataValue?.ManualPoints || '0';
          }
          this.openPopupApproval(item, 1);
        });
    }
  }

  notAccept(item) {
    // this.update(item, 2);
    this.openPopupApproval(item, 2);
  }

  update(item, status) {
    this.api
      .execSv<any>('FD', 'FD', 'CardsBusiness', 'ApprovalMobileAsync', [
        item.recID,
        status,
      ])
      .subscribe((res) => {
        if (res.error == false) {
          if (status == 1) {
            this.notiService.notifyCode('SYS007');
          } else {
            this.notiService.notifyCode('SYS007');
          }
          this.updateApproveStatus(item, status);
        }
      });
  }

  updateApproveStatus(item, status) {
    let find = this.viewComponent.dataService.data.find(x => x.recID == item.recID);
    if(find) {
      find.approveStatus = status;
      this.viewComponent.dataService.update(find).subscribe();
    }
  }

  // popup chọn điểm và ý kiến
  openPopupApproval(item, status) {
    var obj = {
      recID: item.recID,
      activeCoins: this.activeCoins,
      activeKudos: this.activeKudos,
      cardType: item.cardType,
    };

    let popup = this.callFC.openForm(
      PopupApprovalComponent,
      '',
      400,
      450,
      '',
      obj,
      ''
    );
    popup.closed.subscribe((res: any) => {
      if (!res || res.closedBy == 'escape' || !res.event) return;
      this.update(item, status);
    });
  }

  selectedItem(event: any) {
    if (!event || !event.data) {
      this.selectedID = '';
      this.itemSelected = null;
    } else {
      this.selectedID = event.data.recID;
      this.itemSelected = event.data;
    }
    this.detectorRef.detectChanges();
  }

  clickShowAssideRight() {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '800px';
    this.callfc.openSide(
      PopupAddCardsComponent,
      { funcID: this.funcID, type: "add"},
      option
    );
  }

  clickMF(event: any, data: any) {
    if (event.functionID === 'SYS04') {
      // copy
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      this.callfc.openSide(
        PopupAddCardsComponent,
        {
          funcID: this.funcID,
          data: data,
          title: 'Sao chép phiếu',
          type: 'copy',
        },
        option
      );
    } else if (event.functionID === 'SYS02') {
      // delete
      (this.view.dataService as CRUDService)
        .delete([data])
        .subscribe((res: any) => {
          if (res && res.data) {
            this.api
              .execSv(
                'FD',
                'ERM.Business.FD',
                'CardsBusiness',
                'DeleteCardAsync',
                data.recID
              )
              .subscribe((result) => {
                if (result) {
                  this.notiService.notifyCode('SYS008');
                }
              });
          }
          this.detectorRef.detectChanges();
        });
    } else if (event.functionID === 'FDT1001') {
      this.accept(data);
    } else if (event.functionID === 'FDT1002') {
      this.notAccept(data);
    } else if (event.functionID === 'SYS05') { // xem
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '800px';
      this.callfc.openSide(
        PopupAddCardsComponent,
        { 
          funcID: this.funcID, 
          data: this.itemSelected, 
          type: "detail",
          title: "Xem chi tiết"
        },
        option
      );
    }
  }

  deleteCard(card: any) {}

  changeDataMF(event: any, data) {
    if (event?.length > 0) {
      const mf = event.find((i) => i.functionID === 'SYS03');
      if (mf) {
        mf.disabled = true;
      }
      const copy = event.find((i) => i.functionID === "SYS04");
      if (copy) {
        copy.disabled = true;
      }
      if (data?.approveStatus != '0') {
        const fdt1001 = event.find((i) => i.functionID === 'FDT1001');
        if (fdt1001) {
          fdt1001.disabled = true;
        }
        const fdt1002 = event.find((i) => i.functionID === 'FDT1002');
        if (fdt1002) {
          fdt1002.disabled = true;
        }
        const fdt1003 = event.find((i) => i.functionID === 'FDT1003');
        if (fdt1003) {
          fdt1003.disabled = true;
        }
        const fdt1004 = event.find((i) => i.functionID === 'FDT1004');
        if (fdt1004) {
          fdt1004.disabled = true;
        }
      }
    }
  }
}
