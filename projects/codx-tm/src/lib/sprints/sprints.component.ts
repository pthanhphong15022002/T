import {
  ChangeDetectorRef,
  Component,
  Injector,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AuthStore,
  ButtonModel,
  DataRequest,
  DialogModel,
  DialogRef,
  FormModel,
  RequestOption,
  ResourceModel,
  SidebarModel,
  UIComponent,
  Util,
  ViewModel,
  ViewType,
} from 'codx-core';

import { map, Observable, of } from 'rxjs';
import { CodxTMService } from '../codx-tm.service';
import { TM_Sprints } from '../models/TM_Sprints.model';
import { PopupTabsViewsDetailsComponent } from '../popup-tabs-views-details/popup-tabs-views-details.component';
import { PopupAddSprintsComponent } from './popup-add-sprints/popup-add-sprints.component';
import { PopupShareSprintsComponent } from './popup-share-sprints/popup-share-sprints.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-sprints',
  templateUrl: './sprints.component.html',
  styleUrls: ['./sprints.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SprintsComponent extends UIComponent {
  @ViewChild('listCardSprints') listCardSprints: TemplateRef<any>;
  gridView: any;
  boardAction: any;
  user: any;
  sprintDefaut = new TM_Sprints();

  @ViewChild('itemViewBoard') itemViewBoard: TemplateRef<any>;
  @ViewChild('templetSprints') templetSprints: TemplateRef<any>;
  urlShare = '';
  urlView = '';
  moreFunc: any[];
  views: Array<ViewModel> = [];
  button?: ButtonModel[];
  moreFuncs: Array<ButtonModel> = [];
  model?: DataRequest;
  predicate = 'Owner=@0';
  dataValue = 'ADMIN';
  resourceKanban?: ResourceModel;
  dialog!: DialogRef;
  itemSelected: any;
  valuelist = {};
  action = 'edit';
  listMoreFunc = [];
  titleAction = '';
  heightWin: any;
  widthWin: any;
  toolbarCls: string;
  hidenMF: boolean = false;

  constructor(
    inject: Injector,
    private codxShareService: CodxShareService,
    private tmSv: CodxTMService,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.dataValue = this.user.userID;
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.tmSv.functionParent = this.funcID;
    this.cache.functionList(this.funcID).subscribe((f) => {
      if (f) {
        this.tmSv.urlback = f.url;
      }
    });
    this.cache.moreFunction('Sprints', 'grvSprints').subscribe((res) => {
      if (res) this.listMoreFunc = res;
    });
    this.heightWin = Util.getViewPort().height - 100;
    this.widthWin = Util.getViewPort().width - 100;
    if (this.codxService.asideMode == '2') this.hidenMF = true;
  }

  //#region Init
  onInit(): void {
    this.button = [
      {
        id: 'btnAdd',
      },
    ];

    let body = document.body;
    if (body.classList.contains('toolbar-fixed'))
      this.toolbarCls = 'toolbar-fixed';
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.card,
        sameData: true,
        active: true,
        model: {
          template: this.itemViewBoard,
        },
      },
    ];
    this.view.dataService.methodSave = 'AddEditSprintAsync';
    this.view.dataService.methodUpdate = 'AddEditSprintAsync';
    this.view.dataService.methodDelete = 'DeleteSprintsByIDAsync';
    this.detectorRef.detectChanges();
  }
  //#endregion

  //#region CRUD Methods
  add() {
    this.view.dataService.addNew().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = res?.iterationType == '1' ? '800px' : '550px';
      this.dialog = this.callfc.openSide(
        PopupAddSprintsComponent,
        [this.view.dataService.dataSelected, 'add', this.titleAction],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        // if (e?.event == null)
        //   this.view.dataService.delete(
        //     [this.view.dataService.dataSelected],
        //     false
        //   );
        if (e?.event != null) {
          e.event.modifiedOn = new Date();
          this.view.dataService.update(e?.event).subscribe();
          this.changeDetectorRef.detectChanges();
        }
      });
    });
  }

  edit(data?) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }
    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res: any) => {
        let option = new SidebarModel();
        option.DataService = this.view?.currentView?.dataService;
        option.FormModel = this.view?.currentView?.formModel;
        option.Width = res?.iterationType == '1' ? '800px' : '550px';
        this.dialog = this.callfc.openSide(
          PopupAddSprintsComponent,
          [this.view.dataService.dataSelected, 'edit', this.titleAction],
          option
        );
        this.dialog.closed.subscribe((e) => {
          if (!e?.event) this.view.dataService.clear();
          // if (e?.event == null)
          //   this.view.dataService.delete(
          //     [this.view.dataService.dataSelected],
          //     false
          //   );
          if (e?.event != null) {
            e.event.modifiedOn = new Date();
            this.view.dataService.update(e?.event).subscribe();
            this.changeDetectorRef.detectChanges();
          }
        });
      });
  }

  copy(data) {
    if (data) this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;
      option.Width = res?.iterationType == '1' ? '800px' : '550px';
      this.dialog = this.callfc.openSide(
        PopupAddSprintsComponent,
        [this.view.dataService.dataSelected, 'copy', this.titleAction],
        option
      );
      this.dialog.closed.subscribe((e) => {
        if (!e?.event) this.view.dataService.clear();
        // if (e?.event == null)
        //   this.view.dataService.delete(
        //     [this.view.dataService.dataSelected],
        //     false
        //   );
        if (e?.event != null) {
          e.event.modifiedOn = new Date();
          this.view.dataService.update(e?.event).subscribe();
          this.changeDetectorRef.detectChanges();
        }
      });
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        // if (res) this.notiService.notifyCode('TM004');
      });
  }

  beforeDel(opt: RequestOption) {
    opt.methodName = 'DeleteSprintsByIDAsync';
    opt.data = this.itemSelected.iterationID;
    return true;
  }
  //#endregion

  //#region More function
  clickMF(e: any, data: any) {
    this.itemSelected = data;
    this.titleAction = e?.text;
    switch (e.functionID) {
      case 'SYS01':
        this.add();
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data);
        break;
      case 'SYS04':
        this.copy(data);
        break;
      case 'TMT03011':
        if (data.iterationID != this.user.userID) this.shareBoard(e.data, data);
        break;
      case 'TMT03012':
        this.viewBoard(data);
        break;
      default:
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          this.afterSave,
          this.view.formModel,
          this.view.dataService,
          this
        );
        this.detectorRef.detectChanges();
        break;
    }
  }
  afterSave(e?: any, that: any = null) {
    //đợi xem chung sửa sao rồi làm tiếp
  }
  click(evt: ButtonModel) {
    this.titleAction = evt?.text;
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }
  //#endregion

  //#region Event
  sendemail(data) {}

  shareBoard(e, data) {
    var listUserDetail = [];
    let isAdmin =
      this.user?.administrator || data?.createdBy == this.user?.userID;
    if (data.iterationID) {
      var obj = {
        boardAction: data,
        listUserDetail: listUserDetail,
        title: e?.customName,
        vllShare: 'TM003',
        isAdmin: isAdmin,
      };
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'SprintsBusiness',
          'GetListUserSharingOfSprintsByIDAsync',
          data.iterationID
        )
        .subscribe((res) => {
          if (res) obj.listUserDetail = res;
          this.openPopupShare(obj);
        });
    }
  }
  openPopupShare(obj) {
    this.callfc.openForm(
      PopupShareSprintsComponent,
      'Chia sẻ view board',
      350,
      510,
      '',
      obj
    );
  }

  viewBoard(data) {
    this.doubleClick(data);
  }

  changeView(evt: any) {}

  requestEnded(evt: any) {
    // if (evt) {
    //   this.dialog.close();
    // }
  }
  //#endregion
  changeDataMF(e, data) {
    // if (e) {
    //   // e.forEach((x) => {
    //   //   // if (
    //   //   //   (x.functionID == 'SYS02' ||
    //   //   //     x.functionID == 'SYS03' ||
    //   //   //     x.functionID == 'SYS04') &&
    //   //   //   data.iterationID == this.user.userID
    //   //   // ) {
    //   //   //   x.disabled = true;
    //   //   // }
    //   //   // an edit và delete
    //   //   if ((x.functionID == 'SYS02' || x.functionID == 'SYS03') && data?.createdBy != this.user?.userID && !this.user?.administrator) {
    //   //     x.disabled = true;
    //   //   }
    //   //   //an giao viec
    //   //   if (x.functionID == 'SYS005') {
    //   //     x.disabled = true;
    //   //   }
    //   // });
    // }
  }

  //#region doubeclick carrd
  doubleClick(data) {
    this.tmSv.getSprintsDetails(data.iterationID).subscribe((res) => {
      if (res) {
        var dataView = res;
        var dataObj = {
          projectID: dataView.projectID ? dataView.projectID : '',
          resources: dataView.resources ? dataView.resources : '',
          iterationID: dataView.iterationID,
          viewMode: dataView.viewMode ? dataView.viewMode : '',
        };
        var obj = {
          data: dataView,
          dataObj: dataObj,
        };

        let dialogModel = new DialogModel();
        dialogModel.FormModel = this.view.formModel;
        dialogModel.IsFull = true;
        dialogModel.zIndex = 900;
        var dialog = this.callfc.openForm(
          PopupTabsViewsDetailsComponent,
          '',
          this.widthWin,
          this.heightWin,
          '',
          obj,
          '',
          dialogModel
        );
        dialog.closed.subscribe((res) => {
          if (res?.event) {
            this.view.dataService.update(res?.event).subscribe();
          }
          if (this.toolbarCls) document.body.classList.add(this.toolbarCls);
        });
      }
    });
  }
  //#end

  onScroll(event) {
    const dcScroll = event.srcElement;
    if (
      dcScroll.scrollTop + dcScroll.clientHeight <
      dcScroll.scrollHeight - 150
    ) {
      return;
    }

    if (this.view.dataService.page < this.view.dataService.pageCount) {
      this.view.dataService.scrolling();
    }
  }

  /// placeholder
  placeholder(
    value: string,
    formModel: FormModel,
    field: string
  ): Observable<string> {
    //if (value) {
    return of(`<span class="cut-size-long">${value}</span>`);
  }

  // placeholderIcon(value: any,formModel: FormModel,field: string): Observable<string> {
  //     return this.cache
  //       .gridViewSetup(formModel.formName, formModel.gridViewName)
  //       .pipe(
  //         map((datas) => {
  //           if (datas && datas[field]) {
  //             var gvSetup = datas[field];
  //             if (gvSetup) {
  //                 var headerText = gvSetup.headerText as string;
  //                 let icon = value ?'icon-share text-primary text-hover-primary icon-20 m-2' :''
  //                 return icon;
  //             }
  //           }
  //         })
  //       );
  //   }

  selectedChange(sprint: any) {
    this.itemSelected = sprint?.data ? sprint?.data : sprint;
    this.detectorRef.detectChanges();
  }
}
