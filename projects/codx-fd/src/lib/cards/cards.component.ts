import { ViewEncapsulation } from '@angular/core';
import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WPService } from '@core/services/signalr/apiwp.service';
import { NgbCarousel, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Permission } from '@shared/models/file.model';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ButtonModel, ViewModel, CodxListviewComponent, ViewsComponent, ApiHttpService, NotificationsService, AuthStore, CallFuncService, FilesService, CacheService, DataRequest, ViewType, UIComponent, SidebarModel, AuthService } from 'codx-core';
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
  funcID:string = "";
  selectedID:string = "";
  grdViewSetup:any = null;
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild("itemTemplate") itemTemplate: TemplateRef<any>;
  constructor(
    private inject: Injector,
    private notifiSV: NotificationsService,
    private auth: AuthService,
  ) {
    super(inject);
    this.user = this.auth.userValue;
  }


  onInit(): void {
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
          panelLeftRef: this.panelLeftRef,
          panelRightRef: this.panelRightRef
        }
      }
    ];
  }

  selectedItem(event: any) {
    if(!event || !event.data){
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
    this.funcID = this.router.snapshot.paramMap.get('funcID');
    this.callfc.openSide(PopupAddCardsComponent, this.funcID, option);
  }


  clickMF(event:any,data:any){
    switch(event.functionID){
      case "SYS02":
        break;
      case "SYS03":
        break;
      default:
        break;

    }
  }

  deleteCard(card:any) {
  }

}
