import { DataRequest } from './../../../../../../src/shared/models/data.request';
import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { GradientService } from '@syncfusion/ej2-angular-circulargauge';
import { AuthStore, UIComponent } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';

@Component({
  selector: 'deptdashboard',
  templateUrl: './deptdashboard.component.html',
  styleUrls: ['./deptdashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [GradientService],
})
export class DeptDashboardComponent extends UIComponent implements OnInit {
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
    this.model.predicate = 'DepartmentID = @0';
    this.model.dataValue = this.user.employee?.departmentID;
    this.model.predicates = 'OrgUnitID = @0';
    this.model.dataValues = this.user.buid;
    this.model.formName = 'Tasks';
    this.model.gridViewName = 'grvTasks';
    this.model.entityName = 'TM_Tasks';
    this.model.pageLoading = false;
  }

  onInit(): void {
    this.getGeneralData();
  }

  private getGeneralData() {
    this.tmService.getDeptDBData(this.model).subscribe((res) => {
      console.log(res);
    });
  }
}
