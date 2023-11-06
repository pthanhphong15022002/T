import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {
  ApiHttpService,
  CacheService,
  CallFuncService,
  FormModel,
  NotificationsService,
  SidebarModel,
} from 'codx-core';
import { CodxShareService } from '../../codx-share.service';
import { CodxTasksService } from '../codx-tasks/codx-tasks.service';
import { AssignTaskModel } from '../../models/assign-task.model';
import { AssignInfoComponent } from '../assign-info/assign-info.component';
import { PopupAddComponent } from '../codx-tasks/popup-add/popup-add.component';

@Component({
  selector: 'codx-view-assign',
  templateUrl: './codx-view-assign.component.html',
  styleUrls: ['./codx-view-assign.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class CodxViewAssignComponent implements OnInit, OnChanges {
  @Input() formModel?: FormModel;
  @Input() dataTree = [];
  @Input() referType = 'source';
  @Input() showMore = false; //show moreFunc
  listRoles = [];
  vllStatusAssign = 'TM007';
  vllStatus = 'TM004';
  dialog: any;
  isClose = true;
  isShow = false;
  vllRole = 'TM002';

  formModelTask: FormModel = {
    formName: 'AssignTasks',
    gridViewName: 'grvAssignTasks',
    entityName: 'TM_AssignTasks',
    funcID: 'TMT0203',
  };

  constructor(
    private dt: ChangeDetectorRef,
    private cache: CacheService,
    public sanitizer: DomSanitizer,
    private codxShareService: CodxShareService,
    private detectorRef: ChangeDetectorRef,
    private api: ApiHttpService,
    private notiService: NotificationsService,
    private tmSv: CodxTasksService,
    private callfc: CallFuncService
  ) {
    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dt.detectChanges();
  }

  ngOnInit(): void {}

  selectionChange(parent) {
    // var id = parent?.data.taskID;
    // var element = document.getElementById(id);
    // if (element) {
    //   this.isClose = element.classList.contains('icon-add_box');
    //   this.isShow = element.classList.contains('icon-indeterminate_check_box');
    //   if (this.isClose) {
    //     element.classList.remove('icon-add_box');
    //     element.classList.add('icon-indeterminate_check_box');
    //   } else if (this.isShow) {
    //     element.classList.remove('icon-indeterminate_check_box');
    //     element.classList.add('icon-add_box');
    //   }
    // }
  }
  clickTemp(e) {
    e.stopPropagation();
  }

  clickMF(e, data) {
    switch (e.functionID) {
      case 'SYS02':
        //Thuong chưa mapping nên chưa làm
        // this.delete(data);
        break;
      case 'SYS03':
        //Thuong chưa mapping nên chưa làm
        this.edit(e, data);
        // this.editByService(e, data);
        break;
      default: {
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          this.afterSave,
          this.formModelTask,
          null,
          this
        );
        this.detectorRef.detectChanges();
        break;
      }
    }
  }
  afterSave(e?: any, that: any = null) {
    //đợi xem chung sửa sao rồi làm tiếp
  }
  changeDataMF(e, data) {
    e.forEach((res) => {
      if (
        res.functionID != 'SYS02' &&
        res.functionID != 'SYS03' &&
        res.functionID != 'SYS001' &&
        res.functionID != 'SYS002' &&
        res.functionID != 'SYS003' &&
        res.functionID != 'SYS004'
      ) {
        res.disabled = true;
      }
    });
  }

  // edit(e, data) {}

  edit(moreFunc, data) {
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskBusiness',
        'GetTaskUpdateByRecIDAsync',
        data.recID
      )
      .subscribe((res: any) => {
        if (res && res?.length > 0) {
          let task = res[0];
          let listUserDetail = res[1] || [];
          let listTodo = res[2];
          let listTaskResources = res[3];
          this.editConfirm(
            task,
            task.category == '3'
              ? 'TMT0203'
              : task.category == '2'
              ? 'TMT0202 '
              : 'TMT0201',
            task.category == '3',
            moreFunc.customName,
            true,
            listUserDetail,
            listTodo,
            listTaskResources
          );
        }
      });
  }

  editConfirm(
    data,
    funcID,
    isAssignTask, //la giao việc
    titleAction,
    isLoadedData = false,
    listUserDetail = [],
    listTodo = [],
    listTaskResources = []
  ) {
    this.cache.functionList(funcID).subscribe((f) => {
      if (f) {
        let formModel = new FormModel();
        let option = new SidebarModel();
        this.cache.gridView(f.gridViewName).subscribe((res) => {
          this.cache
            .gridViewSetup(f.formName, f.gridViewName)
            .subscribe((grvSetup) => {
              if (grvSetup) {
                formModel.funcID = funcID;
                formModel.entityName = f.entityName;
                formModel.formName = f.formName;
                formModel.gridViewName = f.gridViewName;
                option.FormModel = formModel;
                option.Width = '800px';
                option.zIndex = 1001;

                let obj = {
                  data: data,
                  action: 'edit',
                  isAssignTask: isAssignTask,
                  titleAction: titleAction,
                  functionID: funcID,
                  isOtherModule: true,
                  isLoadedData: isLoadedData,
                  listUserDetail: listUserDetail,
                  listTodo: listTodo,
                  listTaskResources: listTaskResources,
                };
                let dialog = this.callfc.openSide(
                  PopupAddComponent,
                  obj,
                  option
                );
                dialog.closed.subscribe((e) => {
                  if (e?.event && e?.event != null) {
                    //afterSave(e.event);
                  }
                });
              }
            });
        });
      }
    });
  }

  delete(data: any) {
    //Thuong chưa mapping nên chưa làm
    // if (data.status == '90') {
    //   this.notiService.notifyCode('TM017');
    //   return;
    // }
    // if (data.category == '2') {
    //   this.notiService.notifyCode('TM018');
    //   return;
    // }
    // var isCanDelete = true;
    // this.api
    //   .execSv<any>(
    //     'TM',
    //     'ERM.Business.TM',
    //     'TaskBusiness',
    //     'GetListTaskChildDetailAsync',
    //     data.taskID
    //   )
    //   .subscribe((res: any) => {
    //     if (res) {
    //       res.forEach((element) => {
    //         if (element.status != '00' && element.status != '10') {
    //           isCanDelete = false;
    //           return;
    //         }
    //       });
    //       if (!isCanDelete) {
    //         this.notiService.notifyCode('TM001');
    //       } else {
    //         this.deleteConfirm(data);
    //       }
    //     }
    //   });
  }
  deleteConfirm(data) {
    this.notiService.alertCode('TM003').subscribe((confirm) => {
      if (confirm?.event && confirm?.event?.status == 'Y') {
        this.tmSv.deleteTask(data.taskID).subscribe((res) => {
          if (res) {
            var listTaskDelete = res[0];
            var parent = res[1];
            listTaskDelete.forEach((x) => {
              this.mappingDeleted(x, parent);
            });

            this.notiService.notifyCode('TM004');
            if (parent) {
              ///doi mapping
            }

            this.detectorRef.detectChanges();
          }
        });
      }
    });
  }

  mappingDeleted(x, parent) {
    if (x.category == '3') {
      var idx = this.dataTree.findIndex((t) => t.taskID == x.taskID);
      if (idx != -1) this.dataTree.splice(idx, 1);
    } else {
      var idx = this.dataTree.findIndex((t) => t.taskID == parent?.taskID);
      if (idx != -1 && this.dataTree[idx].items?.length > 0) {
        var idx = this.dataTree.findIndex((t) => t.taskID == x.taskID);
      }
    }
  }

  //edit goi service
  editByService(moreFunc, data) {
    this.tmSv.editTask(
      data.recID,
      data.category == '3'
        ? 'TMT0203'
        : data.category == '2'
        ? 'TMT0202 '
        : 'TMT0201',
      moreFunc.customName,
      this.afterSaveTask.bind(this)
    );
  }

  afterSaveTask(data) {
    //data tra ve
  }
}
