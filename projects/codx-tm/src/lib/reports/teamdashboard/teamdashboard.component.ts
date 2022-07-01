import { Component, OnInit } from '@angular/core';
import { ApiHttpService, AuthStore, DataRequest } from 'codx-core';

@Component({
  selector: 'team-dashboard',
  templateUrl: './teamdashboard.component.html',
  styleUrls: ['./teamdashboard.component.scss'],
})
export class TeamDashboardComponent implements OnInit {
  model: DataRequest;

  constructor(private api: ApiHttpService, private auth: AuthStore) {}

  ngOnInit(): void {
    this.model = new DataRequest();
    this.model.formName = 'Tasks';
    this.model.funcID = 'TMT0102';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;

    this.api
      .execSv(
        'TM',
        'TM',
        'ReportBusiness',
        'GetDataTeamDashboardAsync',
        this.model
      )
      .subscribe((res) => {
        console.log('TeamDashboard', res);
      });
  }
}
