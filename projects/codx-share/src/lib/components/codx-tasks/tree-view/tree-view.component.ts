import {
  AfterViewInit,
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
  @Input() data?: any;
  @Input() formModel?: any;
  @Input() vllStatus ?:any
  @ViewChild("treeView") treeView : ViewTreeDetailComponent
  listDataTree :any [] =[];
  // dataTree :any [] =[];

  dialog :any
  // popoverList: any;
  // popoverDetail: any;
  // lstTaskbyParent = [];
  @Output() clickMoreFunction = new EventEmitter<any>();

  constructor(
    private api: ApiHttpService,
    private callfc : CallFuncService ,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.treeView.dataService.loaded ;
  }

  ngOnInit(): void {
   
  }
  ngAfterViewInit(): void {
    
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

  openViewListTaskResource(data){
    // this.dialog = this.callfc.openForm(
    //   PopupViewTaskResourceComponent,
    //   '',
    //   400,
    //   500,
    //   '',
    //   [data,this.formModel.funcID]
    // );
  }
}
