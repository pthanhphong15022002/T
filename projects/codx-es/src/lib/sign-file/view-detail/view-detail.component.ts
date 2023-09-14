import {
  AssignTaskModel,
  tmpReferences,
} from './../../../../../codx-share/src/lib/models/assign-task.model';
import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  ViewEncapsulation,
  Injector,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabModel } from 'projects/codx-share/src/lib/components/codx-tabs/model/tabControl.model';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  CallFuncService,
  DataRequest,
  DialogModel,
  DialogRef,
  NotificationsService,
  RequestOption,
  SidebarModel,
  UIDetailComponent,
  ViewsComponent,
} from 'codx-core';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { TM_Tasks } from 'projects/codx-share/src/lib/components/codx-tasks/model/task.model';
import { CodxEsService, GridModels } from '../../codx-es.service';
import { PopupAddSignFileComponent } from '../popup-add-sign-file/popup-add-sign-file.component';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';

@Component({
  selector: 'lib-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewDetailComponent extends UIDetailComponent implements OnInit {
  runMode: any;
  constructor(
    inject: Injector,
    private esService: CodxEsService,
    private codxShareService: CodxShareService,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private notify: NotificationsService,
    private router: ActivatedRoute,
    private authStore: AuthStore,
  ) {
    super(inject);
    this.funcID = this.view?.formModel?.funcID ?? this.router.snapshot.params['funcID'];
    this.cache.functionList(this.funcID).subscribe(func=>{
      if(func){
        this.runMode=func?.runMode;
      }
    });
    this.user = this.authStore.get();
  }

  @Input() data: any = { category: 'Trình ký' };
  @Input() showApproveStatus: boolean = true;
  @Input() itemDetail: any;
  @Input() formModel;
  @Input() view: ViewsComponent;
  @Input() hideMF = false;
  @Input() hideFooter = false;
  @ViewChild('attachment') attachment;

  active = 1;
  openNav = false;
  canRequest;
  itemDetailStt;
  taskViews = [];
  files = [];
  process = [];
  itemDetailDataStt;
  dialog: DialogRef;
  lstStep = [];
  transID: string;
  comment: string = ''; //Comment khi yêu cầy hủy
  cancelControl: string = ''; //Yêu cầu khi hủy duyệt
  oCancelSF: any; // object cancel

  user: any; //user loggin
  dataReferences: any = [];
  vllRefType: string = 'TM018';
  isAfterRender: boolean = false;
  gridViewSetup: any = {};

  mfRelease: any;

  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  @ViewChild('addCancelComment') addCancelComment;

  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    // { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
    { name: 'References', textDefault: 'Nguồn công việc', isActive: false },
  ];
  override onInit(): void {
    this.itemDetailStt = 3;
    this.itemDetailDataStt = 1;
    if (this.formModel) {
      this.cache
        .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
        .subscribe((gv) => {
          if (gv) this.gridViewSetup = gv;
          this.initForm();
        });
    } else {
      this.esService.getFormModel(this.funcID).then((formModel) => {
        if (formModel) {
          this.formModel = formModel;
          this.cache
            .gridViewSetup(this.formModel.formName, this.formModel.gridViewName)
            .subscribe((gv) => {
              if (gv) this.gridViewSetup = gv;
              this.initForm();
            });
        }
      });
    }
  }

  ngAfterViewInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes?.data &&
      (changes.data?.previousValue?.recID !=
        changes.data?.currentValue?.recID ||
        changes.data?.currentValue?.recID == this.itemDetail?.recID)
    ) {
      this.data = changes.data?.currentValue;
    }
    if (this.formModel) {
      this.initForm();
    } else {
      this.esService.getFormModel(this.funcID).then((formModel) => {
        if (formModel) {
          this.formModel = formModel;
          this.esService.setCacheFormModel(this.formModel);
        }
        this.initForm();
      });
    }
  }

  setHeight() {
    let main,
      header = 0;
    let ele = document.getElementsByClassName(
      'codx-detail-main'
    ) as HTMLCollectionOf<HTMLElement>;
    if (ele) {
      main = Array.from(ele)[0]?.offsetHeight;
    }

    let eleheader = document.getElementsByClassName(
      'codx-detail-header'
    ) as HTMLCollectionOf<HTMLElement>;
    if (ele) {
      header = Array.from(eleheader)[0]?.offsetHeight;
    }

    let nodes = document.getElementsByClassName(
      'codx-detail-body'
    ) as HTMLCollectionOf<HTMLElement>;
    if (nodes.length > 0) {
      Array.from(
        document.getElementsByClassName(
          'codx-detail-body'
        ) as HTMLCollectionOf<HTMLElement>
      )[0].style.height = main - header - 100 + 'px';
    }
  }

  initForm() {
    this.funcID = this.view?.formModel?.funcID;
    this.cache.functionList(this.funcID).subscribe(func=>{
      if(func){
        this.runMode=func?.runMode;
        this.detectorRef.detectChanges();
      }
    });
    if (this.itemDetailTemplate && !this.itemDetailTemplate?.formModel) {
      this.itemDetailTemplate.formModel = this.formModel;
    }
    this.cache.valueList('TM018').subscribe((res) => {});
    if (this.itemDetail?.recID) {
      this.esService.getTask(this.itemDetail?.recID).subscribe((res) => {
        this.taskViews = res;
        this.df.detectChanges();
      });
    }

    if (this.itemDetail && this.itemDetail !== null) {
      this.files = [];
      this.df.detectChanges();
      if (this.itemDetail?.files?.length > 0) {
        this.esService
          .getLstFileByID(this.itemDetail.files.map((x) => x.fileID))
          .subscribe((res) => {
            if (res) {
              this.files = res;
              this.df.detectChanges();
            }
          });
      }
      let dataRequest = new DataRequest();
      dataRequest.formName = this.view?.formModel?.formName;
      dataRequest.gridViewName = this.view?.formModel?.gridViewName;
      dataRequest.entityName = this.view?.formModel?.entityName;
      dataRequest.funcID = this.view?.formModel?.funcID;
      dataRequest.dataObj = this.itemDetail?.recID;
      dataRequest.predicate = "RecID=@0";
      dataRequest.dataValue = this.itemDetail?.recID;
      dataRequest.page = 1;
      this.esService
        .getDetailSignFile(this.itemDetail?.recID,dataRequest)
        .subscribe((res) => {
          this.dataReferences = [];
          if (res) {
            this.itemDetail = res;
            this.detectorRef.detectChanges();
            if (res.refType != null) {
              this.esService
                .getEntity(this.itemDetail?.refType)
                .subscribe((oEntity) => {
                  if (oEntity != null) {
                    let tempRef = new tmpReferences();
                    tempRef.refType = this.itemDetail?.refType;
                    switch (oEntity?.entityName) {
                      case 'OD_Dispatches':
                        this.esService
                          .getod(this.itemDetail?.recID)
                          .subscribe((ref) => {
                            if (ref) {
                              tempRef.recIDReferences = ref?.recID;
                              tempRef.createdOn = ref?.createdOn;
                              tempRef.memo = ref?.title;
                              tempRef.createdBy = ref?.createdBy;
                              this.cache
                                .getCompany(ref?.createdBy)
                                .subscribe((user) => {
                                  if (user) {
                                    tempRef.createByName = user?.employeeName;
                                  }
                                });
                              this.dataReferences = [];
                              this.dataReferences.push(tempRef);
                              this.df.detectChanges();

                              // let index = this.dataReferences.findIndex(x=>x.recID == ref.recID);
                              // if (index < 0) this.dataReferences.push(ref);
                              // this.df.detectChanges();
                            }
                          });
                        break;

                      case 'ES_SignFiles':
                        this.esService
                          .getDetailSignFile(res?.refID)
                          .subscribe((ref) => {
                            if (ref) {
                              tempRef.recIDReferences = ref?.recID;
                              tempRef.createdOn = ref?.createdOn;
                              tempRef.memo = ref?.title;
                              tempRef.createdBy = ref?.createdBy;
                              this.cache
                                .getCompany(ref?.createdBy)
                                .subscribe((user) => {
                                  if (user) {
                                    tempRef.createByName = user?.employeeName;
                                  }
                                });
                              this.dataReferences = [];
                              this.dataReferences.push(tempRef);
                              this.df.detectChanges();
                            }
                          });
                        break;
                    }
                  }
                });
            }
            this.df.detectChanges();
          }
        });
      this.transID = this.itemDetail.processID;
      if (
        this.itemDetail?.approveControl == '1' ||
        this.itemDetail?.approveStatus == '0' ||
        this.itemDetail?.approveStatus == '2' ||
        this.itemDetail?.approveStatus == '3' ||
        this.itemDetail?.approveStatus == '4' ||
        this.itemDetail?.approveStatus == '5'
      ) {
        this.transID = this.itemDetail.recID;
      }

      this.esService.getFormModel('EST04').then((res) => {
        if (res) {
          let fmApprovalStep = res;
          let gridModels = new DataRequest();
          gridModels.dataValue = this.transID;
          gridModels.predicate = 'TransID=@0';
          gridModels.funcID = fmApprovalStep.funcID;
          gridModels.entityName = fmApprovalStep.entityName;
          gridModels.gridViewName = fmApprovalStep.gridViewName;
          // gridModels.pageSize = 20;
          gridModels.pageLoading = false;

          if (gridModels.dataValue != null) {
            this.esService.getApprovalSteps(gridModels).subscribe((res) => {
              if (res && res?.length >= 0) {
                this.lstStep = res;
              }
            });
          }
        }
      });
    }
    if (this.itemDetail != null) {
      this.canRequest = this.itemDetail.approveStatus < 3 ? true : false;
    }
    this.isAfterRender = true;
    // this.setHeight();
  }

  changeNavState(state) {
    this.openNav = state;
  }

  clickChangeItemViewStatus(stt, recID) {
    this.itemDetailStt = stt;
  }

  getHour(date, leadtime) {
    var res = new Date(date);
    res.setHours(res.getHours() + leadtime);
    return res;
  }

  clickChangeItemDetailDataStatus(stt) {
    this.itemDetailDataStt = stt;
  }

  //#region MoreFunc viewDetai
  changeDataMF(e: any, data: any) {
    if (this.runMode == '1') {
      this.codxShareService.changeMFApproval(e, data?.unbounds);
    } else {
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
      var edit = e.filter(
        (x: { functionID: string }) => x.functionID == 'SYS03'
      );
      var del = e.filter(
        (x: { functionID: string }) => x.functionID == 'SYS02'
      );
      var copy = e.filter(
        (x: { functionID: string }) => x.functionID == 'SYS04'
      );
      if (copy?.length) copy[0].disabled = true;
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
    }
  }

  openFormFuncID(val: any, datas: any = null) {
    var funcID = val?.functionID;
    if (!datas) {
      datas = this.itemDetail;
    } else {
      var index = this.view.dataService.data.findIndex((object) => {
        return object.recID === datas.recID;
      });
      if (index >= 0) {
        datas = this.view.dataService.data[index];
      }
    }

    switch (val?.functionID) {
      case 'SYS03':
        this.edit(datas, val);
        break;
      case 'SYS02':
        this.delete(datas);
        break;
      case 'SYS04':
        this.copy(datas);
        break;
      case 'EST01101': //hủy yeu cau duyệt
        this.beforeCancel(datas);
        break;
      case 'EST01102': //Xem van ban
        this.viewFile(datas, val);
        break;
      case 'EST01103': //bookmark
        this.bookmark(datas);
        break;
      case 'EST01104': //unBookmark
        this.unBookmark(datas);
        break;
      case 'EST01105': //Gửi duyệt
        this.release();
        break;
      case 'EST01106': //Tạo signfile từ signfile
        this.addSignFile(datas);
        break;
      default:
        //Biến động , tự custom
        var customData =
        {
          refID : "",
          refType : this.formModel?.entityName,
          dataSource: datas,
        }

        this.codxShareService.defaultMoreFunc(
          val,
          datas,
          null,
          this.formModel,
          this.view.dataService,
          this,
          customData
        );
        // this.shareService.defaultMoreFunc(
        //   val,
        //   datas,
        //   this.afterSaveTask,
        //   this.view.formModel,
        //   this.view.dataService,
        //   that
        // );
        break;
    }
  }

  assign(datas) {
    if (this.checkOpenForm(this.funcID)) {
      var task = new TM_Tasks();
      task.refID = datas?.recID;
      task.refType = this.view?.formModel.entityName;
      task.dueDate = datas?.expiredOn;
      let assignModel: AssignTaskModel = {
        vllRole: 'TM002',
        title: 'Giao việc',
        vllShare: 'TM003',
        task: task,
      };
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      let dialogAdd = this.callfunc.openSide(
        AssignInfoComponent,
        assignModel,
        option
      );
      dialogAdd.closed.subscribe((e) => {});
    }
  }

  edit(datas: any, mF: any) {
    this.view.dataService.edit(datas).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;

      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      let dialogAdd = this.callfunc.openForm(
        PopupAddSignFileComponent,
        'Chỉnh sửa',
        700,
        650,
        this.funcID,
        {
          isAddNew: false,
          dataSelected: datas,
          formModel: this.view?.formModel,
          option: option,
          headerText: mF?.text,
          moreFunction: this.mfRelease,
          dataService: this.view?.dataService,
        },
        '',
        dialogModel
      );

      dialogAdd.closed.subscribe((res) => {
        if (res.event) {
          if (res.event?.approved) {
            this.view.dataService.update(res.event.data).subscribe();
          } else {
            this.view.dataService.update(res.event).subscribe();
          }
        }
        this.esService.setupChange.next(true);
      });
    });
  }

  addSignFile(datas) {
    this.view.dataService.dataSelected = datas;
    this.view.dataService.addNew().subscribe((res: any) => {
      if (!res) return;
      res.refID = datas.recID;
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;

      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;

      let dialogAdd = this.callfunc.openForm(
        PopupAddSignFileComponent,
        'Thêm mới',
        700,
        650,
        this.funcID,
        {
          isAddNew: true,
          formModel: this.view?.formModel,
          option: option,
          refID: datas?.recID,
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

  copy(datas) {
    this.view.dataService.dataSelected = datas;
    this.view.dataService.copy().subscribe((res: any) => {
      if (!res) return;

      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;

      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;

      let dialogAdd = this.callfunc.openForm(
        PopupAddSignFileComponent,
        'Sao chép',
        700,
        650,
        this.funcID,
        {
          isAddNew: true,
          dataSelected: res,
          formModel: this.view?.formModel,
          option: option,
          type: 'copy',
          oldSfRecID: datas.recID,
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

  beforeDel(opt: RequestOption) {
    opt.methodName = 'DeleteSignFileAsync';
    opt.data = this.view.dataService.dataSelected.recID;
    return true;
  }

  delete(datas: any) {
    this.view.dataService.dataSelected = datas;
    this.view.dataService
      .delete([datas], true, (opt) => this.beforeDel(opt))
      .subscribe((item: any) => {
        if (item) {
        }
      });
  }

  beforeCancel(datas: any) {
    // let mssgCode = 'ES015';
    // this.notify.alertCode(mssgCode).subscribe((x) => {
    //   if (x.event?.status == 'Y') {

    //   }
    // });
    if (datas.approveStatus == '1') {
      this.cancel(datas);
    } else {
      this.esService
        .getApprovalTransActive(datas.recID)
        .subscribe((lstTrans) => {
          if (lstTrans && lstTrans?.length > 0) {
            this.cancelControl = lstTrans[0]?.cancelControl;
            if (this.cancelControl == '0') {
            } else if (this.cancelControl == '1') {
              this.cancel(datas);
            } else if (this.cancelControl == '2' || this.cancelControl == '3') {
              this.oCancelSF = datas;
              this.callfunc.openForm(this.addCancelComment, '', 650, 380);
            }
            return;
          }
        });
    }
  }

  cancel(datas: any) {
    this.esService
      .cancelSignfile(datas?.recID, this.comment)
      .subscribe((res) => {
        if (res) {
          datas.approveStatus = '0';
          this.view.dataService.update(datas).subscribe();
          this.notify.notifyCode('SYS034');
        }
      });
  }

  viewSFile(datas: any, mF: any) {
    this.view.dataService.edit(datas).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;

      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      let dialogAdd = this.callfunc.openForm(
        PopupAddSignFileComponent,
        mF?.text,
        700,
        650,
        this.funcID,
        {
          modeView: '2',
          isAddNew: false,
          dataSelected: datas,
          formModel: this.view?.formModel,
          option: option,
          headerText: mF?.text,
        },
        '',
        dialogModel
      );
    });
  }

  viewFile(datas: any, mF: any) {
    this.view.dataService.edit(datas).subscribe((res: any) => {
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;

      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      let dialogAdd = this.callfunc.openForm(
        PopupAddSignFileComponent,
        mF?.text,
        700,
        650,
        this.funcID,
        {
          modeView: '1',
          isAddNew: false,
          dataSelected: datas,
          formModel: this.view?.formModel,
          option: option,
          headerText: mF?.text,
        },
        '',
        dialogModel
      );
      dialogAdd.closed.subscribe((res) => {
        window['PDFViewerApplication']?.unbindWindowEvents();
      });
    });
  }

  bookmark(datas: any) {
    let bookmark = { objectID: this.user.userID };
    if (!datas.bookmarks) {
      datas.bookmarks = [];
    }
    datas.bookmarks.push(bookmark);

    this.esService
      .bookmarkSingFile(datas.recID, datas.bookmarks)
      .subscribe((res) => {
        if (res) {
          this.notify.notifyCode('OD002');
          datas.bookmarks = res?.bookmarks;
          this.view.dataService.update(datas).subscribe();
        } else {
        }
      });
  }

  unBookmark(datas: any) {
    if (!datas.bookmarks) {
      datas.bookmarks = [];
    }
    let index = datas.bookmarks.findIndex(
      (p) => p.objectID == this.user.userID
    );
    if (index != -1) {
      datas.bookmarks.splice(index, 1);
    }

    this.esService
      .bookmarkSingFile(datas.recID, datas.bookmarks)
      .subscribe((res) => {
        if (res) {
          this.notify.notifyCode('OD003');
          datas.bookmarks = res?.bookmarks;
          this.view.dataService.update(datas).subscribe();
        } else {
        }
      });
  }

  release() {
    //Gửi duyệt'

    if (this.user.userID != this.itemDetail.owner) {
      return;
    }
    // if (this.itemDetail.eSign == true && this.processTab < 3 && this.currentTab == 3) {
    //   return;
    // }

    this.codxShareService
      .codxRelease(
        'ES',
        this.itemDetail?.recID,
        this.itemDetail.approveControl == '1'
          ? this.itemDetail?.recID
          : this.itemDetail?.processID,
        this.formModel.entityName,
        this.formModel.funcID,
        '',
        this.itemDetail.title,
        this.itemDetail?.refType
      )
      .subscribe((res) => {
        if (res?.msgCodeError == null && res?.rowCount > 0) {
          //Gen QR code
          this.esService
            .addQRBeforeRelease(this.itemDetail.recID)
            .subscribe((res) => {});
          this.esService
            .getDetailSignFile(this.itemDetail?.recID)
            .subscribe((res) => {
              if (res) {
                this.view.dataService.update(res).subscribe();
                this.itemDetail = res;
                this.df.detectChanges();
              }
            });
          // Notify
          this.notify.notifyCode('ES007');
        }
      });
  }

  //#endregion

  checkOpenForm(val: any) {
    // if(val == "ODT108" && this.checkUserPer?.created) return true;
    // else if((val == "ODT109" || val == "ODT110") && this.checkUserPer?.read) return true;
    // else if(this.checkUserPer?.created || this.checkUserPer?.owner) return true;
    // else this.notifySvr.notify("Bạn không có quyền thực hiện chức năng này.")
    // return false;
    return true;
  }

  clickMF(e) {}

  saveFile() {
    this.attachment.saveFiles();
  }

  openFile() {
    this.attachment.uploadFile();
  }

  setStyles(color): any {
    let styles = {
      backgroundColor: color,
      color: 'white',
    };
    return styles;
  }

  fileAdded($event) {}
  getfileCount($event) {}

  valueChange(event) {
    if (event?.field && event?.component) {
      if (event?.field == 'comment') {
        this.comment = event?.data;
        this.df.detectChanges();
      }
    }
  }

  saveComment(popupComment: DialogRef) {
    if (!this.oCancelSF) {
      return;
    }
    if (this.cancelControl == '2') {
      //comment khong bat buoc
      this.cancel(this.oCancelSF);
      this.comment = '';
      popupComment && popupComment.close();
    } else if (this.cancelControl == '3') {
      //comment bat buoc
      if (this.comment == '') {
        this.notify.notifyCode('ES032');
        return;
      }
      this.cancel(this.oCancelSF);
      this.comment = '';
      popupComment && popupComment.close();
    }
  }

  closeDialogCancel(popupComment: DialogRef) {
    this.comment = '';
    popupComment && popupComment.close();
  }
}
