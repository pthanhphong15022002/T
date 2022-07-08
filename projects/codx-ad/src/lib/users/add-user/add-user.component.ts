import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  title= 'Thêm người dùng';
  dialog: DialogRef;
  data: any;
  
  constructor(
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.dialog = dialog;
    this.data = dialog.dataService!.dataSelected;
   }

  ngOnInit(): void {
  }

}
