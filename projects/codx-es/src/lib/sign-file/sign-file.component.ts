import { copy } from '@syncfusion/ej2-angular-spreadsheet';
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
  CodxService,
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
import { ApprovalStepSignComponent } from './approval-step/approval-step.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

@Component({
  selector: 'app-sign-file',
  templateUrl: './sign-file.component.html',
  styleUrls: ['./sign-file.component.scss'],
})
export class SignFileComponent extends UIComponent {
  runMode;
  hideMF: boolean;
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private shareService: CodxShareService,
    private df: ChangeDetectorRef,
    private notifySv: NotificationsService,
    private callfunc: CallFuncService,
    private activedRouter: ActivatedRoute,
    private authStore: AuthStore,
  ) {
    super(inject);
    this.funcID = this.view?.formModel?.funcID ?? this.activedRouter.snapshot.params['funcID'] ;
    this.cache.functionList(this.funcID).subscribe(func=>{
      if(func){
        this.runMode=func?.runMode;        
      }
    });
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

  formModel: FormModel;
  grvSetup: any = {};

  service = 'ES';
  assemblyName = 'ES';
  entity = 'ES_SignFiles';
  className = 'SignFilesBusiness';
  method = 'LoadDataSignFileAsync';
  idField = 'recID';

  predicate = '';
  datavalue = '';
  dataSelected = '';
  SidebarModel;
  lstSignfiles: any;

  dialog: DialogRef;

  buttons: Array<ButtonModel> = [];
  moreFunc: Array<ButtonModel> = [];
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
    this.request.method = this.method;
    this.request.idField = this.idField;

    this.esService.getFormModel(this.funcID).then((fm) => {
      if (fm) {
        this.formModel = fm;

        this.cache
          .gridViewSetup(this.formModel?.formName, this.formModel?.gridViewName)
          .subscribe((grv) => {
            if (grv) {
              this.grvSetup = grv;
            }
          });
        this.esService
          .getComboboxName(this.formModel?.formName, this.formModel?.gridViewName)
          .then((cbxName) => {
            if (cbxName) {
              this.lstReferValue = cbxName;
            }
          });
      }
    });

    this.taskViewStt = '1';
    this.preStepNo = 0;
    this.button = [{
      id: 'btnAdd',
    }];
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
    this.moreFunc = [
      {
        id: 'btnOverdue',
        icon: 'icon-list-chechbox',
        text: 'Duyệt quá hạn',
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
        .setPredicates(['ApproveStatus=@0'], [stt]);
    }
  }

  changeItemDetail(event) {
    this.itemDetail = event?.data;
    //if (event?.data?.recID) this.getDetailSignFile(event?.data.recID);
  }

  getDetailSignFile(id: any) {
    this.lstSignfiles = null;
    this.esService
      .getDetailSignFile(this.itemDetail?.recID)
      .subscribe((res) => {
        if (res) {
          this.itemDetail = res;
          this.lstSignfiles = res;
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
      case 'btnOverdue':
        this.esService.overdue().subscribe();
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
          window['PDFViewerApplication']?.unbindWindowEvents();

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
    if(!data) data = this.view?.dataService?.dataSelected;
    if(!data && this.view?.dataService?.data?.length>0) {
      data = this.view?.dataService?.data[0];
      this.view.dataService.dataSelected = data;
    } 
    this.viewdetail.openFormFuncID(event, data);
  }

  openFormFuncID(val: any, data: any) {
    this.viewdetail.openFormFuncID(val, data);
  }

  changeDataMF(e: any, data: any) {
    if(!data) data = this.view?.dataService?.dataSelected;// check
    if(!data && this.view?.dataService?.data?.length>0) {
      data = this.view?.dataService?.data[0];
      this.view.dataService.dataSelected = data;
    } 
    if(this.runMode == "1")
    {
      this.shareService.changeMFApproval(e,data.unbounds);
    }
    else{
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
      var edit = e.filter((x: { functionID: string }) => x.functionID == 'SYS03');
      var del = e.filter((x: { functionID: string }) => x.functionID == 'SYS02');
      var copy = e.filter((x: { functionID: string }) => x.functionID == 'SYS04');    
      if (copy?.length) copy[0].disabled = true;
      
      var view = e.filter((x: { functionID: string }) => x.functionID == 'SYS05');    
      if (view?.length) view[0].disabled = true;

      var release = e.filter(
        (x: { functionID: string }) => x.functionID == 'EST01105'
      );
  
      if (bookmarked == true) {
        if (bm?.length) bm[0].disabled = true;
        if (unbm?.length) unbm[0].disabled = false;
      } else {
        if (unbm?.length) unbm[0].disabled = true;
        if (bm?.length) bm[0].disabled = false;
      }
  
      if (data?.approveStatus != 3) {
        var cancel = e.filter(
          (x: { functionID: string }) => x.functionID == 'EST01101'
        );
        if (cancel?.length) cancel[0].disabled = true;
      }
      if (data?.approveStatus != 1 && data?.approveStatus != 2) {
        if (edit?.length) edit[0].disabled = true;
        if (release?.length) release[0].disabled = true;
        if (del?.length) del[0].disabled = true;
      }
      else{
        if (edit?.length) edit[0].disabled = false;
        if (release?.length) release[0].disabled = false;
        if (del?.length) del[0].disabled = false;
      }
    }
  }

  isBookmark(data) {
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
    
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe(func=>{
      if(func){
        this.runMode=func?.runMode;
        this.detectorRef.detectChanges;        
      }
    });
    this.detectorRef.detectChanges;   

  }
  browsingProcess(recID:any,approveStatus:any)
  {
    this.dialog = this.callfunc.openForm(
      ApprovalStepSignComponent,
      "",
      500,
      700,
      this.view?.formModel?.funcID,
      {
        transID: recID,
        approveStatus: approveStatus
      }
    );
  }
}
