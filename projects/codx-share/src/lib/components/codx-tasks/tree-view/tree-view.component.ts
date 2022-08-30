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
import { ApiHttpService, CallFuncService, DialogData, DialogRef, FormModel, ViewTreeDetailComponent } from 'codx-core';

@Component({
  selector: 'share-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css'],
})
export class TreeViewComponent implements OnInit, AfterViewInit {
  @Input() data?: any
  @Input() formModel?: FormModel;
  @Input() vllStatus?: any;
  @Input() listRoles?: any;
  @Input() totalData?: any;

  listDataTree: any[] = [];
  dataTree: any[] = [];

  dialog: any
  // popoverList: any;
  // popoverDetail: any;
  // lstTaskbyParent = [];
  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() clickShowTaskChildren = new EventEmitter<any>();

  constructor(
    private api: ApiHttpService,
    private callfc: CallFuncService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {

  }

  ngOnInit(): void {

  }
  ngAfterViewInit(): void {
    // this.view.dataService.data.forEach(obj=>{
      this.api
    .execSv<any>(
      'TM',
      'ERM.Business.TM',
      'TaskBusiness',
      'GetListTasksChildrenDeTailsTreeOneStepAsync',
      this.data.taskID
    )
    .subscribe((res) => {
      if (res) {
        this.data.items = res;
        this.listDataTree.push(this.data)
      }
    });
  }
  // loadTreeView(item) {
  //   this.api
  //     .execSv<any>(
  //       'TM',
  //       'ERM.Business.TM',
  //       'TaskBusiness',
  //       'GetListTasksTreeAsync',
  //       item?.taskID
  //     )
  //     .subscribe((res) => {
  //       if (res) this.listDataTree.push(res);
  //     });
  // }

  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({ e: e, data: dt });
  }

  // PopoverDetail(p: any, emp) {
  //   if (emp != null) {
  //     this.popoverList?.close();
  //     this.popoverDetail = emp;
  //     if (emp.memo != null || emp.memo2 != null) p.open();
  //   } else p.close();
  // }

  // PopoverEmp(p: any, emp) {
  //   this.popoverList = p;
  //   if (emp != null) {
  //     this.api
  //       .execSv<any>(
  //         'TM',
  //         'ERM.Business.TM',
  //         'TaskResourcesBusiness',
  //         'GetListTaskResourcesByTaskIDAsync',
  //         emp.taskID
  //       )
  //       .subscribe((res) => {
  //         if (res) {
  //           this.lstTaskbyParent = res;
  //           console.log('data123', this.lstTaskbyParent);
  //           p.open();
  //         }
  //       });
  //   }
  // }

  openViewListTaskResource(data) {
    // this.dialog = this.callfc.openForm(
    //   PopupViewTaskResourceComponent,
    //   '',
    //   400,
    //   500,
    //   '',
    //   [data,this.formModel.funcID]
    // );
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

  // PopoverDetail(p: any, emp) {
  //   if (emp != null) {
  //     this.popoverList?.close();
  //     this.popoverDetail = emp;
  //     if (emp.memo != null || emp.memo2 != null)
  //       p.open();
  //   }
  //   else
  //     p.close();
  // }


  // popoverEmpList(p: any, task) {
  //   this.listTaskResousceSearch = [];
  //   this.countResource = 0;
  //   if (this.popoverCrr) {
  //     if (this.popoverCrr.isOpen()) this.popoverCrr.close();
  //   }
  //   this.api
  //     .execSv<any>(
  //       'TM',
  //       'ERM.Business.TM',
  //       'TaskResourcesBusiness',
  //       'GetListTaskResourcesByTaskIDAsync',
  //       task.taskID
  //     )
  //     .subscribe((res) => {
  //       if (res) {
  //         this.listTaskResousce = res;
  //         this.listTaskResousceSearch = res;
  //         this.countResource = res.length;
  //         p.open();
  //       }
  //     });
  // }
  // searchName(e) {
  //   var listTaskResousceSearch = [];
  //   if (e.trim() == '') {
  //     this.listTaskResousceSearch = this.listTaskResousce;
  //     return;
  //   }

  //   this.listTaskResousce.forEach((res) => {
  //     var name = res.resourceName;
  //     if (name.toLowerCase().includes(e.toLowerCase())) {
  //       listTaskResousceSearch.push(res);
  //     }
  //   });
  //   this.listTaskResousceSearch = listTaskResousceSearch;
  // }

  showTaskChildren(item) {
   // this.clickShowTaskChildren.emit({ item: item});
    this.api
    .execSv<any>(
      'TM',
      'ERM.Business.TM',
      'TaskBusiness',
      'GetListTasksTreeAsync',
      item.taskID
    )
    .subscribe((res) => {
      if (res) {
       var index = this.listDataTree.findIndex(x=>x.taskID==res[0].taskID) ;
        if(index!=-1) 
        this.listDataTree[index] = res[0];
      //  this.changeDetectorRef.detectChanges();
        }
    });
  }

}
