import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  ApiHttpService,
  FormModel,
  CallFuncService,
  AuthStore,
} from 'codx-core';

@Component({
  selector: 'share-view-list',
  templateUrl: './view-list.component.html',
  styleUrls: ['./view-list.component.css'],
})
export class ViewListComponent implements OnInit {
  popoverList: any;
  popoverDetail: any;
  item: any;
  dialog: any;
  @Input() data?: any;
  @Input() formModel?: FormModel;
  @Input() vllStatus?: any;
  @Input() listRoles?: any;
  @Input() showMoreFunc?: any;
  @Input() user: any;
  @Input() popoverSelected: any;
  listTaskResousceSearch = [];
  listTaskResousce = [];
  countResource = 0;
  popoverCrr: any;
  vllPriority = 'TM005';

  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() viewTask = new EventEmitter<any>();
  @Output() hoverPopover = new EventEmitter<any>();

  lstTaskbyParent = [];
  isHoverPop = false;
  timeoutId: any;

  constructor(
    private api: ApiHttpService,
    private callfc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {}

  ngOnInit(): void {}

  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({ e: e, data: dt });
  }

  dbClick(data) {
    this.viewTask.emit(data);
  }

  changeDataMF(e, data) {
    if (e) {
      e.forEach((x) => {
        if (
          (x.functionID == 'TMT02016' || x.functionID == 'TMT02017') &&
          data.confirmControl == '0'
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
        //an giao viec
        if (x.functionID == 'SYS005') {
          x.disabled = true;
        }
        if (
          (x.functionID == 'TMT02015' || x.functionID == 'TMT02025') &&
          data.status == '90'
        ) {
          x.disabled = true;
        }
        //an cap nhat tien do khi hoan tat
        if (
          (x.functionID == 'TMT02018' ||
            x.functionID == 'TMT02026' ||
            x.functionID == 'TMT02035') &&
          data.status == '90'
        ) {
          x.disabled = true;
        }
        //an voi ca TMT026
        if (
          (x.functionID == 'SYS02' ||
            x.functionID == 'SYS03' ||
            x.functionID == 'SYS04') &&
          (this.formModel?.funcID == 'TMT0206' ||
            this.formModel?.funcID == 'MWP0063')
        ) {
          x.disabled = true;
        }
        //an voi fun TMT03011
        if (
          (this.formModel?.funcID == 'TMT03011' ||
            this.formModel?.funcID == 'TMT05011') &&
          data.category == '1' &&
          data.createdBy != this.user?.userID &&
          !this.user?.administrator &&
          (x.functionID == 'SYS02' || x.functionID == 'SYS03')
        ) {
          x.disabled = true;
        }
        //an TMT02019
        if (
          (x.functionID == 'TMT02019' || x.functionID == 'TMT02026') &&
          (data.status == '80' || data.status == '90')
        )
          x.disabled = true;
      });
    }
  }

  PopoverDetail(p: any, emp) {
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp.memo != null || emp.memo2 != null) p.open();
    } else p.close();
  }

  popoverEmpList(p, task, mouseenter = true) {
    // this.listTaskResousceSearch = [];
    // this.countResource = 0;
    if (
      this.popoverCrr &&
      p != this.popoverCrr &&
      mouseenter &&
      this.popoverCrr.isOpen()
    ) {
      this.popoverCrr.close();
    }
    if (
      p &&
      p != this.popoverSelected &&
      this.popoverSelected &&
      this.popoverSelected.isOpen()
    ) {
      this.popoverSelected.close();
    }
    if (p) {
      var element = document.getElementById(task?.taskID);
      if (element) {
        let t = this;
        this.timeoutId = setTimeout(function () {
          if (t.isHoverPop) return;
          t.isHoverPop = true;
          t.api
            .execSv<any>(
              'TM',
              'ERM.Business.TM',
              'TaskResourcesBusiness',
              'GetListTaskResourcesByTaskIDAsync',
              task.taskID
            )
            .subscribe((res) => {
              t.listTaskResousceSearch = [];
              t.countResource = 0;
              if (t.popoverCrr && t.popoverCrr.isOpen()) t.popoverCrr.close();
              if (t.popoverSelected && t.popoverSelected.isOpen()) {
                t.popoverSelected.close();
              }
              if (res) {
                t.listTaskResousce = res;
                t.listTaskResousceSearch = res;
                t.countResource = res.length;
                if (t.isHoverPop && p) p.open();
              }
              if (p) t.popoverCrr = p;
              t.isHoverPop = false;
            });
        }, 2000);
        this.hoverPopover.emit(p);
      }
    } else {
      if (this.timeoutId) clearTimeout(this.timeoutId);
    }
    // if (this.isHoverPop) return;
    // this.isHoverPop = true;
    // this.api
    //   .execSv<any>(
    //     'TM',
    //     'ERM.Business.TM',
    //     'TaskResourcesBusiness',
    //     'GetListTaskResourcesByTaskIDAsync',
    //     task.taskID
    //   )
    //   .subscribe((res) => {
    //     if (res) {
    //       this.listTaskResousce = res;
    //       this.listTaskResousceSearch = res;
    //       this.countResource = res.length;
    //       if (this.isHoverPop) p.open();
    //       this.popoverCrr = p;
    //     }
    //     this.isHoverPop = false;
    //   });
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
}
