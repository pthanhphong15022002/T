import { Component } from '@angular/core';

@Component({
  selector: 'lib-codx-view-file',
  templateUrl: './codx-view-file.component.html',
  styleUrls: ['./codx-view-file.component.css']
})
export class CodxViewFileComponent {
  data:any;
 
  resultEvent(data:any)
  {
    this.data = data;
  }

}
