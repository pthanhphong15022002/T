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
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupConfirmComponent } from 'projects/codx-share/src/lib/components/codx-tasks/popup-confirm/popup-confirm.component';
import { ViewDetailComponent } from 'projects/codx-share/src/lib/components/codx-tasks/view-detail/view-detail.component';
import { TM_TaskExtends } from '../models/TM_Tasks.model';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-taskextends',
  templateUrl: './taskextends.component.html',
  styleUrls: ['./taskextends.component.css'],
})
export class TaskExtendsComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
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
    private codxShareService: CodxShareService
  ) {
    super(inject);
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  onInit(): void {}

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
    this.detectorRef.detectChanges();
  }
  requestEnded(e) {}

  //#region extends
  openExtendStatusPopup(moreFunc, data) {
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
  changeDataMF(e, data) {
    if (e) {
      e.forEach((x) => {
        if (
          x.functionID == 'SYS04' ||
          x.functionID == 'SYS03' ||
          x.functionID == 'SYS02'
        ) {
          x.disabled = true;
        }
        if (
          (x.functionID == 'TMT04011' || x.functionID == 'TMT04012') &&
          data.status != '3'
        ) {
          x.disabled = true;
        }
        //giao viec bo
        if (x.functionID == 'SYS005') {
          x.disabled = true;
        }
      });
    }
  }
}
