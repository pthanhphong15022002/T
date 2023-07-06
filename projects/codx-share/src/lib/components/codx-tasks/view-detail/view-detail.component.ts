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
import {
  ApiHttpService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { TM_Parameter, TM_TaskGroups } from '../model/task.model';
import { AuthStore, CRUDService } from 'codx-core/public-api';
import { DomSanitizer } from '@angular/platform-browser';
import { tmpReferences } from '../../../models/assign-task.model';

@Component({
  selector: 'share-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
})
export class ViewDetailComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('templetHistoryProgress')
  templetHistoryProgress!: TemplateRef<any>;
  dialog: any;
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
  dataTree?: any[];
  dataReferences?: any[];
  @Input() taskID: string;
  popoverDataSelected: any;
  listTaskResousceSearch = [];
  listTaskResousce = [];
  countResource = 0;
  id: string;
  itemSelected: any;
  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() hoverPopover = new EventEmitter<any>();
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
    private api: ApiHttpService,
    private callfc: CallFuncService,
    public sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {}
  //#endregion
  //#region Init
  ngOnInit(): void {}

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
      if (changes['taskID'].currentValue === this.id) return;
      this.id = changes['taskID'].currentValue;
      this.loadedHisPro = false;
      this.getTaskDetail();
    }
  }
  //#region
  //#region Method
  getChangeData() {}
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
          this.loadDataReferences();
          if (!this.loadedHisPro)
            this.getDataHistoryProgress(this.itemSelected.recID);
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
    if (e) {
      // sua ngay 08/06/2023 - clearn code
      e.forEach((x) => {
        switch (x.functionID) {
          //tắt duyệt confirm
          case 'TMT02016':
          case 'TMT02017':
            if (data.confirmStatus != '1') x.disabled = true;
            break;
          //an gia hạn cong viec
          case 'TMT02019':
          case 'TMT02027':
            if (
              (data.verifyControl == '0' &&
                (data.category == '1' ||
                  (data.owner == data.createdBy && data.category == '2'))) ||
              data.status == '80' ||
              data.status == '90' ||
              data.extendControl == '0'
            )
              x.disabled = true;
            break;
          //tắt duyệt xác nhận:
          case 'TMT04032':
          case 'TMT04031':
            if (data.verifyStatus != '1') x.disabled = true;
            break;
          //tắt duyệt đánh giá
          case 'TMT04021':
          case 'TMT04022':
          case 'TMT04023':
            if (data.approveStatus != '3') x.disabled = true;
            break;
          //an giao viec
          case 'TMT02015':
          case 'TMT02025':
            if (data.status == '90' || data.status == '80') x.disabled = true;
            break;
          case 'SYS005':
            x.disabled = true;
            break;
          //an cap nhat tien do khi hoan tat
          case 'TMT02018':
          case 'TMT02026':
          case 'TMT02035':
            if (data.status == '90' || data.status == '80') x.disabled = true;
            break;
          //an voi ca TMT026
          case 'SYS02':
          case 'SYS03':
            if (
              this.taskExtends ||
              this.formModel?.funcID == 'TMT0402' ||
              this.formModel?.funcID == 'TMT0401' ||
              this.formModel?.funcID == 'TMT0206' ||
              this.formModel?.funcID == 'MWP0063' ||
              ((this.formModel?.funcID == 'TMT03011' ||
                this.formModel?.funcID == 'TMT05011') &&
                data.category == '1' &&
                data.createdBy != this.user?.userID &&
                !this.user?.administrator)
            )
              x.disabled = true;
            break;
          case 'SYS04':
            if (
              this.formModel?.funcID == 'TMT0402' ||
              this.formModel?.funcID == 'TMT0401' ||
              this.formModel?.funcID == 'TMT0206' ||
              this.formModel?.funcID == 'MWP0063' ||
              this.taskExtends
            )
              x.disabled = true;
            break;
          //rieng extend
          case 'TMT04011':
          case 'TMT04012':
            if (this.taskExtends.status != '3') x.disabled = true;
            break;
        }
      });
      //  code cu
      // e.forEach((x) => {
      //   if (
      //     (x.functionID == 'TMT02016' || x.functionID == 'TMT02017') &&
      //     data.confirmStatus != '1'
      //   ) {
      //     x.disabled = true;
      //   }
      //   if (
      //     (x.functionID == 'TMT02019' || x.functionID == 'TMT02027')&&
      //     data.verifyControl == '0' &&
      //     data.category == '1'
      //   ) {
      //     x.disabled = true;
      //   }
      //   //danh cho taskExtend
      //   if (
      //     (x.functionID == 'SYS02' ||
      //       x.functionID == 'SYS03' ||
      //       x.functionID == 'SYS04') &&
      //     this.taskExtends
      //   ) {
      //     x.disabled = true;
      //   }
      //   if (
      //     (x.functionID == 'TMT04011' || x.functionID == 'TMT04012') &&
      //     this.taskExtends.status != '3'
      //   ) {
      //     x.disabled = true;
      //   }
      //   //tắt duyệt xác nhận
      //   if (
      //     (x.functionID == 'TMT04032' || x.functionID == 'TMT04031') &&
      //     data.verifyStatus != '1'
      //   ) {
      //     x.disabled = true;
      //   }
      //   //tắt duyệt đánh giá
      //   if (
      //     (x.functionID == 'TMT04021' ||
      //       x.functionID == 'TMT04022' ||
      //       x.functionID == 'TMT04023') &&
      //     data.approveStatus != '3'
      //   ) {
      //     x.disabled = true;
      //   }
      //   //an giao viec
      //   if (x.functionID == 'SYS005') {
      //     x.disabled = true;
      //   }
      //   if (
      //     (x.functionID == 'TMT02015' || x.functionID == 'TMT02025') &&
      //     data.status == '90'
      //   ) {
      //     x.disabled = true;
      //   }
      //   //an cap nhat tien do khi hoan tat
      //   if (
      //     (x.functionID == 'TMT02018' ||
      //       x.functionID == 'TMT02026' ||
      //       x.functionID == 'TMT02035') &&
      //     data.status == '90'
      //   ) {
      //     x.disabled = true;
      //   }
      //   //an voi ca TMT026
      //   if (
      //     (x.functionID == 'SYS02' ||
      //       x.functionID == 'SYS03' ||
      //       x.functionID == 'SYS04') &&
      //     (this.formModel?.funcID == 'TMT0206' ||
      //       this.formModel?.funcID == 'MWP0063')
      //   ) {
      //     x.disabled = true;
      //   }
      //   //an voi fun TMT03011
      //   if (
      //     (this.formModel?.funcID == 'TMT03011' ||
      //       this.formModel?.funcID == 'TMT05011') &&
      //     data.category == '1' &&
      //     data.createdBy != this.user.userID &&
      //     !this.user?.administrator &&
      //     (x.functionID == 'SYS02' || x.functionID == 'SYS03')
      //   ) {
      //     x.disabled = true;
      //   }
      //   //an TMT02019
      //   if (
      //     (x.functionID == 'TMT02019' || x.functionID == 'TMT02027') &&
      //     (data.status == '80' || data.status == '90' || data.extendControl)
      //   )
      //     x.disabled = true;
      // });
    }
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
    this.dataReferences = [];
    if (this.itemSelected.refID)
      this.getReferencesByCategory3(this.itemSelected);
  }

  getReferencesByCategory3(task) {
    var listUser = [];
    switch (task.refType) {
      case 'OD_Dispatches':
        this.api
          .exec<any>('OD', 'DispatchesBusiness', 'GetListByIDAsync', task.refID)
          .subscribe((item) => {
            if (item) {
              item.forEach((x) => {
                var ref = new tmpReferences();
                ref.recIDReferences = x.recID;
                ref.refType = 'OD_Dispatches';
                ref.createdOn = x.createdOn;
                ref.memo = x.title;
                ref.createdBy = x.createdBy;
                ref.attachments = x.attachments;
                ref.comments = x.comments;
                this.dataReferences.unshift(ref);
                if (listUser.findIndex((p) => p == ref.createdBy) == -1)
                  listUser.push(ref.createdBy);
                this.getUserByListCreateBy(listUser);
              });
            }
          });
        break;
      case 'ES_SignFiles':
        this.api
          .execSv<any>(
            'ES',
            'ERM.Business.ES',
            'SignFilesBusiness',
            'GetLstSignFileByIDAsync',
            JSON.stringify(task.refID.split(';'))
          )
          .subscribe((result) => {
            if (result) {
              result.forEach((x) => {
                var ref = new tmpReferences();
                ref.recIDReferences = x.recID;
                ref.refType = 'ES_SignFiles';
                ref.createdOn = x.createdOn;
                ref.memo = x.title;
                ref.createdBy = x.createdBy;
                ref.attachments = x.attachments;
                ref.comments = x.comments;
                this.dataReferences.unshift(ref);
                if (listUser.findIndex((p) => p == ref.createdBy) == -1)
                  listUser.push(ref.createdBy);
                this.getUserByListCreateBy(listUser);
              });
            }
          });
        break;
      case 'TM_Tasks':
        this.api
          .execSv<any>(
            'TM',
            'TM',
            'TaskBusiness',
            'GetTaskByRefIDAsync',
            task.refID
          )
          .subscribe((result) => {
            if (result) {
              var ref = new tmpReferences();
              ref.recIDReferences = result.recID;
              ref.refType = 'TM_Tasks';
              ref.createdOn = result.createdOn;
              ref.memo = result.taskName;
              ref.createdBy = result.createdBy;
              ref.attachments = result.attachments;
              ref.comments = result.comments;

              this.api
                .execSv<any>('SYS', 'AD', 'UsersBusiness', 'GetUserAsync', [
                  ref.createdBy,
                ])
                .subscribe((user) => {
                  if (user) {
                    ref.createByName = user.userName;
                    this.dataReferences.unshift(ref);
                    this.changeDetectorRef.detectChanges();
                  }
                });
            }
          });
        break;
      case 'DP_Instances_Steps_Tasks':
        this.api
          .execSv<any>(
            'DP',
            'DP',
            'InstancesBusiness',
            'GetTempReferenceByRefIDAsync',
            task.refID
          )
          .subscribe((result) => {
            if (result && result?.length > 0) {
              this.dataReferences = result;
            }
          });
        break;
      case 'OM_OKRs':
        this.api
          .exec<any>('OM', 'OKRBusiness', 'GetOKRByIDAsync', task.refID)
          .subscribe((okr) => {
            if (okr) {
              var ref = new tmpReferences();
              ref.recIDReferences = okr.recID;
              ref.refType = 'OM_OKRs';
              ref.createdOn = okr?.createdOn;
              ref.memo = okr?.okrName;
              ref.createdBy = okr?.createdBy;
              this.dataReferences.unshift(ref);
              if (listUser.findIndex((p) => p == okr.createdBy) == -1)
                listUser.push(ref.createdBy);
              this.getUserByListCreateBy(listUser);
            }
          });
        break;
    }
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
    this.api
      .execSv(
        'BG',
        'ERM.Business.BG',
        'TrackLogsBusiness',
        'GetDataHistoryProgressAsync',
        [objectID]
      )
      .subscribe((res: any[]) => {
        if (res && res?.length > 0) {
          this.listHistoryProgress = JSON.parse(JSON.stringify(res));
        } else this.listHistoryProgress = [];
        this.loadedHisPro = true;
        this.changeDetectorRef.detectChanges();
      });
  }
}
