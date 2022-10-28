import { DomSanitizer } from '@angular/platform-browser';
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
} from '@angular/core';
import {
  ApiHttpService,
  CallFuncService,
  DialogData,
  DialogRef,
  FormModel,
} from 'codx-core';
import { tmpReferences } from '../model/task.model';
import { CRUDService } from 'codx-core/public-api';

@Component({
  selector: 'share-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss'],
})
export class ViewDetailComponent implements OnInit, AfterViewInit, OnChanges {
  //#region Constructor
  dialog: any;
  @Input() formModel?: FormModel;
  @Input() taskExtends?: any;
  @Input() param?: any;
  @Input() listRoles?: any;
  @Input() popoverCrr?: any;
  @Input() vllStatus?: any;
  @Input() vllExtendStatus?: any;
  @Input() vllApproveStatus?: any;
  @Input() showMoreFunc?: any;
  @Input() dataService: CRUDService;
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
  constructor(
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private sanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) { }
  //#endregion
  //#region Init
  ngOnInit(): void { }

  ngAfterViewInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskID']) {
      if (changes['taskID'].currentValue === this.id) return;
      this.id = changes['taskID'].currentValue;
      this.getTaskDetail();
    }
  }
  //#region
  //#region Method
  getChangeData() { }
  getTaskDetail() {
    this.viewTags = '';
    this.dataTree = [];
    this.dataReferences = [];
    this.api
      .exec<any>('TM', 'TaskBusiness', 'GetTaskDetailsByTaskIDAsync', this.id)
      .subscribe((res) => {
        if (res) {
          this.itemSelected = res;
          this.itemSelected['memoHTML'] = this.sanitizer.bypassSecurityTrustHtml(this.itemSelected.memo)
          this.itemSelected['memoHTML2'] = this.sanitizer.bypassSecurityTrustHtml(this.itemSelected.memo2)
          this.viewTags = this.itemSelected?.tags;
          this.changeDetectorRef.detectChanges();
          this.loadTreeView();
          this.loadDataReferences();
        }
      });
  }

  popoverEmpList(p: any, task) {
    this.listTaskResousceSearch = [];
    this.countResource = 0;
    if (this.popoverCrr) {
      if (this.popoverCrr.isOpen()) this.popoverCrr.close();
    }
    if (this.popoverDataSelected) {
      if (this.popoverDataSelected.isOpen()) this.popoverDataSelected.close();
    }

    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskResourcesBusiness',
        'GetListTaskResourcesByTaskIDAsync',
        task.taskID
      )
      .subscribe((res) => {
        if (res) {
          this.listTaskResousce = res;
          this.listTaskResousceSearch = res;
          this.countResource = res.length;
          p.open();
          this.popoverDataSelected = p;
          this.hoverPopover.emit(p);
        }
      });
  }
  //#endregion
  //#region Event
  clickMF(e: any, dt?: any) {
    if (this.taskExtends)
      return this.clickMoreFunction.emit({ e: e, data: this.taskExtends });
    this.clickMoreFunction.emit({ e: e, data: dt });
  }

  changeDataMF(e, data) {
    if (e) {
      e.forEach((x) => {
        if (
          (x.functionID == 'TMT02016' || x.functionID == 'TMT02017') &&
          (data.confirmControl == '0' || data.confirmStatus != '1')
        ) {
          x.disabled = true;
        }
        if (
          x.functionID == 'TMT02019' &&
          data.verifyControl == '0' &&
          data.category == '1'
        ) {
          x.disabled = true;
        }
        //danh cho taskExtend
        if (
          (x.functionID == 'SYS02' ||
            x.functionID == 'SYS03' ||
            x.functionID == 'SYS04') &&
          this.taskExtends
        ) {
          x.disabled = true;
        }
        if (
          (x.functionID == 'TMT04011' || x.functionID == 'TMT04012') &&
          this.taskExtends.status != '3'
        ) {
          x.disabled = true;
        }
        //tắt duyệt xác nhận
        if (
          (x.functionID == 'TMT04032' || x.functionID == 'TMT04031') &&
          data.verifyStatus != '1'
        ) {
          x.disabled = true;
        }
        //tắt duyệt đánh giá
        if (
          (x.functionID == 'TMT04021' ||
            x.functionID == 'TMT04022' ||
            x.functionID == 'TMT04023') &&
          data.approveStatus != '3'
        ) {
          x.disabled = true;
        }
        //an giao viec
        if (x.functionID == 'SYS005') {
          x.disabled = true;
        }
      });
    }
  }

  searchName(e) {
    var listTaskResousceSearch = [];
    if (e.trim() == '') {
      this.listTaskResousceSearch = this.listTaskResousce;
      return;
    }

    this.listTaskResousce.forEach((res) => {
      var name = res.resourceName;
      if (name.toLowerCase().includes(e.toLowerCase())) {
        listTaskResousceSearch.push(res);
      }
    });
    this.listTaskResousceSearch = listTaskResousceSearch;
  }
  //#endregion

  //#region  tree
  loadTreeView() {
    this.dataTree = [];
    if (!this.itemSelected || !this.itemSelected?.taskID) return;
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
  //#endregion

  //#regionreferences -- viet trong back end nhung khong co tmp chung nen viet fe
  loadDataReferences() {
    if (this.itemSelected.category == '1') {
      this.dataReferences = [];
      return;
    }
    this.dataReferences = [];
    if (this.itemSelected.category == '2') {
      this.api
        .execSv<any>(
          'TM',
          'TM',
          'TaskBusiness',
          'GetTaskParentByTaskIDAsync',
          this.itemSelected.taskID
        )
        .subscribe((res) => {
          if (res) {
            var ref = new tmpReferences();
            ref.recIDReferences = res.recID;
            ref.refType = 'TM_Tasks';
            ref.createdOn = res.createdOn;
            ref.memo = res.taskName;
            ref.createdBy = res.createdBy;
            ref.attachments = res.attachments;
            ref.comments = res.comments;
            var taskParent = res;
            this.api
              .execSv<any>('SYS', 'AD', 'UsersBusiness', 'GetUserAsync', [
                res.createdBy,
              ])
              .subscribe((user) => {
                if (user) {
                  ref.createByName = user.userName;
                  this.dataReferences.push(ref);
                  this.getReferencesByCategory3(taskParent);
                }
              });
          }
        });
    } else if (this.itemSelected.category == '3') {
      this.getReferencesByCategory3(this.itemSelected);
    }
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
}
