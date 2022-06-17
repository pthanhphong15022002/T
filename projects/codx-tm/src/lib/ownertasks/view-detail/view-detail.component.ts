import { Component, Input, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'app-view-detail',
  templateUrl: './view-detail.component.html',
  styleUrls: ['./view-detail.component.scss']
})
export class ViewDetailComponent implements OnInit {
  data: any;
  dialog: any;
  active = 1;
  @Input() formModel?: FormModel;
  constructor(
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
  }

  ngOnInit(): void {
  }
  aaa(val:any)
  {
    console.log(val)
  }

}
