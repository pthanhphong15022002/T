import { ApiHttpService, AuthStore, DataRequest } from 'codx-core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'my-dashboard',
  templateUrl: './mydashboard.component.html',
  styleUrls: ['./mydashboard.component.scss'],
})
export class MyDashboardComponent implements OnInit {
  model: DataRequest;

  constructor(
    private api: ApiHttpService,
    private auth: AuthStore,
  ){}

  ngOnInit(): void {
    this.model = new DataRequest();
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.predicate = 'Owner=@0';
    this.model.dataValue = this.auth.get().userID;
    this.model.pageLoading = false;
    
    this.api.execSv('TM','TM','ReportBusiness','GetDataMyDashboardAsync', this.model).subscribe(res => {
      console.log('MyDashboard', res)
    })
  }

}
