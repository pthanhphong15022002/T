import { AfterViewInit, Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { viewport } from '@popperjs/core';
import { ApiHttpService, CallFuncService, DialogData, DialogRef, FormModel } from 'codx-core';
import { AnyARecord } from 'dns';
import { TM_Tasks } from '../../models/TM_Tasks.model';
import { PopupViewTaskResourceComponent } from '../popup-view-task-resource/popup-view-task-resource.component';

@Component({
  selector: 'app-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss']
})
export class ViewDetailComponent implements OnInit,AfterViewInit {
  data: any;
  dialog: any;
  active = 1;
  @Input() formModel?: FormModel;
  @Input() itemSelected?: any 
  @Input() taskExtends?: any
  @Input() param?: any
  @Input() listRoles ? : any;
  @Input() popoverCrr? :any
  @Input() vllStatus ?:any
  @Input() vllExtendStatus? :any
  @Input() vllApproveStatus?:any
  @Input() dataTree?:any [] 
  popoverDataSelected : any
  searchField =''
  listTaskResousceSearch = []
  listTaskResousce = []
  vllRole = 'TM002';
  countResource = 0;
 
  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() hoverPopover = new EventEmitter<any>();
  constructor(
    private api: ApiHttpService,
    private callfc : CallFuncService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
  }

  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
  
  }

  clickMF(e: any, dt?: any) {
    if(this.taskExtends) return  this.clickMoreFunction.emit({e:e,data:this.taskExtends})
    this.clickMoreFunction.emit({e:e,data:dt})
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
    this.listTaskResousceSearch=[]
    this.countResource= 0
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
            this.hoverPopover.emit(p)
            // this.titlePopover =
            //   'Danh sách được phân công (' + this.countResource + ')';
          }
        });
  }

  searchName(e) {
    var listTaskResousceSearch = [];
    this.searchField = e;
    if (this.searchField.trim()=='') {
      this.listTaskResousceSearch = this.listTaskResousce;
      return;
    }

    this.listTaskResousce.forEach((res) => {
      var name = res.resourceName;
      if (name.toLowerCase().includes(this.searchField.toLowerCase())) {
        listTaskResousceSearch.push(res);
      }
    });
    this.listTaskResousceSearch = listTaskResousceSearch;
  }

}
