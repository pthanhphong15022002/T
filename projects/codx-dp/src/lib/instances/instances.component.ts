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
  Util,
} from 'codx-core';
import { CodxDpService } from '../codx-dp.service';
import { DP_Instances } from '../models/models';
import { InstanceDetailComponent } from './instance-detail/instance-detail.component';
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
  @Input() process: any;
  @Input() isCreate: boolean;
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  @ViewChild('detailViewInstance')
  detailViewInstance: InstanceDetailComponent;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('viewColumKaban') viewColumKaban!: TemplateRef<any>;
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  views: Array<ViewModel> = [];
  moreFuncs: Array<ButtonModel> = [];
  showButtonAdd = true;
  button?: ButtonModel;
  dataSelected: any;
  //Setting load list
  service = 'DP';
  assemblyName = 'ERM.Business.DP';
  entityName = 'DP_Instances';
  className = 'InstancesBusiness';
  idField = 'recID';
  funcID = 'DPT04';
  method = 'GetListInstancesAsync';
  //end
  // data T
  hideMoreFC = false;
  request: ResourceModel;
  resourceKanban?: ResourceModel;
  dataObj: any;
  vllStatus = 'DP028';
  instanceID: string;
  dialog: any;
  moreFunc: any;
  instanceNo: string;
  listSteps = [];
  listStepInstances = [];
  stepNameCurrent: string;
  progress: string;
  formModel: FormModel;
  isMoveSuccess: boolean = true;
  titleAction = '';
  instances = new DP_Instances();
  kanban: any;
  listStepsCbx: any;
  lstStepInstances = [];
  lstStepCbx = [];
  crrStepID: string;
  moreFuncInstance = [];
  dataColums = [];
  dataDrop: any;
  isClick: boolean = true;
  stepIdClick = '';
  listProccessCbx: any;
  dataProccess: any;
  sumDaySteps: number;
  lstParticipants = [];
  oldIdInstance: any;
  viewMode:any;
  viewModeDetail = 'S';

  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE
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
    this.cache.functionList(this.funcID).subscribe((f) => {
      if (f)
        this.cache.moreFunction(f.formName, f.gridViewName).subscribe((res) => {
          if (res && res.length > 0) {
            this.moreFuncInstance = res;
          }
        });
    });

    // em bảo gán tạm
    this.dataProccess = dt?.data?.data;
    this.getListCbxProccess(this.dataProccess?.applyFor);
  }
  ngAfterViewInit(): void {
    this.viewMode = this.dataProccess.viewMode??6;  //dang lỗi nên gán cứng
    this.viewModeDetail = this.dataProccess.viewModeDetail??"S";
    this.views = [
      {
        type: ViewType.listdetail,
        active: false,
        sameData: true,
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
          template2: this.viewColumKaban,
          setColorHeader: true,
        },
      },
    ];

    this.view.dataService.methodDelete = 'DeletedInstanceAsync';
  }
  onInit(): void {
    this.showButtonAdd = this.isCreate ? true : false;
    this.button = {
      id: 'btnAdd',
    };
    this.dataObj = {
      processID: this.process?.recID ? this.process?.recID : '',
    };

    this.codxDpService
      .createListInstancesStepsByProcess(this.process?.recID)
      .subscribe((dt) => {
        if (dt && dt?.length > 0) {
          this.listSteps = dt;
          this.listStepsCbx = JSON.parse(JSON.stringify(this.listSteps));
          this.deleteListReason(this.listStepsCbx);
          this.getSumDurationDayOfSteps(this.listStepsCbx);
        }
      });
    this.getPermissionProcess(this.process.recID);
    //kanban
    this.request = new ResourceModel();
    this.request.service = 'DP';
    this.request.assemblyName = 'DP';
    this.request.className = 'InstancesBusiness';
    this.request.method = 'GetListInstancesAsync';
    this.request.idField = 'recID';
    this.request.dataObj = this.dataObj;

    this.resourceKanban = new ResourceModel();
    this.resourceKanban.service = 'DP';
    this.resourceKanban.assemblyName = 'DP';
    this.resourceKanban.className = 'StepsBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.dataObj;
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.titleAction = evt.text;
        this.add();
        break;
    }
  }

  // progressEvent(event){
  //   this.progress = event.progress;
  //   this.stepNameInstance = event.name;
  //   this.instanceID = event.instanceID;
  // }

  //CRUD
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      const funcIDApplyFor =
        this.process.applyFor === '1' ? 'DPT0406' : 'DPT0405';
      const applyFor = this.process.applyFor;
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      this.cache.functionList(funcIDApplyFor).subscribe((fun) => {
        this.cache.gridView(fun.gridViewName).subscribe((grv) => {
          this.cache
            .gridViewSetup(fun.formName, fun.gridViewName)
            .subscribe((grvSt) => {
              var formMD = new FormModel();
              formMD.funcID = funcIDApplyFor;
              formMD.entityName = fun.entityName;
              formMD.formName = fun.formName;
              formMD.gridViewName = fun.gridViewName;
              option.Width = '850px';
              option.zIndex = 1001;
              this.view.dataService.dataSelected.processID = this.process.recID;
              if (!this.process.instanceNoSetting) {
                //this.genAutoNumberNo(applyFor); // gan tam thoi chư sai vỡ mỏ || em gán tạm thui a thảo ơi, em vẫn nhớ lời a dặn ><
                this.codxDpService
                  .genAutoNumber(this.funcID, 'DP_Instances', 'InstanceNo')
                  .subscribe((res) => {
                    if (res) {
                      this.instanceNo = res;
                      this.openPopUpAdd(applyFor, formMD, option, 'add');
                    }
                  });
              } else
                this.codxDpService
                  .getAutoNumberByInstanceNoSetting(
                    this.process.instanceNoSetting
                  )
                  .subscribe((isNo) => {
                    this.instanceNo = isNo;
                    this.openPopUpAdd(applyFor, formMD, option, 'add');
                  });
            });
        });
      });
    });
  }
  copy(data, titleAction) {
    if (data) {
      this.view.dataService.dataSelected = data;
      this.oldIdInstance = data.recID;
    }
    this.view.dataService.copy().subscribe((res) => {
      const funcIDApplyFor =
        this.process.applyFor === '1' ? 'DPT0406' : 'DPT0405';
      const applyFor = this.process.applyFor;
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      this.cache.functionList(funcIDApplyFor).subscribe((fun) => {
        this.cache.gridView(fun.gridViewName).subscribe((grv) => {
          this.cache
            .gridViewSetup(fun.formName, fun.gridViewName)
            .subscribe((grvSt) => {
              var formMD = new FormModel();
              formMD.funcID = funcIDApplyFor;
              formMD.entityName = fun.entityName;
              formMD.formName = fun.formName;
              formMD.gridViewName = fun.gridViewName;
              option.Width = '850px';
              option.zIndex = 1001;
              if (!this.process.instanceNoSetting) {
                //this.genAutoNumberNo(applyFor); // gan tam thoi chư sai vỡ mỏ || em gán tạm thui a thảo ơi, em vẫn nhớ lời a dặn ><
                this.codxDpService
                  .genAutoNumber(this.funcID, 'DP_Instances', 'InstanceNo')
                  .subscribe((res) => {
                    if (res) {
                      this.instanceNo = res;
                      this.openPopUpAdd(applyFor, formMD, option, titleAction);
                    }
                  });
              } else {
                this.codxDpService
                  .getAutoNumberByInstanceNoSetting(
                    this.process.instanceNoSetting
                  )
                  .subscribe((isNo) => {
                    this.instanceNo = isNo;
                    this.openPopUpAdd(applyFor, formMD, option, titleAction);
                  });
              }
            });
        });
      });
    });
  }
  openPopUpAdd(applyFor, formMD, option, action) {
    var dialogCustomField = this.callfc.openSide(
      PopupAddInstanceComponent,
      [
        action === 'add' ? 'add' : 'copy',
        applyFor,
        this.listSteps,
        this.titleAction,
        formMD,
        this.listStepsCbx,
        this.instanceNo,
        (this.sumDaySteps = this.getSumDurationDayOfSteps(this.listStepsCbx)),
        this.lstParticipants,
        this.oldIdInstance,
      ],
      option
    );
    dialogCustomField.closed.subscribe((e) => {
      if (!e?.event) this.view.dataService.clear();
      if (e && e.event != null) {
        if (this.kanban) {
          if (this.kanban?.dataSource?.length == 1) {
            this.kanban.refresh();
          }
        }
        this.detectorRef.detectChanges();
      }
    });
  }

  edit(data, titleAction) {
    if (data) {
      this.view.dataService.dataSelected = data;
    }

    this.view.dataService
      .edit(this.view.dataService.dataSelected)
      .subscribe((res) => {
        const funcIDApplyFor =
          this.process.applyFor === '1' ? 'DPT0406' : 'DPT0405';
        const applyFor = this.process.applyFor;
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        this.cache.functionList(funcIDApplyFor).subscribe((fun) => {
          this.cache.gridView(fun.gridViewName).subscribe((grv) => {
            this.cache
              .gridViewSetup(fun.formName, fun.gridViewName)
              .subscribe((grvSt) => {
                var formMD = new FormModel();
                formMD.funcID = funcIDApplyFor;
                formMD.entityName = fun.entityName;
                formMD.formName = fun.formName;
                formMD.gridViewName = fun.gridViewName;

                option.Width = '850px';
                option.zIndex = 1001;
                this.view.dataService.dataSelected.processID =
                  this.process.recID;
                var dialogEditInstance = this.callfc.openSide(
                  PopupAddInstanceComponent,
                  [
                    'edit',
                    applyFor,
                    this.listSteps,
                    this.titleAction,
                    formMD,
                    this.listStepsCbx,
                    this.instanceNo,
                    (this.sumDaySteps = this.getSumDurationDayOfSteps(
                      this.listStepsCbx
                    )),
                  ],
                  option
                );
                dialogEditInstance.closed.subscribe((e) => {
                  if (e && e.event != null) {
                    //xu ly data đổ về
                    this.detectorRef.detectChanges();
                  }
                });
              });
          });
        });
      });
  }

  async genAutoNumberNo(funcID) {
    this.codxDpService
      .genAutoNumber(funcID, 'DP_Instances', 'InstanceNo')
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
    this.titleAction = e.text;
    this.moreFunc = e.functionID;
    switch (e.functionID) {
      case 'SYS03':
        this.edit(data, e.text);
        break;
      case 'SYS04':
        this.copy(data, e.text);
        break;
      case 'SYS02':
        this.delete(data);
        break;
      case 'DP09':
        // listStep by Id Instacess is null
        this.moveStage(e.data, data, this.lstStepInstances);
        break;
      case 'DP02':
        this.moveReason(e.data, data, !this.isMoveSuccess);
        break;
      case 'DP10':
        this.moveReason(e.data, data, this.isMoveSuccess);
        break;
    }
  }

  //#popup roles

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS005':
          case 'SYS003':
            if (data.status !== '1' && data.status !== '2') res.disabled = true;
            break;
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
          case 'DP011':
            res.disabled = true;
            break;
          //Chỉnh sửa, chuyển tiếp, thất bại, thành công
          case 'SYS103':
          case 'SYS03':
          case 'DP02':
          case 'DP09':
          case 'DP10':
            let isUpdate = data.write;
            if (!isUpdate || (data.status !== '1' && data.status !== '2'))
              res.disabled = true;
            break;
          //Copy
          case 'SYS104':
          case 'SYS04':
            let isCopy = this.isCreate ? true : false;
            if (!isCopy) res.disabled = true;
            break;
          //xóa
          case 'SYS102':
          case 'SYS02':
            let isDelete = data.delete;
            if (!isDelete) res.disabled = true;
            break;
        }
      });
    }
  }
  //End

  getPermissionProcess(id) {
    this.codxDpService.getProcess(this.process?.recID).subscribe((res) => {
      if (res) {
        if (res.permissions != null && res.permissions.length > 0) {
          this.lstParticipants = res.permissions.filter(
            (x) => x.roleType === 'P'
          );
        }
      }
    });
  }

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

  selectedChange(data: any) {
    this.dataSelected = data?.data ? data?.data : data;
    //formModel instances
    let formModel = new FormModel();
    formModel.formName = 'DPInstances';
    formModel.gridViewName = 'grvDPInstances';
    formModel.entityName = 'DP_Instances';
    this.formModel = formModel;
    this.detectorRef.detectChanges();
  }

  showInput(data) {}

  //begin code Thao
  dblClick(e, data) {}

  onActions(e) {
    switch (e.type) {
      case 'drop':
        this.dataDrop = e.data;
        this.stepIdClick = JSON.parse(JSON.stringify(this.dataDrop.stepID));
        // xử lý data chuyển công đoạn
        if (this.crrStepID != this.dataDrop.stepID)
          this.dropInstance(this.dataDrop);

        break;
      case 'drag':
        ///bắt data khi kéo
        this.crrStepID = e?.data?.stepID;

        break;
      case 'dbClick':
        //xư lý dbClick
        this.viewDetail(e.data.recID);
        break;
    }
  }

  viewDetail(recID) {
    //  this.detailViewInstance.GetStepsByInstanceIDAsync(recID)
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 999;
    let popup = this.callFunc.openForm(
      this.popDetail,
      '',
      Util.getViewPort().width,
      Util.getViewPort().height,
      '',
      null,
      '',
      option
    );
  }

  dropInstance(data) {
    if (this.moreFuncInstance?.length == 0) {
      data.stepID = this.crrStepID;
      this.changeDetectorRef.detectChanges();
      return;
    }
    data.stepID = this.crrStepID;
    if (
      this.kanban &&
      this.kanban.columns?.length > 0 &&
      this.dataColums.length == 0
    )
      this.dataColums = this.kanban.columns;
    if (this.dataColums.length > 0) {
      var idx = this.dataColums.findIndex(
        (x) => x.dataColums.recID == this.stepIdClick
      );
      if (idx != -1) {
        var stepCrr = this.dataColums[idx].dataColums;
        if (!stepCrr?.isSuccessStep && !stepCrr?.isFailStep) {
          idx = this.moreFuncInstance.findIndex((x) => x.functionID == 'DP09');
          if (idx != -1)
            this.moveStage(this.moreFuncInstance[idx], data, this.listSteps);
        } else {
          if (stepCrr?.isSuccessStep) {
            idx = this.moreFuncInstance.findIndex(
              (x) => x.functionID == 'DP10'
            );
            if (idx != -1)
              this.moveReason(this.moreFuncInstance[idx], data, true);
          } else {
            idx = this.moreFuncInstance.findIndex(
              (x) => x.functionID == 'DP02'
            );
            if (idx != -1)
              this.moveReason(this.moreFuncInstance[idx], data, false);
          }
        }
      } else {
        data.stepID = this.crrStepID;
        this.changeDetectorRef.detectChanges();
      }
    }
  }

  changeView(e) {
    if (e?.view.type == 6) {
      if (this.kanban) (this.view.currentView as any).kanban = this.kanban;
      else this.kanban = (this.view.currentView as any).kanban;

      this.changeDetectorRef.detectChanges();
    }
  }
  // end code

  #region;
  moveStage(dataMore, data, instanceStep) {
    if (!this.isClick) {
      return;
    }
    this.isClick = false;
    this.crrStepID = data.stepID;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    this.cache.functionList('DPT0402').subscribe((fun) => {
      this.cache.gridView(fun.gridViewName).subscribe((grv) => {
        this.cache
          .gridViewSetup(fun.formName, fun.gridViewName)
          .subscribe((grvSt) => {
            var formMD = new FormModel();
            formMD.funcID = fun.functionID;
            formMD.entityName = fun.entityName;
            formMD.formName = fun.formName;
            formMD.gridViewName = fun.gridViewName;
            debugger;
            var obj = {
              stepName: this.getStepNameById(data.stepID),
              formModel: formMD,
              instance: data,
              listStep: this.listStepsCbx,
              instanceStep: instanceStep,
              stepIdClick: this.stepIdClick,
            };
            var dialogMoveStage = this.callfc.openForm(
              PopupMoveStageComponent,
              '',
              800,
              600,
              '',
              obj
            );
            dialogMoveStage.closed.subscribe((e) => {
              this.isClick = true;
              if (!e || !e.event) {
                data.stepID = this.crrStepID;
                this.changeDetectorRef.detectChanges();
              }

              if (e && e.event != null) {
                //xu ly data đổ về
                data = e.event.instance;
                this.listStepInstances = e.event.listStep;
                if (e.event.isReason != null) {
                  this.moveReason(null, data, e.event.isReason);
                }
                this.dataSelected = data;
                this.detailViewInstance.dataSelect = this.dataSelected;
                this.detailViewInstance.instance = this.dataSelected;
                this.detailViewInstance.listSteps = this.listStepInstances;
                // debugger;
                // this.detailViewInstance.GetStepsByInstanceIDAsync(
                //   this.dataSelected.recID
                // );
                this.view.dataService.update(data).subscribe();
                this.detectorRef.detectChanges();
              }
            });
          });
      });
    });
  }

  moveReason(dataMore, data: any, isMoveSuccess: Boolean) {
    this.crrStepID = data.stepID;
    let option = new SidebarModel();
    option.DataService = this.view.dataService;
    option.FormModel = this.view.formModel;
    var functionID = isMoveSuccess ? 'DPT0403' : 'DPT0404';
    this.cache.functionList(functionID).subscribe((fun) => {
      this.cache.gridView(fun.gridViewName).subscribe((grv) => {
        this.cache
          .gridViewSetup(fun.formName, fun.gridViewName)
          .subscribe((grvSt) => {
            var formMD = new FormModel();
            formMD.funcID = fun.functionID;
            formMD.entityName = fun.entityName;
            formMD.formName = fun.formName;
            formMD.gridViewName = fun.gridViewName;
            let reason = isMoveSuccess
              ? this.listSteps[this.listSteps.length - 2]
              : this.listSteps[this.listSteps.length - 1];
            var obj = {
              dataMore: dataMore,
              headerTitle: fun.defaultName,
              stepName: this.getStepNameById(data.stepID),
              formModel: formMD,
              isReason: isMoveSuccess,
              instance: data,
              objReason: reason,
              listProccessCbx: this.listProccessCbx,
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
              if (!e || !e.event) {
                data.stepID = this.crrStepID;
                this.changeDetectorRef.detectChanges();
              }
              if (e && e.event != null) {
                //xu ly data đổ về
                data = e.event.instance;
                this.listStepInstances = e.event.listStep;
                if (e.event.isReason != null) {
                  this.moveReason(null, data, e.event.isReason);
                }
                this.dataSelected = data;
                this.detailViewInstance.dataSelect = this.dataSelected;
                // this.detailViewInstance.GetStepsByInstanceIDAsync(
                //   this.dataSelected.recID
                // );
                this.view.dataService.update(data).subscribe();
                this.detectorRef.detectChanges();
              }
            });
          });
      });
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
    opt.data = [itemSelected.recID];
    return true;
  }

  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }

  getStepNameById(stepId: string): string {
    // let listStep = JSON.parse(JSON.stringify(this.listStepsCbx))
    return this.listSteps
      .filter((x) => x.stepID === stepId)
      .map((x) => x.stepName)[0];
  }
  clickMoreFunc(e) {
    this.lstStepInstances = e.lstStepInstance;
    this.clickMF(e.e, e.data);
  }
  changeMF(e) {
    this.changeDataMF(e.e, e.data);
  }
  getListCbxProccess(applyFor: any) {
    this.cache.valueList('DP031').subscribe((data) => {
      this.codxDpService.getlistCbxProccess(applyFor).subscribe((res) => {
        this.listProccessCbx = res[0];
        var obj = {
          recID: this.guidEmpty,
          processName: data.datas[0].default,
        };
        this.listProccessCbx.unshift(obj);
      });
    });
  }

  getSumDurationDayOfSteps(listStepCbx: any) {
    let total = listStepCbx.reduce((sum, f) => sum + f.durationDay, 0);
    return total;
  }
  #endregion;
}
