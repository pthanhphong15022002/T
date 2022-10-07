import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-codx-popup-views',
  templateUrl: './codx-popup-views.component.html',
  styleUrls: ['./codx-popup-views.component.css'],
})
export class CodxPopupViewsComponent implements OnInit {
  title: '';
  dialog: DialogRef;
  funcID : any ;
  objectType: any ;
  objectID: any;
  showLabelAttachment = true ;
  constructor(@Optional() dt?: DialogData, @Optional() dialog?: DialogRef) {}

  ngOnInit(): void {}
}
