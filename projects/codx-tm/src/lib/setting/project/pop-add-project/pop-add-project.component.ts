import { Data_Line } from './../../../../../../codx-fd/src/lib/wallets/wallets.component';
import { Component, Input, OnInit, Optional } from '@angular/core';
import { AuthStore, CacheService, DialogData, DialogRef, ApiHttpService } from 'codx-core';
import { TM_Projects } from '../../../models/TM_Projects.model';
import moment from 'moment';

@Component({
  selector: 'lib-pop-add-project',
  templateUrl: './pop-add-project.component.html',
  styleUrls: ['./pop-add-project.component.css']
})
export class PopAddProjectComponent implements OnInit {
  @Input() projects = new TM_Projects();

  title= 'Thêm mới dự án';
  dialog: any;
  user: any;
  functionID: string;
  gridViewSetup: any;
  readOnly = false;

  constructor( 
    private authStore: AuthStore,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dialog?: DialogRef,
    @Optional() dd?: DialogData,) { 
    this.projects = {
      ...this.projects,
      ...dd?.data[0],
    };

    this.dialog = dialog;
    this.user = this.authStore.get();
    this.functionID = this.dialog.formModel.funcID;
  }

  ngOnInit(): void {
    this.cache.gridViewSetup('Projects', 'grvProjects').subscribe(res => {
      if (res)
        this.gridViewSetup = res
    })
  }

  valueApp(data) {
    this.projects.projectCategory = data.data;
  }

  valueChange(data) {
    if (data.data) {
      this.projects.projectName = data.data;
      
     
    }
  }

  valueCus(data){
    this.projects.customerName = data.data;
  }

  valueLocation(data){
    this.projects.location = data.data;
  }

  cbxChange(data) {
    if (data.data && data.data[0]) {
      this.projects.projectGroupID = data.data;
      // if (data.field === 'projectGroupID' && this.action == 'add')
      //   this.loadTodoByGroup(this.projects.projectGroupID);
    }
  }

  cbxUser(data){
    if(data.data){
      this.projects.projectManeger = data.data;
    }
  }
  changeTime(data) {
    if (!data.field) return;
    this.projects[data.field] = data.data.fromDate;
    if (data.field == 'startDate') {
      if (!this.projects.endDate)
        this.projects.endDate = moment(new Date(data.data.fromDate))
          .add(1, 'hours')
          .toDate();
    }
    if (data.field == 'startDate' || data.field == 'endDate') {
      if (this.projects.startDate && this.projects.endDate)
        this.projects.estimated = moment(this.projects.endDate).diff(
          moment(this.projects.startDate),
          'hours'
        );
    }
  }

  changeMemo(event) {
    var field = event.field;
    var dt = event.data;
    this.projects.note = dt?.value ? dt.value : dt;
  }

  OnSaveForm(){
    
  }
}
