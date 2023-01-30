import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  UIComponent,
  ViewModel,
  ViewType,
  ApiHttpService,
  SidebarModel,
  CallFuncService,
  DialogRef,
  DialogData,
  DialogModel,
  FormModel,
  ResourceModel,
  RequestOption,
} from 'codx-core';
import { CodxDpService } from '../codx-dp.service';
import { DP_Instances } from '../models/models';
import { PopupAddInstanceComponent } from './popup-add-instance/popup-add-instance.component';
import { PopupMoveReasonComponent } from './popup-move-reason/popup-move-reason.component';
import { PopupMoveStageComponent } from './popup-move-stage/popup-move-stage.component';

@Component({
  selector: 'codx-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.css'],
})
export class InstancesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];

  @Input() process: any;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
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
  // data T
  hideMoreFC = false;
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  dataObj: any;
  vllStatus = 'DP028';

  dialog: any;
  moreFunc: any;
  instanceNo: string;
  listSteps = [];

  formModel: FormModel;
  isMoveSuccess: boolean = true;

  instances = new DP_Instances();

  constructor(
    private inject: Injector,
    private callFunc: CallFuncService,
    private codxDpService: CodxDpService,
    private changeDetectorRef: ChangeDetectorRef,

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
      {
        type: ViewType.kanban,
        active: false,
        sameData: false,
        request: this.request,
        request2: this.resourceKanban,
        model: {
          template: this.cardKanban,
        },
      },
    ];

    this.view.dataService.methodDelete = 'DeletedInstanceAsync';
  }
  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
    this.dataObj = {
      processID: this.process?.recID ? this.process?.recID : '',
    };
    if (this.process)
      this.codxDpService.getStep(this.process?.recID).subscribe((dt) => {
        if (dt && dt?.length > 0) this.listSteps = dt;
      });
    //kanban
    this.request = new ResourceModel();
    this.request.service = 'DP';
    this.request.assemblyName = 'DP';
    this.request.className = 'InstancesBusiness';
    this.request.method = 'GetListInstancesAsync'; //hàm load data chưa viết
    this.request.idField = 'recID';
    this.request.dataObj = this.dataObj; ///de test- ccần cái này để load đúng

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'DP';
    this.resourceKanban.assemblyName = 'DP';
    this.resourceKanban.className = 'StepsBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.dataObj;

    // this.api.execSv<any>(this.service, this.assemblyName, this.className, 'AddInstanceAsync').subscribe();
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        //   this.genAutoNumberNo();
        this.add();
        // this.delete(this.instances);
        // this.moveStage();
        //  this.moveReason(this.isMoveSuccess);
        break;
    }
  }

  //CRUD
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      const applyFor = this.process.applyFor;
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '850px';
      option.zIndex = 1010;

      let stepCrr = this.listSteps?.length > 0 ? this.listSteps[0] : undefined;
      var dialogCustomField = this.callfc.openSide(
        PopupAddInstanceComponent,
        ['add', applyFor, stepCrr],
        option
      );
      dialogCustomField.closed.subscribe((e) => {
        if (e && e.event != null) {
          //xu ly data đổ về
          this.detectorRef.detectChanges();
        }
      });
    });
    // this.genAutoNumberNo();
    // this.cache.gridView('grvDPInstances').subscribe((res) => {
    //   this.cache
    //     .gridViewSetup('DPInstances', 'grvDPInstances')
    //     .subscribe((res) => {
    //
    //       let option = new SidebarModel();
    //       //        let formModel = this.dialog?.formModel;
    //       let formModel = new FormModel();
    //       formModel.formName = 'DPInstances';
    //       let stepCrr = this.listSteps[0] || undefined
    //       var obj = {
    //         instanceNo: this.instanceNo,
    //         step : stepCrr
    //       };
    //       formModel.gridViewName = 'grvDPInstances';
    //       formModel.entityName = 'DP_Instances';
    //       option.FormModel = formModel;
    //       option.Width = '800px';
    //       option.zIndex = 1010;

    //       var dialogCustomField = this.callfc.openSide(
    //         PopupAddInstanceComponent,
    //         ['add', titleAction, obj],
    //         option
    //       );
    //       dialogCustomField.closed.subscribe((e) => {
    //         if (e && e.event != null) {
    //           //xu ly data đổ về
    //           this.detectorRef.detectChanges();
    //         }
    //       });
    //     });
    // });
  }
  async genAutoNumberNo() {
    this.codxDpService
      .GetAutoNumberNo('DPInstances', this.funcID, 'DP_Instances', 'InstanceNo')
      .subscribe((res) => {
        if (res) {
          this.instanceNo = res;
        }
      });
  }
  //End

  //Event
  clickMF(e, data?) {
    // this.itemSelected = data;
    // this.titleAction = e.text;
    this.moreFunc = e.functionID;
    switch (e.functionID) {
      case 'SYS01':
        this.add();
        break;
      case 'SYS03':
        // this.edit(data);
        break;
      case 'SYS04':
        //   this.copy(data);
        break;
      case 'SYS02':
        this.delete(data);
        break;
    }
  }

  changeDataMF(e, data) {}
  //End

  convertHtmlAgency(buID: any, test: any, test2: any) {
    var desc = '<div class="d-flex">';
    if (buID)
      desc +=
        '<div class="d-flex align-items-center"><span class="text-gray-600 icon-14 icon-apartment me-1"></span><span>' +
        buID +
        '</span></div>' +
        '<div class="d-flex align-items-center"><span class="text-gray-600"></span><span>' +
        test +
        '</span></div>' +
        '<div class="d-flex justify-content-end"><span class="text-gray-600 icon-14 icon-apartment me-1"></span><span>' +
        test2 +
        '</span></div>';

    return desc + '</div>';
  }

  selectedChange(task: any) {
    this.dataSelected = task?.data ? task?.data : task;
    this.detectorRef.detectChanges();
  }

  //begin code Thao
  dblClick(e, data) {}

  onActions(e) {
    switch (e.type) {
      case 'drop':
        // xử lý data
        break;
      case 'drag':
        ///bắt data khi kéo
        break;
      case 'dbClick':
        //xư lý dbClick
        break;
    }
  }

  changeView(e) {}
  // end code

  #region;
  moveStage() {
    let formModel = new FormModel();
    formModel.formName = 'DPInstances';
    formModel.gridViewName = 'grvDPInstances';
    formModel.entityName = 'DP_Instances';

    var obj = {
      // more: more,
      //  data: data,
      processName: this.process.processName,
      funcIdMain: this.funcID,
      formModel: formModel,
    };

    var dialogRevision = this.callfc.openForm(
      PopupMoveStageComponent,
      '',
      950,
      1000,
      '',
      obj
    );
    dialogRevision.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        this.view.dataService.clear();
        this.view.dataService.update(e?.event).subscribe();
        this.detectorRef.detectChanges();
      }
    });
  }
  moveReason(isMoveSuccess: Boolean) {
    let formModel = new FormModel();
    formModel.formName = 'DPInstancesStepsReasons';
    formModel.gridViewName = 'grvDPInstancesStepsReasons';
    formModel.entityName = 'DP_Instances_Steps_Reasons';
    var obj = {
      // more: more,
      //  data: data,
      processName: this.process.processName,
      funcIdMain: this.funcID,
      formModel: formModel,
      isReason: isMoveSuccess,
    };

    var dialogRevision = this.callfc.openForm(
      PopupMoveReasonComponent,
      '',
      800,
      600,
      '',
      obj
    );
    dialogRevision.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        this.view.dataService.clear();
        this.view.dataService.update(e?.event).subscribe();
        this.detectorRef.detectChanges();
      }
    });
  }

  delete(data: any) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([this.view.dataService.dataSelected], true, (opt) =>
        this.beforeDel(opt)
      )
      .subscribe((res) => {
        if (res) {
          this.view.dataService.onAction.next({ type: 'delete', data: data });
        }
      });
    this.changeDetectorRef.detectChanges();
  }
  beforeDel(opt: RequestOption) {
    var itemSelected = opt.data[0];
    opt.methodName = 'DeletedInstanceAsync';
    itemSelected.recID = 'fa6fe84a-9585-11ed-83ef-d493900707c4';
    opt.data = [itemSelected.recID];
    return true;
  }

  #endregion;
}
