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
  AuthStore,
  DialogRef,
  NotificationsService,
  UIComponent,
  UrlUtil,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupConfirmComponent } from 'projects/codx-share/src/lib/components/codx-tasks/popup-confirm/popup-confirm.component';
import { ViewDetailComponent } from 'projects/codx-share/src/lib/components/codx-tasks/view-detail/view-detail.component';
import { CodxTMService } from '../codx-tm.service';
import { TM_TaskExtends } from '../models/TM_Tasks.model';

@Component({
  selector: 'lib-taskextends',
  templateUrl: './taskextends.component.html',
  styleUrls: ['./taskextends.component.css'],
})
export class TaskExtendsComponent
  extends UIComponent
  implements OnInit, AfterViewInit {
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('detail') detail: ViewDetailComponent;
  views: Array<ViewModel> = [];
  user: any;
  funcID: any;
  dataTree = [];
  taskExtends: TM_TaskExtends;
  dialogExtendsStatus!: DialogRef;
  vllExtendStatus = 'TM010';
  vllStatus = 'TM004';
  constructor(
    inject: Injector,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private tmSv: CodxTMService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void { }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
          // groupBy: 'fieldGroup', Thương kêu gắng sau
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  selectedChange(val: any) {
    this.taskExtends = val?.data ? val?.data : val;
    // this.itemSelected = val?.data?.task ;
    // this.taskExtends = val
  //  this.loadTreeView();
    this.detectorRef.detectChanges();
  }
  requestEnded(e) { }

  //#region extends
  openExtendStatusPopup(moreFunc, data) {
    //chuyển kiểm tra sau nên cmt lại
    // var valueDefault = UrlUtil.getUrl('defaultValue', moreFunc.url);
    // if (valueDefault == '5') {
    //   this.api
    //     .execSv<any>(
    //       'TM',
    //       'TM',
    //       'TaskBusiness',
    //       'GetTaskParentByTaskIDAsync',
    //       data.taskID
    //     )
    //     .subscribe((res) => {
    //       if (res) {
    //         if (res.dueDate < data.extendDate) {
    //           this.notiService.alertCode('TM059').subscribe((confirm) => {
    //             if (confirm?.event && confirm?.event?.status == 'Y') {
    //               this.confirmExtends(moreFunc, data);
    //             }
    //           });
    //         } else this.confirmExtends(moreFunc, data);
    //       }
    //     });
    // } else this.confirmExtends(moreFunc, data);
    this.confirmExtends(moreFunc, data);
  }

  confirmExtends(moreFunc, data) {
    var obj = {
      moreFunc: moreFunc,
      data: data,
      vll: 'TM010',
      action: 'extend',
    };
    this.dialogExtendsStatus = this.callfc.openForm(
      PopupConfirmComponent,
      '',
      500,
      350,
      '',
      obj
    );
    this.dialogExtendsStatus.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        var taskExtends = e?.event;
        this.view.dataService.update(taskExtends).subscribe();
        this.taskExtends = taskExtends;
        this.detail.taskID = taskExtends.taskID;
        this.detail.getTaskDetail();
        this.detectorRef.detectChanges();
      }
    });
  }
  //#endregion

  receiveMF(e: any) {
    this.clickMF(e.e, this.taskExtends);
  }

  clickMF(e, data) {
    this.taskExtends = data;
    switch (e.functionID) {
      case 'TMT04011':
      case 'TMT04012':
        this.openExtendStatusPopup(e.data, data);
        break;
    }
  }
  changeDataMF(e, data) {
    if (e) {
      e.forEach((x) => {
        if (x.functionID == 'SYS04') {
          x.disabled = true;
        }
        if (
          (x.functionID == 'TMT04011' || x.functionID == 'TMT04012') &&
          data.status != '3'
        ) {
          x.disabled = true;
        }
      });
    }
  }

  //#region  tree
  // loadTreeView() {
  //   this.api
  //     .execSv<any>(
  //       'TM',
  //       'ERM.Business.TM',
  //       'TaskBusiness',
  //       'GetListTasksTreeAsync',
  //       this.taskExtends?.taskID
  //     )
  //     .subscribe((res) => {
  //       if (res) this.dataTree = res;
  //     });
  // }
  //#endregion
}
