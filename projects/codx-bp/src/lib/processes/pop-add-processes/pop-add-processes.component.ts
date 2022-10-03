import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-pop-add-processes',
  templateUrl: './pop-add-processes.component.html',
  styleUrls: ['./pop-add-processes.component.css']
})
export class PopAddProcessesComponent implements OnInit {

  data: any;

  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = JSON.parse(JSON.stringify(dialog.dataService!.dataSelected));

  }

  ngOnInit(): void {
  }

}
