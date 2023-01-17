import { AfterViewInit, Component, Injector, Input, OnInit, Optional, TemplateRef, ViewChild } from '@angular/core';
import { ButtonModel, UIComponent, ViewModel, ViewType, ApiHttpService, SidebarModel, CallFuncService, DialogRef, DialogData, DialogModel, FormModel } from 'codx-core';
import { CodxDpService } from '../codx-dp.service';
import { PopupAddInstanceComponent } from './popup-add-instance/popup-add-instance.component';

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

  dialog: any;
  instanceNo: string;

  constructor(
    private inject: Injector,
    private callFunc: CallFuncService,
    private codxDpService: CodxDpService,

    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(inject);
    this.dialog = dialog;

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
     //   this.genAutoNumberNo();
        this.add();
        break;
    }
  }


  //CRUD
  add(){
   this.genAutoNumberNo();
    this.cache.gridView('grvDPInstances').subscribe((res) => {
      this.cache
        .gridViewSetup('DPInstances', 'grvDPInstances')
        .subscribe((res) => {
          let titleAction = 'Nhiệm vụ';
          let option = new SidebarModel();
//        let formModel = this.dialog?.formModel;
          let formModel= new FormModel();
          formModel.formName = 'DPInstances';
          var obj = {
            instanceNo: this.instanceNo,
          };
          formModel.gridViewName = 'grvDPInstances';
          formModel.entityName = 'DP_Instances';
          option.FormModel = formModel;
          option.Width = '800px';
          option.zIndex = 1010;

          var dialogCustomField = this.callfc.openSide(
            PopupAddInstanceComponent,
            [ 'add', titleAction,obj],
            option
          );
          dialogCustomField.closed.subscribe((e) => {
            if (e && e.event != null) {
              //xu ly data đổ về
              this.detectorRef.detectChanges();
            }
          });
        });
    });
  }
  async genAutoNumberNo() {
    this.codxDpService
      .GetAutoNumberNo('DPInstances',this.funcID, 'DP_Instances', 'InstanceNo')
      .subscribe((res) => {
        if (res) {
          this.instanceNo = res;
        }
      });
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
