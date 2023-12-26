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
          { funcID: this.funcID },
          option
        );
      } else this.notiService.notifyCode('FD001');
    });
  }

  clickMF(event: any, data: any) {
    if (event.functionID === 'SYS04') {
      // copy
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

  deleteCard(card: any) {}

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
