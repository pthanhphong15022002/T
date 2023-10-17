import { Component, Input } from '@angular/core';

@Component({
  selector: 'lib-master-detail',
  templateUrl: './master-detail.component.html',
  styleUrls: ['./master-detail.component.css']
})
export class MasterDetailComponent {
  @Input() menuFunctionID:any;
}
