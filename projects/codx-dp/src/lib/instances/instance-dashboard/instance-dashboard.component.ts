import { Component } from '@angular/core';
import { ApiHttpService } from 'codx-core';

@Component({
  selector: 'codx-instance-dashboard',
  templateUrl: './instance-dashboard.component.html',
  styleUrls: ['./instance-dashboard.component.css'],
})
export class InstanceDashboardComponent {
  constructor(private api: ApiHttpService) {}
}
