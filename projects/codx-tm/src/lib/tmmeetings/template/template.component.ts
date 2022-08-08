import { ActivatedRoute } from '@angular/router';
import { DataRequest } from './../../../../../../src/shared/models/data.request';
import { CO_MeetingTemplates } from './../../models/CO_MeetingTemplates.model';
import { Component, Injector, Input, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, ApiHttpService, UIComponent } from 'codx-core';

@Component({
  selector: 'lib-template',
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent extends UIComponent implements OnInit {

  @Input() template = new CO_MeetingTemplates();
  options =new DataRequest();
  dialog: any;
  data: any;
  title= 'Chọn template';
  funcID: any;
  constructor(
    private injector: Injector,
    private activedRouter: ActivatedRoute,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
    super(injector);

    this.dialog = dialog;
    this.data = dt?.data;
    this.funcID = this.activedRouter.snapshot.params['funcID'];

  }

  onInit(): void {
    // this.options.pageLoading = false;
    // this.options.entityName = 'FD_KudosTrans';
    // this.options.entityPermission = 'FD_KudosTrans';
    // this.options.gridViewName = 'grvMeetingTemplates';
    // this.options.formName = 'KudosTrans';
    // this.options.funcID = this.funcID;
    this.loadData();
  }


  loadData(){
    let data = new DataRequest();
    data.page = 1;
    data.pageSize = 10;
    data.comboboxName = 'TM_MeetingTemplates';
    data.funcID = this.funcID;
    data.gridViewName = 'grvMeetingTemplates';
    this.api.execSv<any>('CO',
    'ERM.Business.CM',
    'DataBusiness',
    'LoadDataCbxAsync', data).subscribe(res=>{
      if(res){
        console.log(res);
      }
    })
  }
}
