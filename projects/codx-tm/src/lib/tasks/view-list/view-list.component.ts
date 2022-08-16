import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { DialogData, DialogRef, ApiHttpService, FormModel, CallFuncService } from 'codx-core';
import { PopupViewTaskResourceComponent } from '../popup-view-task-resource/popup-view-task-resource.component';

@Component({
  selector: 'lib-view-list',
  templateUrl: './view-list.component.html',
  styleUrls: ['./view-list.component.css']
})
export class ViewListComponent implements OnInit {

  popoverList: any;
  popoverDetail: any;
  item: any;
  dialog : any
  @Input() data?: any
  @Input() formModel?: FormModel;
  @Input() vllStatus?:any;

  @Output() clickMoreFunction = new EventEmitter<any>();

  lstTaskbyParent = [];

  constructor(
    private api: ApiHttpService,
    private callfc : CallFuncService ,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) { }

  ngOnInit(): void {
  }

  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({e:e,data:dt})
  }

  PopoverDetail(p: any, emp) {
    if (emp != null) {
      this.popoverList?.close();
      this.popoverDetail = emp;
      if (emp.memo != null || emp.memo2 != null)
        p.open();
    }
    else
      p.close();
  }

  PopoverEmp(p: any, emp) {
    this.popoverList = p;
    if (emp != null) {
      this.api.execSv<any>("TM", "ERM.Business.TM", "TaskResourcesBusiness", "GetListTaskResourcesByTaskIDAsync", emp.taskID
      ).subscribe(res => {
        if (res) {
          this.lstTaskbyParent = res;
          console.log("data123", this.lstTaskbyParent)
          p.open();
        }
      })
    }
    // else {
    //   this.lstTaskbyParent = [];
    //   p.close();
    // }
  }

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
