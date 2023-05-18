import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonModel,
  CacheService,
  NotificationsService,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';

@Component({
  selector: 'lib-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.css'],
})
export class CampaignsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  @ViewChild('footerButton') footerButton: TemplateRef<any>;
  @ViewChild('headerTemplate') headerTemplate: TemplateRef<any>;
  @ViewChild('templateViewCard', { static: true })
  templateViewCard: TemplateRef<any>;
  dataObj: any;
  //region Method
  funcID = '';
  service = 'CM';
  assemblyName = 'ERM.Business.CM';
  entityName = 'CM_Customers';
  className = 'CustomersBusiness';
  method = 'GetListCRMLAsync';
  idField = 'recID';
  //endregion
  moreFuncs: Array<ButtonModel> = [];
  showButtonAdd = false;
  // showButtonAdd = false;
  button?: ButtonModel;
  views: Array<ViewModel> = [];
  isButton = true;
  titleAction: any;
  readonly btnAdd: string = 'btnAdd';

  constructor(
    private inject: Injector,
    private cacheSv: CacheService,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private cmSv: CodxCmService
  ) {
    super(inject);
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {
    this.button = {
      id: this.btnAdd,
    };
    this.showButtonAdd = true;

    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      {
        type: ViewType.card,
        sameData: true,
        active: true,
        toolbarTemplate: this.footerButton,
        model: {
          template: this.templateViewCard,
        },
      },
    ];
  }
  ngAfterViewInit(): void {}

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        if (this.isButton) this.add();
        break;
    }
    this.isButton = false;
  }
  onLoading(e){}
  selectedChange(e){}
  viewChanged(e){}
  searchChanged(e){}


  //#region CRUD
  add(){

  }
  //#endregion
}
