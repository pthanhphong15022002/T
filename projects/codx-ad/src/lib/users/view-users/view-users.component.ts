import { Component, OnInit, Optional, ChangeDetectorRef } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'app-view-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.css']
})
export class ViewUsersComponent implements OnInit {
  data: any;
  dialog: any;
  count : number = 0;
  title='';
  lstRoles = [];
  itemSelected: any;

  constructor(
    
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,) {
      this.data = dt?.data;
      this.lstRoles = this.data.chooseRoles;
      this.dialog = dialog;
     }

  ngOnInit(): void {
    if(this.data){
      for(let item of this.lstRoles){
        if(item!=""){
          this.count = this.count + 1;
        }
      }
    }
    this.title = 'Danh sách module ('+ this.count+')';
  }

  
}
