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
  RequestOption,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { PopupAddCampaignComponent } from './popup-add-campaign/popup-add-campaign.component';

@Component({
  selector: 'codx-campaigns',
  templateUrl: './campaigns.component.html',
  styleUrls: ['./campaigns.component.scss'],
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
  popoverDetail: any;
  popupOld: any;
  popoverList: any;
  gridViewSetup: any;
  isCollapsed: boolean = false;
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

    this.cache
      .gridViewSetup('CMCampaigns', 'grvCMCampaigns')
      .subscribe((res) => {
        if (res) {
          this.gridViewSetup = res;
        }
      });
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: false,
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
              gridViewSetup: this.gridViewSetup,
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
                let data = e?.event;
                data.modifiedOn = new Date();
                this.dataSelected = JSON.parse(JSON.stringify(data));
                this.view.dataService.update(this.dataSelected).subscribe();
                this.detectorRef.detectChanges();
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
            gridViewSetup: this.gridViewSetup,
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
              let data = e?.event;
              data.modifiedOn = new Date();
              this.dataSelected = JSON.parse(JSON.stringify(data));
              this.view.dataService.update(this.dataSelected).subscribe();
              this.detectorRef.detectChanges();
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
              gridViewSetup: this.gridViewSetup,
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
                let data = e?.event;
                data.modifiedOn = new Date();
                this.dataSelected = JSON.parse(JSON.stringify(data));
                this.view.dataService.update(this.dataSelected).subscribe();
                this.detectorRef.detectChanges();
              }
            });
          });
      });
    });
  }

  delete(data) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({
            type: 'delete',
            data: data,
          });
        }
      });

    this.detectorRef.detectChanges();
  }

  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeleteCampaignsAsync';
    opt.data = [itemSelected.recID];
    return true;
  }
  //#endregion

  //#region popover
  checkIsCollapsed(id) {
    let isCollapsed = false;
    let element = document.getElementById(id);
    if (element) {
      if (element.offsetHeight > 38) {
        isCollapsed = true;
      }
    }
    return isCollapsed;
  }

  setTextPopover(text) {
    return text;
  }

  PopoverDetail(e, p: any, emp, field: string) {
    let parent = e.currentTarget.parentElement.offsetWidth;
    let child = e.currentTarget.offsetWidth;
    if (this.popupOld?.popoverClass !== p?.popoverClass) {
      this.popupOld?.close();
    }

    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp[field] != null && emp[field]?.trim() != '') {
        if (field != 'description') {
          if (parent <= child) {
            p.open();
          }
        } else {
          if (e.currentTarget.offsetHeight > 38) {
            p.open();
          }
        }
      }
    } else p.close();
    this.popupOld = p;
  }
  //#endregion
}
