import { DataRequest } from './../../../../../../src/shared/models/data.request';
import { Component, Injector, OnInit } from '@angular/core';
import { GradientService } from '@syncfusion/ej2-angular-circulargauge';
import { AuthStore, UIComponent } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';

@Component({
  selector: 'compdashboard',
  templateUrl: './compdashboard.component.html',
  styleUrls: ['./compdashboard.component.scss'],
  providers: [GradientService],
})
export class CompDashboardComponent extends UIComponent implements OnInit {
  funcID: string;
  model: DataRequest;
  user: any;

  constructor(
    private inject: Injector,
    private auth: AuthStore,
    private tmService: CodxTMService
  ) {
    super(inject);
    this.funcID = this.router.snapshot.params['funcID'];
    this.user = this.auth.get();
    this.model = new DataRequest();
    this.model.predicate = 'CompanyID = @0';
    this.model.dataValue = this.user.employee?.companyID;
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
  }

  onInit(): void {
    this.getGeneralData();
  }

  private getGeneralData() {
    this.tmService.getCompDBData(this.model).subscribe((res) => {
      console.log(res);
    });
  }
}
