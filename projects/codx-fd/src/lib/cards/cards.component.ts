import { ViewEncapsulation } from '@angular/core';
import {
  Component,
  Injector,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  ViewModel,
  NotificationsService,
  ViewType,
  UIComponent,
  SidebarModel,
  AuthService,
  CRUDService,
  RequestOption,
} from 'codx-core';
import { PopupAddCardsComponent } from './popup-add-cards/popup-add-cards.component';
import { CodxFdService } from '../codx-fd.service';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CardsComponent extends UIComponent {
  user = null;
  grvSetup: any;
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
  method = 'GetListCardAsync'; //'GetListDataByWebAsync';

  activeCoins: string;
  activeKudos: string;

  months: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate?: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;


  constructor(
    private inject: Injector,
    private auth: AuthService,
    private notiService: NotificationsService,
    private fdService: CodxFdService,
    private shareService: CodxShareService
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
              this.cardType = func.dataValue;
              this.cache
                .gridViewSetup(func.formName, func.gridViewName)
                .subscribe((grd: any) => {
                  if (grd) {
                    this.grvSetup = grd;
                    this.ratingVLL = grd['Rating']['referedValue'];
                  }
                });
            }
          });
        }
      }
    });
  }

  ngAfterViewInit() {
    this.buttonAdd = [{
      id: 'btnAdd',
    }];

    // const request: ResourceModel = {
    //   service: 'FD',
    //   assemblyName: 'ERM.Business.FD',
    //   className: 'CardsBusiness',
    //   method: 'GetListCardByViewListAsync',
    //   autoLoad: true,
    //   // parentIDField :'ParentID',
    //   // idField :'orgUnitID',
    //   dataObj: '',
    // };

    this.views = [
      {
        id: '1',
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRightRef,
        },
      },
      {
        id: '2',
        //request: request,
        type: ViewType.list,
        sameData: true,
        // active: true,
        model: {
          template: this.templateList,
          headerTemplate: this.headerTemplate,
        },
      },
    ];
  }

  viewChanged(e) {
    if (e.view.type == ViewType.list) {
      this.view.dataService.method = 'GetListCardByViewListAsync';
      this.view.dataService.data = [];
      this.view.dataService.refresh();
      // this.view.loadData();
    } else if (e.view.type == ViewType.listdetail) {
      this.view.dataService.method = 'GetListCardAsync';
      this.view.dataService.data = [];
      this.view.dataService.refresh();
    }
  }

  selectedItem(event: any) {
    if (!event || !event.data) {
      this.selectedID = '';
      this.itemSelected = null;
    } else {
      this.selectedID = event.data.recID;
      this.itemSelected = event.data;
    }
    // this.detectorRef.detectChanges();
  }

  clickShowAssideRight() {
    this.fdService.checkValidAdd(this.cardType).subscribe((res: any) => {
      if (!res.error) {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '550px';
        this.callfc.openSide(
          PopupAddCardsComponent,
          { 
            funcID: this.funcID,
            type: 'add',
          },
          option
        );
      } else this.notiService.notifyCode('FD001');
    });
  }

  clickMF(event: any, data: any) {
    if(event.functionID === 'SYS05'){
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.callfc.openSide(
        PopupAddCardsComponent,
        {
          funcID: this.funcID,
          data: data,
          title: 'Xem chi tiết phiếu',
          type: 'detail',
        },
        option
      );
    } else if (event.functionID === 'SYS04') {
      this.fdService.checkValidAdd(this.cardType).subscribe((res: any) => {
        if (!res.error) {
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          option.FormModel = this.view.formModel;
          option.Width = '550px';
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
        } else this.notiService.notifyCode('FD001');
      });
    } else if (event.functionID === 'SYS02') {
      // delete
      this.api.execSv('FD', 'ERM.Business.FD', 'CardsBusiness', 'GetCardInforAsync', [
        data.recID,
      ])
      .subscribe((res: any) => {
        if (res) {
          const checkStatus = res.gifts?.find((i) => i.status === '2' || i.status === '3');
          if (checkStatus) {
            this.notiService.notifyCode('FD009');
            return;
          }

          if(res.approveStatus == "1" || res.approveStatus == "2"){
            this.notiService.notifyCode('FD010');
            return;
          }

          if(res?.gifts?.length > 0 || res?.point > 0){
            this.deleteConfirm(data);
          } else {
            this.deleteCardAPI(data);
          }
        }
      });
    } else {
      var customData = {
        refID: '',
        refType: this.view.formModel?.entityName,
        dataSource: data,
        addPermissions: []
      };

      this.shareService.defaultMoreFunc(
        event,
        data,
        null,
        this.view.formModel,
        this.view.dataService,
        this,
        customData
      );
    }
  }

  deleteConfirm(data) {
    this.notiService.alertCode('FD011').subscribe((confirm) => {
      if (confirm?.event && confirm?.event?.status == 'Y') {
        this.deleteCardAPI(data);
      }
    });
  }

  beforeDel(opt: RequestOption) {
    console.log(opt);
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteCardAsync';
    opt.className = 'CardsBusiness';
    opt.assemblyName = 'ERM.Business.FD';
    opt.service = 'FD'
    opt.data = itemSelected.recID;
    return true;
  }

  deleteCardAPI(data){
    (this.view.dataService as CRUDService)
      .delete([data], false,(opt) => this.beforeDel(opt))
      .subscribe((res: any) => {
        this.detectorRef.detectChanges();
      });
  }

  changeDataMF(event: any) {
    if (event?.length > 0) {
      const mf = event.find((i) => i.functionID === 'SYS03');
      if (mf) {
        mf.disabled = true;
      }
    }
  }

  changeStatus(event: any) {
    const {recID, status} = event;
    this.view.dataService.dataSelected.status = status;
    this.detectorRef.detectChanges();
  }
}
