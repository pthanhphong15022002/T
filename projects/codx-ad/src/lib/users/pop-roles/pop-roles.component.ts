import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, ApiHttpService } from 'codx-core';
import { tmpformChooseRole } from '../../models/tmpformChooseRole.models';

@Component({
  selector: 'lib-pop-roles',
  templateUrl: './pop-roles.component.html',
  styleUrls: ['./pop-roles.component.css']
})
export class PopRolesComponent implements OnInit {
  choose: any;
  data: any;
  dialog1: any;
  title='Phân quyền người dùng';
  count = 10;
  lstFunc = [];
  lstEmp = [];
  constructor(
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog1?: DialogRef,
  ) { 
    this.dialog1 = dialog1;
    this.data = dt?.data;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(){
    this.api.call('ERM.Business.AD','UsersBusiness','GetListAppByUserRolesAsync').subscribe((res)=>{
      if(res && res.msgBodyData[0]){
        this.lstFunc = res.msgBodyData[0];
      }
    })
  }

  onChange(event, index, item){
    console.log(event);
  }
}
