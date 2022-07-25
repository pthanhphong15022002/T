import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef, FormModel } from 'codx-core';
import { PopupViewTaskResourceComponent } from '../popup-view-task-resource/popup-view-task-resource.component';

@Component({
  selector: 'lib-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css'],
})
export class TreeViewComponent implements OnInit, AfterViewInit {
  @Input() data?: any;
  @Input() formModel?: FormModel;
  dataTree = [];
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
  ) {}

  ngOnInit(): void {
   
  }
  ngAfterViewInit(): void {
    this.api
    .execSv<any>(
      'TM',
      'ERM.Business.TM',
      'TaskBusiness',
      'GetListTasksTreeAsync',
      this.data?.taskID
    )
    .subscribe((res) => {
      this.dataTree = res;
    });
  }

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
    this.dialog = this.callfc.openForm(
      PopupViewTaskResourceComponent,
      '',
      400,
      500,
      '',
      [data,this.formModel.funcID]
    );
  }
}
