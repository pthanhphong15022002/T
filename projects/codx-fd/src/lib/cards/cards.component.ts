import { ViewEncapsulation } from '@angular/core';
import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WPService } from '@core/services/signalr/apiwp.service';
import { NgbCarousel, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Permission } from '@shared/models/file.model';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ButtonModel, ViewModel, CodxListviewComponent, ViewsComponent, ApiHttpService, NotificationsService, AuthStore, CallFuncService, FilesService, CacheService, DataRequest, ViewType, UIComponent, SidebarModel, AuthService, CRUDService } from 'codx-core';
import { FD_Permissions } from '../models/FD_Permissionn.model';
import { FED_Card } from '../models/FED_Card.model';
import { CardType, FunctionName, Valuelist } from '../models/model';
import { PopupAddCardsComponent } from './popup-add-cards/popup-add-cards.component';

@Component({
  selector: 'lib-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardsComponent extends UIComponent {
  user = null;
  buttonAdd: ButtonModel;
  views: Array<ViewModel> = [];
  itemSelected: any = null;
  cardType = "";
  funcID: string = "";
  selectedID: string = "";
  grdViewSetup: any = null;
  ratingVLL: string = "";
  service = 'FD';
  assemblyName = 'ERM.Business.FD';
  className = 'CardsBusiness';
  method = 'GetListCardAsync';//'GetListDataByWebAsync';
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild("itemTemplate") itemTemplate: TemplateRef<any>;

  constructor(
    private inject: Injector,
    private notifiSV: NotificationsService,
    private auth: AuthService,
    private notiService: NotificationsService,
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
              this.cache.gridViewSetup(func.formName, func.gridViewName).subscribe((grd: any) => {
                if (grd) {
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
    this.buttonAdd = {
      id: 'btnAdd',
    };

    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRightRef
        }
      }
    ];
  }

  selectedItem(event: any) {
    if (!event || !event.data) {
      this.selectedID = "";
    }
    else {
      this.selectedID = event.data.recID;
    }
    this.detectorRef.detectChanges();
  }

  clickShowAssideRight() {
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    option.Width = '550px';
    this.callfc.openSide(PopupAddCardsComponent, {funcID: this.funcID}, option);
  }

  clickMF(event: any, data: any) {
    if(event.functionID === "SYS04"){ // copy
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      this.callfc.openSide(PopupAddCardsComponent, {funcID: this.funcID, data: data, title: 'Sao chép phiếu', type: 'copy'}, option);
    } else if(event.functionID === "SYS02"){ // delete
      (this.view.dataService as CRUDService).delete([data]).subscribe((res: any) => {
        if(res && res.data){
          this.api.execSv('FD', 'ERM.Business.FD', 'CardsBusiness', 'DeleteCardAsync', data.recID).subscribe((result) => {
            if (result) {
              this.notiService.notifyCode('SYS008');
            }
          })
        }
        this.detectorRef.detectChanges();
      });
    }
  }

  deleteCard(card: any) { }

  changeDataMF(event: any){
    if(event?.length > 0){
      const mf = event.find(i => i.functionID === 'SYS03');
      if(mf){
        mf.disabled = true;
      }
    }
  }
}
