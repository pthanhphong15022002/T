import { AfterViewInit, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-popup-view-task-resource',
  templateUrl: './popup-view-task-resource.component.html',
  styleUrls: ['./popup-view-task-resource.component.css'],
})
export class PopupViewTaskResourceComponent implements OnInit, AfterViewInit {
  data: any;
  dialog: any;
  title = '';
  listTaskResousce = [];
  listTaskResousceFull = [];
  searchField = '';
  funcID = '';
  listRoles = [];
  vllRole = 'TM002';
  countResource = 0;
  constructor(
    private api: ApiHttpService,
    private cache: CacheService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data[0];
    this.dialog = dialog;
    this.funcID = dt?.data[1];
    this.cache.valueList(this.vllRole).subscribe((res) => {
      if (res && res?.datas.length > 0) {
        this.listRoles = res.datas;
      }
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.funcID == 'TMT0203') {
      //can 1 bien co dinh để xác định là task của giao viẹc
      this.api
        .execSv<any>(
          'TM',
          'ERM.Business.TM',
          'TaskResourcesBusiness',
          'GetListTaskResourcesByTaskIDAsync',
          this.data.taskID
        )
        .subscribe((res) => {
          if (res) {
            this.listTaskResousce = res;
            this.listTaskResousceFull = res;
            this.countResource = res.length;
            this.title =
              'Danh sách được phân công (' + this.countResource + ')';
          }
        });
    } else {
      // this.api
      //   .execSv<any>(
      //     'TM',
      //     'ERM.Business.TM',
      //     'TaskResourcesBusiness',
      //     'GetTaskResouceByRefIDAsync',
      //     this.data.taskID
      //   )
      //   .subscribe((res) => {
      //     if (res) {
      //       this.listTaskResousce.push(res);
      //  this.listTaskResousceFull.push(res) ;
      // this.countResource = res.length
      //       this.title =
      //         'Danh sách được phân công (' + this.listTaskResousce.length + ')';
      //     }
      //   });
    }
  }

  searchName(e) {
    var listTaskResousce = [];
    this.searchField = e;
    if (this.searchField.trim()=='') {
      this.listTaskResousce = this.listTaskResousceFull;
      return;
    }
    this.listTaskResousceFull.forEach((res) => {
      var name = res.resourceName;
      if (name.toLowerCase().includes(this.searchField.toLowerCase())) {
        listTaskResousce.push(res);
      }
    });
    this.listTaskResousce = listTaskResousce;
  }
}
