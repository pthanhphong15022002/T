import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, FormModel } from 'codx-core';
import { TM_Parameter, TM_TaskGroups } from '../model/task.model';
import { CRUDService } from 'codx-core/public-api';
import { DomSanitizer } from '@angular/platform-browser';
import { tmpReferences } from '../../../models/assign-task.model';
import { CodxTasksService } from '../codx-tasks.service';
import { CodxService } from 'codx-core';
import { ViewHistoryUpdateProgressComponent } from '../view-history-update-progress/view-history-update-progress.component';
import { CodxTabsComponent } from '../../codx-tabs/codx-tabs.component';
@Component({
  selector: 'share-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
})
export class ViewDetailComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('templetHistoryProgress')
  templetHistoryProgress!: TemplateRef<any>;
  @ViewChild('tabHistoryProgess')
  tabHistoryProgess!: ViewHistoryUpdateProgressComponent;
  @ViewChild('footerTabs')
  footerTabs!: CodxTabsComponent;

  @Input() formModel?: FormModel;
  @Input() taskExtends?: any;
  @Input() paramDefaut?: TM_Parameter = new TM_Parameter();
  @Input() listRoles?: any;
  @Input() popoverCrr?: any;
  @Input() vllStatus?: any;
  @Input() vllExtendStatus?: any;
  @Input() vllApproveStatus?: any;
  @Input() showMoreFunc?: any;
  @Input() dataService: CRUDService;
  @Input() user: any;
  @Input() taskID: string;
  @Output() changeMF = new EventEmitter<any>();
  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() hoverPopover = new EventEmitter<any>();

  dialog: any;
  dataTree?: any[];
  dataReferences?: any[];
  popoverDataSelected: any;
  listTaskResousceSearch = [];
  listTaskResousce = [];
  countResource = 0;
  id: string;
  itemSelected: any;
  firstLoad = true;
  viewTags = '';
  vllPriority = 'TM005';
  tabControl = [
    {
      name: 'History',
      textDefault: 'Lịch sử',
      isActive: true,
      icon: '',
      template: null,
    },
    {
      name: 'Attachment',
      textDefault: 'Đính kèm',
      isActive: false,
      icon: '',
      template: null,
    },
    {
      name: 'Comment',
      textDefault: 'Bình luận',
      isActive: false,
      icon: '',
      template: null,
    },
    {
      name: 'AssignTo',
      textDefault: 'Giao việc',
      isActive: false,
      icon: '',
      template: null,
    },
    {
      name: 'References',
      textDefault: 'Nguồn công việc',
      isActive: false,
      icon: '',
      template: null,
    },
  ];
  loadParam = false;
  param?: TM_Parameter = new TM_Parameter();
  isEdit = true;
  timeoutId: any;
  listHistoryProgress = [];
  loadedHisPro = false;

  constructor(
    private codxService: CodxService,
    private api: ApiHttpService,
    private taskService: CodxTasksService,
    public sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,

    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {}
  //#endregion
  //#region Init
  ngOnInit(): void {
    if (this.codxService.asideMode == '2') this.showMoreFunc = false;
  }

  ngAfterViewInit(): void {
    this.tabControl.push({
      name: 'Progess',
      textDefault: 'Cập nhật tiến độ',
      isActive: false,
      icon: 'icon-i-hourglass-split',
      template: this.templetHistoryProgress,
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskID']) {
      if (
        changes['taskID'].currentValue === this.id ||
        changes['taskID'].currentValue == null
      )
        return;
      this.id = changes['taskID'].currentValue;
      this.loadedHisPro = false;
      this.getTaskDetail();
    }
  }
  //#region
  //#region Method

  getTaskDetail() {
    this.viewTags = '';
    this.dataTree = [];
    this.dataReferences = [];
    this.loadParam = false;
    this.api
      .exec<any>('TM', 'TaskBusiness', 'GetTaskDetailsByTaskIDAsync', this.id)
      .subscribe((res) => {
        if (res) {
          this.itemSelected = res;
          this.viewTags = this.itemSelected?.tags;
          if (this.itemSelected.taskGroupID) {
            this.getTaskGroup(this.itemSelected.taskGroupID);
          } else {
            this.param = JSON.parse(JSON.stringify(this.paramDefaut));
            this.loadParam = true;
            if (this.itemSelected.category == '2') {
              if (this.param.EditControl == '1') this.isEdit = true;
              else this.isEdit = false;
            } else this.isEdit = true;
          }
          //chinh 16/2/2023
          if (res?.listTaskResources?.length > 0)
            this.listTaskResousce = res.listTaskResources;
          else this.listTaskResousce = [];
          this.listTaskResousceSearch = this.listTaskResousce;
          this.countResource = this.listTaskResousce.length;
          this.loadTreeView();
          //để footer load
          //this.loadDataReferences();

          this.changeDetectorRef.detectChanges();
        }
      });
  }

  popoverEmpList(p: any, task = null) {
    if (this.popoverCrr && this.popoverCrr.isOpen()) {
      this.popoverCrr.close();
    }
    if (this.popoverDataSelected) {
      if (this.popoverDataSelected.isOpen()) this.popoverDataSelected.close();
    }
    //sua ngày 16/2/2023
    // p.open();
    // this.popoverDataSelected = p;
    // this.hoverPopover.emit(p);
    //sua ngay 07/03/2023
    if (p) {
      var element = document.getElementById(task?.taskID);
      if (element) {
        var t = this;
        this.timeoutId = setTimeout(function () {
          p.open();
          if (t.popoverCrr && t.popoverCrr.isOpen()) {
            t.popoverCrr.close();
          }
          //this.popoverDataSelected = p;
        }, 2000);
      }
      this.hoverPopover.emit(p);
    } else {
      if (this.timeoutId) clearTimeout(this.timeoutId);
    }
  }
  //#endregion
  //#region Event
  clickMF(e: any, dt?: any) {
    if (this.taskExtends)
      return this.clickMoreFunction.emit({ e: e, data: this.taskExtends });
    this.clickMoreFunction.emit({ e: e, data: dt });
  }
  //cai nay khong goi ve vì no con view riêng
  changeDataMF(e, data) {
    if (this.taskExtends)
      return this.changeMF.emit({ e: e, data: this.taskExtends });
    this.changeMF.emit({ e: e, data: data });
  }

  searchName(e) {
    var listTaskResousceSearch = [];
    if (e.trim() == '') {
      this.listTaskResousceSearch = this.listTaskResousce;
      return;
    }
    listTaskResousceSearch = this.listTaskResousce.filter((x) =>
      x.resourceName.toLowerCase().includes(e.toLowerCase())
    );
    // this.listTaskResousce.forEach((res) => {
    //   var name = res.resourceName;
    //   if (name.toLowerCase().includes(e.toLowerCase())) {
    //     listTaskResousceSearch.push(res);
    //   }
    // });
    this.listTaskResousceSearch = listTaskResousceSearch;
  }
  //#endregion

  //#region  tree
  loadTreeView() {
    this.dataTree = [];
    if (
      !this.itemSelected ||
      !this.itemSelected?.taskID ||
      (this.itemSelected.category == '1' && !this.itemSelected.isAssign)
    )
      return;
    if (this.itemSelected?.category == '2' && !this.itemSelected.parentID) {
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetListTaskTreeByRefIDAsync',
          this.itemSelected?.refID
        )
        .subscribe((res) => {
          if (res) this.dataTree = res || [];
          this.changeDetectorRef.detectChanges();
        });
    } else {
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskBusiness',
          'GetTreeAssignByTaskIDAsync',
          this.itemSelected?.taskID
        )
        .subscribe((res) => {
          if (res) this.dataTree = res || [];
          this.changeDetectorRef.detectChanges();
        });
    }
  }
  //#endregion

  loadDataReferences() {
    //chưa load data
    if (this.footerTabs) {
      this.footerTabs.refIDRef = this.itemSelected.refID;
      this.footerTabs.refType = this.itemSelected.refType;
      this.footerTabs.changeDataRef();
    }
    // //đã load data
    // this.dataReferences = [];
    // if (this.itemSelected.refID)
    //   this.taskService.getReference(
    //     this.itemSelected.refType,
    //     this.itemSelected.refID,
    //     this.getRef.bind(this)
    //   );
  }

  getRef(dataReferences) {
    if (dataReferences && dataReferences?.length > 0)
      this.dataReferences = dataReferences;
  }

  getUserByListCreateBy(listUser) {
    this.api
      .execSv<any>(
        'SYS',
        'AD',
        'UsersBusiness',
        'LoadUserListByIDAsync',
        JSON.stringify(listUser)
      )
      .subscribe((users) => {
        if (users) {
          this.dataReferences.forEach((ref) => {
            var index = users.findIndex((user) => user.userID == ref.createdBy);
            if (index != -1) {
              ref.createByName = users[index].userName;
            }
          });
          this.changeDetectorRef.detectChanges();
        }
      });
  }
  //#endregion
  getTaskGroup(idTasKGroup) {
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskGroupBusiness',
        'GetAsync',
        idTasKGroup
      )
      .subscribe((res) => {
        if (res) {
          this.loadParam = true;
          this.convertParameterByTaskGroup(res);
          if (
            this.param.EditControl != '1' &&
            this.itemSelected.category == '2'
          )
            this.isEdit = true;
          else this.isEdit = false;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  //#region Convert
  convertParameterByTaskGroup(taskGroup: TM_TaskGroups) {
    this.param.ApproveBy = taskGroup.approveBy;
    this.param.Approvers = taskGroup.approvers;
    this.param.ApproveControl = taskGroup.approveControl;
    this.param.AutoCompleted = taskGroup.autoCompleted;
    this.param.ConfirmControl = taskGroup.confirmControl;
    this.param.EditControl = taskGroup.editControl;
    this.param.LocationControl = taskGroup.locationControl;
    this.param.MaxHours = taskGroup.maxHours.toString();
    this.param.MaxHoursControl = taskGroup.maxHoursControl;
    this.param.PlanControl = taskGroup.planControl;
    this.param.ProjectControl = taskGroup.projectControl;
    this.param.UpdateControl = taskGroup.updateControl;
    this.param.VerifyBy = taskGroup.verifyBy;
    this.param.VerifyByType = taskGroup.verifyByType;
    this.param.VerifyControl = taskGroup.verifyControl;
    this.param.DueDateControl = taskGroup.dueDateControl;
    this.param.ExtendControl = taskGroup.extendControl;
    this.param.ExtendBy = taskGroup.extendBy;
    this.param.CompletedControl = taskGroup.completedControl;
  }

  isNullOrEmpty(value: string): boolean {
    return value == null || value == undefined || !value.trim();
  }

  getDataHistoryProgress(objectID) {
    if (this.tabHistoryProgess) {
      this.tabHistoryProgess.objectID = objectID;
      this.tabHistoryProgess.getDataHistoryProgress();
    }
  }
}
