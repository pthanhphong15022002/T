import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'app-view-users',
  templateUrl: './view-users.component.html',
  styleUrls: ['./view-users.component.css']
})
export class ViewUsersComponent implements OnInit {

  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,) { }

  ngOnInit(): void {
  }

}
