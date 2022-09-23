import { ViewEncapsulation } from '@angular/core';
import { ChangeDetectorRef, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { WPService } from '@core/services/signalr/apiwp.service';
import { NgbCarousel, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Permission } from '@shared/models/file.model';
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
export class CardsComponent implements OnInit {

  user = null;
  predicate = "CardType = @0 && Deleted == false";
  dataValue = "";
  entityName = "FD_Cards"
  buttonAdd: ButtonModel;
  views: Array<ViewModel> = [];
  itemSelected: any = null;
  cardType = "";
  funcID:string = "";
  @ViewChild('panelLeftRef') panelLeftRef: TemplateRef<any>;
  @ViewChild('panelRightRef') panelRightRef: TemplateRef<any>;
  @ViewChild('codxViews') codxViews: ViewsComponent;
  @ViewChild("itemTemplate") itemTemplate: TemplateRef<any>;
  constructor(
    private api: ApiHttpService,
    private dt: ChangeDetectorRef,
    private notifiSV: NotificationsService,
    private auth: AuthService,
    private callcSV: CallFuncService,
    private route: ActivatedRoute,
  ) {
    this.user = this.auth.userValue;
  }


  ngOnInit(): void {
    this.route.params.subscribe((param) => {
      if(param){
        this.funcID = param.funcID;
        this.dt.detectChanges();
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
          panelLeftRef: this.panelLeftRef,
          panelRightRef: this.panelRightRef
        }
      }
    ];
  }

  selectedID:string = "";
  selectedItem(event: any) {
    if(!event || !event.data){
      this.selectedID = "";
    }
    else {
      this.selectedID = event.data.recID;
    }
    this.dt.detectChanges();
  }
  clickShowAssideRight() {
    let option = new SidebarModel();
    option.DataService = this.codxViews.dataService;
    option.FormModel = this.codxViews.formModel;
    option.Width = '550px';
    this.callcSV.openSide(PopupAddCardsComponent, this.funcID, option);
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
