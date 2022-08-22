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
  @Input() listRoles?: any;
  listTaskResousceSearch = [];
  listTaskResousce = [];
  countResource = 0;
  popoverCrr: any;


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

  popoverEmpList(p: any, task) {
    this.listTaskResousceSearch = [];
    this.countResource = 0;
    if (this.popoverCrr) {
      if (this.popoverCrr.isOpen()) this.popoverCrr.close();
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
        }
      });
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
