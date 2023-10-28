import { Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DataRequest, DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-evoucher-add',
  templateUrl: './evoucher-add.component.html',
  styleUrls: ['./evoucher-add.component.scss']
})
export class EvoucherAddComponent implements OnInit{
  dialog:any;
  constructor(
    private api : ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  {
    this.dialog = dialog;
  }
  ngOnInit(): void { 
  this.getData();
  }

  getData()
  {
    var model = new DataRequest();
    model.page = 1;
    model.pageSize = 20;
    this.api.execSv("FD","FD","VouchersBusiness","GetCategoriesERMAsync",model).subscribe();
  }
}
