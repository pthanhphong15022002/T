import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CallFuncService,
  DialogModel,
  DialogRef,
  RequestOption,
  SidebarModel,
  ViewsComponent,
} from 'codx-core';
import { AssignInfoComponent } from 'projects/codx-share/src/lib/components/assign-info/assign-info.component';
import { TM_Tasks } from 'projects/codx-tm/src/lib/models/TM_Tasks.model';
import { CodxEsService, GridModels } from '../../codx-es.service';
import { PopupAddSignFileComponent } from '../popup-add-sign-file/popup-add-sign-file.component';


@Component({
  selector: 'lib-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewDetailComponent implements OnInit {
  constructor(
    private esService: CodxEsService,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService,
    private router: ActivatedRoute
  ) {
    this.funcID = this.router.snapshot.params['funcID'];
  }

  @Input() itemDetail: any;
  @Input() funcID;
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

  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  ngOnInit(): void {
    this.itemDetailStt = 3;
    this.itemDetailDataStt = 1;
    if (this.formModel) {
      this.initForm();
    } else {
      this.esService.getFormModel(this.funcID).then((formModel) => {
        if (formModel) this.formModel = formModel;
        this.initForm();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.formModel) {
      this.initForm();
    } else {
      this.esService.getFormModel(this.funcID).then((formModel) => {
        if (formModel) this.formModel = formModel;
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
      )[0].style.height = main - header - 27 + 'px';
    }
  }

  initForm() {
    if (this.itemDetail?.recID) {
      this.esService.getTask(this.itemDetail?.recID).subscribe((res) => {
        this.taskViews = res;
        this.df.detectChanges();
      });
    }

    if (this.itemDetail && this.itemDetail !== null) {
      // this.esService
      //   .getFiles(
      //     this.formModel.funcID,
      //     this.itemDetail?.recID,
      //     this.formModel.entityName
      //   )
      //   .subscribe((res) => {
      //     if (res) {
      //       this.files = res;
      //     }
      //   });
      if (this.itemDetail?.files?.length > 0) {
        this.esService
          .getLstFileByID(this.itemDetail.files.map((x) => x.fileID))
          .subscribe((res) => {
            console.log('get file', res);

            if (res) {
              this.files = res;
            }
          });
      }
      this.esService
        .getDetailSignFile(this.itemDetail?.recID)
        .subscribe((res) => {
          if (res) {
            this.itemDetail = res;
            this.df.detectChanges();
          }
        });
      this.transID = this.itemDetail.processID;
      if (
        this.itemDetail?.approveControl == '1' ||
        this.itemDetail?.approveStatus != '1'
      ) {
        this.transID = this.itemDetail.recID;
      }

      this.esService.getFormModel('EST04').then((res) => {
        if (res) {
          let fmApprovalStep = res;
          let gridModels = new GridModels();
          gridModels.dataValue = this.transID;
          gridModels.predicate = 'TransID=@0';
          gridModels.funcID = fmApprovalStep.funcID;
          gridModels.entityName = fmApprovalStep.entityName;
          gridModels.gridViewName = fmApprovalStep.gridViewName;
          gridModels.pageSize = 20;

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
    this.setHeight();
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
        this.edit(datas);
        break;
      case 'SYS02':
        this.delete(datas);
        break;
      case 'SYS04':
        this.assign(datas);
        break;
    }
  }

  assign(datas) {
    if (this.checkOpenForm(this.funcID)) {
      var task = new TM_Tasks();
      task.refID = datas?.recID;
      task.refType = this.view?.formModel.entityName;
      task.dueDate = datas?.expiredOn;
      var vllControlShare = 'TM003';
      var vllRose = 'TM002';
      var title = 'Giao việc';
      let option = new SidebarModel();
      option.DataService = this.view?.dataService;
      option.FormModel = this.view?.formModel;
      option.Width = '550px';
      let dialogAdd = this.callfunc.openSide(
        AssignInfoComponent,
        [task, vllControlShare, vllRose, title],
        option
      );
      dialogAdd.closed.subscribe((e) => { });
    }
  }

  edit(datas: any) {
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

  checkOpenForm(val: any) {
    // if(val == "ODT108" && this.checkUserPer?.created) return true;
    // else if((val == "ODT109" || val == "ODT110") && this.checkUserPer?.read) return true;
    // else if(this.checkUserPer?.created || this.checkUserPer?.owner) return true;
    // else this.notifySvr.notify("Bạn không có quyền thực hiện chức năng này.")
    // return false;
    return true;
  }

  clickMF(e) {
    console.log(e);
  }

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

  fileAdded($event) { }
  getfileCount($event) { }
}
