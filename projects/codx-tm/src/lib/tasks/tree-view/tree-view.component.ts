import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'lib-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css'],
})
export class TreeViewComponent implements OnInit, AfterViewInit {
  @Input() data?: any;
  @Input() formModel?: FormModel;
  dataTree = [];
  // popoverList: any;
  // popoverDetail: any;
  // lstTaskbyParent = [];
  @Output() clickMoreFunction = new EventEmitter<any>();

  constructor(
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {}

  ngOnInit(): void {
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
  ngAfterViewInit(): void {
    
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
}
