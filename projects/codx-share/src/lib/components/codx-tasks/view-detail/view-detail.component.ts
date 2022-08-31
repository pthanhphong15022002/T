import {
  AfterViewInit,
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
  @Input() dataTree?: any[];
  @Input() dataReferences?: any[];
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

  constructor(
    private api: ApiHttpService,
    private callfc: CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
  }
  //#endregion
  //#region Init
  ngOnInit(): void { }

  ngAfterViewInit(): void { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['taskID'] && changes['taskID'].currentValue && !this.firstLoad) {
      if (changes['taskID'].currentValue === this.id) return;
      this.id = changes['taskID'].currentValue;
      this.getTaskDetail();
    }
    this.firstLoad = false;
  }
  //#region
  //#region Method
  getTaskDetail() {
    this.api
      .exec<any>('TM', 'TaskBusiness', 'GetTaskDetailsByTaskIDAsync', this.id)
      .subscribe((res) => {
        this.itemSelected = res;
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
          (x.functionID == 'SYS02' || x.functionID == 'SYS03' || x.functionID == 'SYS04') &&
          this.taskExtends
        ) {
          x.disabled = true;
        }
        if ((x.functionID == 'TMT04011' || x.functionID == 'TMT04012') && this.taskExtends.status != '3') {
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
          (x.functionID == 'TMT04021' || x.functionID == 'TMT04022' || x.functionID == 'TMT04023') &&
          data.approveStatus != '3'
        ) {
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
}
