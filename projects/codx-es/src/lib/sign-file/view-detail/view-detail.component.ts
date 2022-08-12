import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import {
  CallFuncService,
  DialogModel,
  DialogRef,
  RequestOption,
  SidebarModel,
  ViewsComponent,
} from 'codx-core';
import { CodxEsService, GridModels } from '../../codx-es.service';
import { PopupAddSignFileComponent } from '../popup-add-sign-file/popup-add-sign-file.component';

@Component({
  selector: 'lib-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
})
export class ViewDetailComponent implements OnInit {
  constructor(
    private esService: CodxEsService,
    private df: ChangeDetectorRef,
    private callfunc: CallFuncService
  ) {}

  @Input() itemDetail: any;
  @Input() funcID;
  @Input() formModel;
  @Input() view: ViewsComponent;
  @ViewChild('attachment') attachment;

  openNav = false;
  canRequest;
  itemDetailStt;
  taskViews;
  process;
  itemDetailDataStt;
  dialog: DialogRef;
  lstStep = [];

  @ViewChild('itemDetailTemplate') itemDetailTemplate;
  ngOnInit(): void {
    this.itemDetailStt = 1;
    this.taskViews = 1;
    this.itemDetailDataStt = 1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.itemDetail && this.itemDetail !== null) {
      this.esService
        .getDetailSignFile(this.itemDetail?.recID)
        .subscribe((res) => {
          if (res) {
            this.itemDetail = res;
            this.df.detectChanges();
          }
        });

      let transID = this.itemDetail.processID;
      if (this.itemDetail?.approveControl == '1') {
        transID = this.itemDetail.recID;
      }

      this.esService.getFormModel('EST04').then((res) => {
        if (res) {
          let fmApprovalStep = res;
          let gridModels = new GridModels();
          gridModels.dataValue = transID;
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
  }

  changeNavState(state) {
    this.openNav = state;
  }

  clickChangeItemViewStatus(stt, recID) {
    this.itemDetailStt = stt;
  }

  getHour(date, leadtime) {
    //
    var res = new Date(date);
    console.log('time', res);

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
    }
  }

  edit(datas: any) {
    this.view.dataService.edit(datas).subscribe((res: any) => {
      let option = new SidebarModel();
      option.Width = '800px';
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.currentView?.formModel;

      let dialogModel = new DialogModel();
      dialogModel.IsFull = true;
      this.dialog = this.callfunc.openForm(
        PopupAddSignFileComponent,
        'Chỉnh sửa',
        700,
        650,
        this.funcID,
        {
          isAddNew: false,
          dataSelected: datas,
          formModel: this.view?.currentView?.formModel,
          option: option,
        },
        '',
        dialogModel
      );
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

  fileAdded($event) {}
  getfileCount($event) {}
}
