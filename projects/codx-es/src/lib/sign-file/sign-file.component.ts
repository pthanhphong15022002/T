import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import {
  AlertConfirmInputConfig,
  ApiHttpService,
  AuthStore,
  ButtonModel,
  CallFuncService,
  CodxListviewComponent,
  DialogModel,
  DialogRef,
  FormModel,
  NotificationsService,
  ResourceModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { convertHtmlAgency } from 'projects/codx-od/src/lib/function/default.function';
import { CodxEsService } from '../codx-es.service';
import { PopupAddSignatureComponent } from '../setting/signature/popup-add-signature/popup-add-signature.component';
import { PopupAddSignFileComponent } from './popup-add-sign-file/popup-add-sign-file.component';
import { ViewDetailComponent } from './view-detail/view-detail.component';

@Component({
  selector: 'app-sign-file',
  templateUrl: './sign-file.component.html',
  styleUrls: ['./sign-file.component.scss'],
})
export class SignFileComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private df: ChangeDetectorRef,
    private notifySv: NotificationsService,
    private callfunc: CallFuncService,
    private activedRouter: ActivatedRoute,
    private authStore: AuthStore
  ) {
    super(inject);
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.user = this.authStore.get();
  }
  @ViewChild('popup', { static: true }) popup;
  @ViewChild('content', { static: true }) content;
  @ViewChild('listview') listview: CodxListviewComponent;
  @ViewChild('editSFile') editSFile: PopupAddSignFileComponent;
  @ViewChild('viewdetail') viewdetail: ViewDetailComponent;
  @ViewChild('paneLeft') panelLeft: TemplateRef<any>;
  @ViewChild('paneRight') panelRight: TemplateRef<any>;
  @ViewChild('itemTemplate') template: TemplateRef<any>;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;

  autoLoad = true;
  taskViewStt;
  jobs;
  itemDetail;
  preStepNo;
  button;
  user;

  request: ResourceModel;
  resourceKanban?: ResourceModel;
  convertHtmlAgency = convertHtmlAgency;

  funcID: string;
  formModel: FormModel;
  grvSetup: any = {};

  service = 'ES';
  assemblyName = 'ES';
  entity = 'ES_SignFiles';
  className = 'SignFilesBusiness';
  idField = 'recID';

  predicate = '';
  datavalue = '';
  dataSelected = '';
  SidebarModel;

  dialog: DialogRef;

  buttons: Array<ButtonModel> = [];
  views: Array<ViewModel> | any = []; // @ViewChild('uploadFile') uploadFile: TemplateRef<any>;

  lstReferValue;

  onInit(): void {
    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'SYS';
    this.resourceKanban.assemblyName = 'SYS';
    this.resourceKanban.className = 'CommonBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';

    this.request = new ResourceModel();
    this.request.service = this.service;
    this.request.assemblyName = this.assemblyName;
    this.request.className = this.className;
    this.request.method = 'LoadDataAsync';
    this.request.idField = this.idField;

    this.esService.getFormModel(this.funcID).then((fm) => {
      if (fm) {
        this.formModel = fm;

        this.cache
          .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
          .subscribe((grv) => {
            if (grv) {
              this.grvSetup = grv;
            }
          });
        this.esService
          .getComboboxName(this.formModel.formName, this.formModel.gridViewName)
          .then((cbxName) => {
            if (cbxName) {
              this.lstReferValue = cbxName;
            }
          });
      }
    });

    this.taskViewStt = '1';
    this.preStepNo = 0;
    this.button = {
      id: 'btnAdd',
    };

    // this.esService.getSFByUserID(['ADMIN', '5']).subscribe((res) => {
    //   console.log('kq', res);
    // });
    // this.cache.functionList('EST021').subscribe((res) => {
    //   console.log('funcList', res);
    // });
  }

  ngAfterViewInit(): void {
    this.view.dataService.methodDelete = 'DeleteSignFileAsync';
    this.views = [
      {
        id: '1',
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.template,
          panelLeftRef: this.panelLeft,
          panelRightRef: this.panelRight,
          contextMenu: '',
        },
      },
      {
        id: '2',
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
        },
      },
    ];
    this.df.detectChanges();
  }

  clickChangeTaskViewStatus(stt) {
    if (this.taskViewStt != stt) {
      this.taskViewStt = stt;
      this.view.dataService.predicate = 'ApproveStatus=@0';
      this.view.dataService.dataValue = stt;
      this.view.dataService
        .setPredicates(['ApproveStatus=@0'], [stt])
        .subscribe((item) => {});
    }
  }

  changeItemDetail(event) {
    this.itemDetail = event?.data;
  }

  getDetailSignFile(id: any) {
    this.esService
      .getDetailSignFile(this.itemDetail?.recID)
      .subscribe((res) => {
        if (res) {
          this.itemDetail = res;
          this.df.detectChanges();
        }
      });
  }

  sendToApprove() {
    console.log(this.itemDetail);
  }

  closeAddForm(event) {
    //this.dialog && this.dialog.close();
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.addNew();
        break;
    }
  }

  addNew(evt?) {
    this.view.dataService.addNew().subscribe((res) => {
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;

      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      let dialogAdd = this.callfunc.openForm(
        PopupAddSignFileComponent,
        'Thêm mới',
        700,
        650,
        this.funcID,
        {
          isAddNew: true,
          formModel: this.view?.formModel,
          option: option,
        },
        '',
        dialogModel
      );
      dialogAdd.closed.subscribe((x) => {
        if (x.event) {
          if (x.event?.approved) {
            this.view.dataService.add(x.event.data, 0).subscribe();
          } else {
            delete x.event._uuid;
            this.view.dataService.add(x.event, 0).subscribe();
            //this.getDtDis(x.event?.recID)
          }
        }
      });
    });
  }

  setStyles(color): any {
    let styles = {
      backgroundColor: color,
      color: 'white',
    };
    return styles;
  }

  clickMF(event: any, data) {
    this.viewdetail.openFormFuncID(event, data);
    // switch (event?.functionID) {

    //   case 'SYS03':
    //     this.edit(data);
    //     this.viewdetail.openFormFuncID(event, data);
    //     break;
    //   case 'SYS02':
    //     this.viewdetail.openFormFuncID(event, data);
    //     break;
    // }
  }

  openFormFuncID(val: any, data: any) {
    this.viewdetail.openFormFuncID(val, data);
  }

  changeDataMF(e: any, data: any) {
    var bookmarked = false;
    let lstBookmark = data?.bookmarks;
    if (lstBookmark) {
      let isbookmark = lstBookmark.filter(
        (p) => p.objectID == this.user.userID
      );
      if (isbookmark?.length > 0) {
        bookmarked = true;
      }
    }
    var bm = e.filter(
      (x: { functionID: string }) => x.functionID == 'EST01103'
    );
    var unbm = e.filter(
      (x: { functionID: string }) => x.functionID == 'EST01104'
    );

    if (bookmarked == true) {
      bm[0].disabled = true;
      unbm[0].disabled = false;
    } else {
      unbm[0].disabled = true;
      bm[0].disabled = false;
    }

    if (data.approveStatus == '0') {
      var cancel = e.filter(
        (x: { functionID: string }) => x.functionID == 'EST01101'
      );
      cancel[0].disabled = true;
    }
  }

  isBookmark(data) {
    debugger;
    let bookmarked = false;
    let lstBookmark = data?.bookmarks;
    if (lstBookmark) {
      let isbookmark = lstBookmark.filter(
        (p) => p.objectID == this.user.userID
      );
      if (isbookmark?.length > 0) {
        bookmarked = true;
      }
    }
    return bookmarked;
  }

  viewChange(e: any) {
    var funcID = e?.component?.instance?.funcID;
    this.esService.getFormModel(funcID).then((fm) => {
      if (fm) {
      }
    });
  }
}
