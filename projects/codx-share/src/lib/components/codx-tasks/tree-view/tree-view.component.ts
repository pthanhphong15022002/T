import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef, FormModel, ViewTreeDetailComponent, DataService } from 'codx-core';

@Component({
  selector: 'share-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css'],
})
export class TreeViewComponent implements OnInit, AfterViewInit {

  //#region Constructor
  @Input() data: any
  @Input() formModel?: FormModel;
  @Input() dataService: DataService;
  @Input() vllStatus?: any;
  @Input() listRoles?: any;
  @Input() totalData?: any;

  vllPriority ='TM005'
  // dataTree: any[] = [];
  dialog: any;
  @Output() clickMoreFunction = new EventEmitter<any>();
  // @Output() clickShowTaskChildren = new EventEmitter<any>();

  constructor(
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) { }
  //#endregion

  //#region Init
  ngOnInit(): void { }

  ngAfterViewInit(): void {
    // this.api
    //   .execSv<any>(
    //     'TM',
    //     'ERM.Business.TM',
    //     'TaskBusiness',
    //     'GetListTasksChildrenDeTailsTreeOneStepAsync',
    //     this.data.taskID
    //   )
    //   .subscribe((res) => {
    //     if (res) {
    //       this.data.items = res;
    //       this.listDataTree.push(this.data)
    //     }
    //   });
  }
  //#endregion

  //#region Event
  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({ e: e, data: dt });
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
      });
    }
  }
  //#endregion

  //#region Function
  showTaskChildren(item) {
    // this.clickShowTaskChildren.emit({ item: item});
    // this.api
    //   .execSv<any>(
    //     'TM',
    //     'ERM.Business.TM',
    //     'TaskBusiness',
    //     'GetListTasksTreeAsync',
    //     item.taskID
    //   )
    //   .subscribe((res) => {
    //     if (res) {
    //       var index = this.listDataTree.findIndex(x => x.taskID == res[0].taskID);
    //       if (index != -1)
    //         this.listDataTree[index] = res[0];
    //     }
    //   });
  }
  //#endregion
}
