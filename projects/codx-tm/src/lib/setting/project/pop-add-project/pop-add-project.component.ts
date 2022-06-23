import { Component, Input, OnInit, Optional } from '@angular/core';
import { AuthStore, DialogData, DialogRef } from 'codx-core';
import { TM_Projects } from '../../../models/TM_Projects.model';

@Component({
  selector: 'lib-pop-add-project',
  templateUrl: './pop-add-project.component.html',
  styleUrls: ['./pop-add-project.component.css']
})
export class PopAddProjectComponent implements OnInit {
  @Input() projects = new TM_Projects();

  title: 'Thêm mới dự án';
  dialog: any;
  user: any;
  functionID: string;
  constructor( 
    private authStore: AuthStore,
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
  }

}
