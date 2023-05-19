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
  FormModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { PopupAddCampaignComponent } from './popup-add-campaign/popup-add-campaign.component';

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
  entityName = 'CM_Campaigns';
  className = 'CampaignsBusiness';
  method = 'GetListCampaignsAsync';
  idField = 'recID';
  //endregion
  moreFuncs: Array<ButtonModel> = [];
  showButtonAdd = false;
  // showButtonAdd = false;
  button?: ButtonModel;
  views: Array<ViewModel> = [];
  isButton = true;
  titleAction: any;
  dataSelected: any;
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
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
      {
        type: ViewType.card,
        sameData: true,
        active: false,
        toolbarTemplate: this.footerButton,
        model: {
          template: this.templateViewCard,
        },
      },
    ];
  }
  ngAfterViewInit(): void {
    this.view.dataService.methodSave = 'AddCampaignsAsync';
    this.view.dataService.methodUpdate = 'EditCampaignsAsync';
    this.view.dataService.methodDelete = 'DeleteCampaignsAsync';

    this.detectorRef.detectChanges();
  }

  click(evt: ButtonModel) {
    this.titleAction = evt.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  onLoading(e) {}
  selectedChange(data) {
    this.dataSelected = data?.data ? data?.data : data;
    this.detectorRef.detectChanges();
  }
  viewChanged(e) {}
  searchChanged(e) {}

  clickMF(e, data) {
    this.dataSelected = data;
    this.titleAction = e.text;
    switch (e.functionID) {
      case 'SYS03':
       this.edit(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;

    }
  }

  //#region CRUD
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      this.cache.functionList(this.funcID).subscribe((fun) => {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        var formMD = new FormModel();
        formMD.entityName = fun.entityName;
        formMD.formName = fun.formName;
        formMD.gridViewName = fun.gridViewName;
        formMD.funcID = this.funcID;
        option.FormModel = JSON.parse(JSON.stringify(formMD));
        option.Width = '550px';

        this.cmSv
          .getAutonumber(this.funcID, fun.entityName, 'CampaignID')
          .subscribe((x) => {
            var obj = {
              action: 'add',
              title: this.titleAction,
              autoNumber: x,
            };
            var dialog = this.callfc.openSide(
              PopupAddCampaignComponent,
              obj,
              option
            );
            dialog.closed.subscribe((e) => {
              this.isButton = true;
              if (!e?.event) this.view.dataService.clear();
              if (e && e.event != null) {
              }
            });
          });
      });
    });
  }

  edit(data) {
    this.isButton = false;
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        this.cache.functionList(this.funcID).subscribe((fun) => {
          let option = new SidebarModel();
          option.DataService = this.view.dataService;
          var formMD = new FormModel();
          formMD.entityName = fun.entityName;
          formMD.formName = fun.formName;
          formMD.gridViewName = fun.gridViewName;
          formMD.funcID = this.funcID;
          option.FormModel = JSON.parse(JSON.stringify(formMD));
          option.Width = '550px';

          var obj = {
            action: 'edit',
            title: this.titleAction,
          };
          var dialog = this.callfc.openSide(
            PopupAddCampaignComponent,
            obj,
            option
          );
          dialog.closed.subscribe((e) => {
            this.isButton = true;
            if (!e?.event) this.view.dataService.clear();
            if (e && e.event != null) {
              this.view.dataService.update(e.event).subscribe();
              this.dataSelected = JSON.parse(JSON.stringify(e?.event));
            }
          });
        });
      });
  }

  copy(data) {
    this.isButton = false;
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService.copy().subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      this.cache.functionList(this.funcID).subscribe((fun) => {
        var formMD = new FormModel();
        formMD.entityName = fun.entityName;
        formMD.formName = fun.formName;
        formMD.gridViewName = fun.gridViewName;
        formMD.funcID = this.funcID;
        option.FormModel = JSON.parse(JSON.stringify(formMD));
        option.Width = '550px';

        this.cmSv
          .getAutonumber(this.funcID, fun.entityName, 'CampaignID')
          .subscribe((x) => {
            var obj = {
              action: 'copy',
              title: this.titleAction,
              recIdOld: this.dataSelected.recID,
              autoNumber: x,
            };
            var dialog = this.callfc.openSide(
              PopupAddCampaignComponent,
              obj,
              option
            );
            dialog.closed.subscribe((e) => {
              this.isButton = true;
              if (!e?.event) this.view.dataService.clear();
              if (e && e.event != null) {
                this.view.dataService.update(e.event).subscribe();
                this.dataSelected = JSON.parse(
                  JSON.stringify(this.view.dataService.data[0])
                );
                this.detectorRef.detectChanges();
              }
            });
          });
      });
    });
  }

  delete(data){

  }
  //#endregion
}
