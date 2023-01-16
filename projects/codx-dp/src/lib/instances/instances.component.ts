import { AfterViewInit, Component, Injector, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, UIComponent, ViewModel, ViewType, ApiHttpService } from 'codx-core';

@Component({
  selector: 'codx-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.css']
})
export class InstancesComponent extends UIComponent
implements OnInit, AfterViewInit {
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  views: Array<ViewModel> = [];

  @Input() process: any;

  showButtonAdd = true;
  button?: ButtonModel;
  dataSelected: any;
  //Setting load list
  service = 'DP';
  assemblyName = 'ERM.Business.DP';
  entityName = 'DP_Instances';
  className = 'InstancesBusiness';
  idField = 'recID';
  funcID = 'DP0101';
  method = 'GetListInstancesAsync';
  //end
  dataObj: any;

  constructor(
    private inject: Injector,
  ) {
    super(inject);
  }
  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.listdetail,
        sameData: true,
        active: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.templateDetail,
        },
      },
    ];
  }
  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.dataObj = {
      processID: this.process?.recID ? this.process?.recID : '',
    };
    // this.api.execSv<any>(this.service, this.assemblyName, this.className, 'AddInstanceAsync').subscribe();
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }


  //CRUD
  add(){

  }
  //End

  //Event
  clickMF(e, data){

  }

  changeDataMF(e, data){

  }
  //End

  convertHtmlAgency(buID: any, test: any, test2: any) {
    var desc = '<div class="d-flex">';
    if (buID)
      desc +=
        '<div class="d-flex align-items-center"><span class="text-gray-600 icon-14 icon-apartment me-1"></span><span>' +
        buID +
        '</span></div>' + '<div class="d-flex align-items-center"><span class="text-gray-600"></span><span>' +
        test +
        '</span></div>' + '<div class="d-flex justify-content-end"><span class="text-gray-600 icon-14 icon-apartment me-1"></span><span>' +
        test2 +
        '</span></div>';

    return desc + '</div>';
  }

  selectedChange(task: any) {
    this.dataSelected = task?.data ? task?.data : task;
    this.detectorRef.detectChanges();
  }
}
