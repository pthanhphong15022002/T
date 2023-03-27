import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnInit,
  Optional,
  Output,
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
  NotificationsService,
  DataRequest,
  AlertConfirmInputConfig,
  PageTitleService,
  LayoutService,
} from 'codx-core';
import { ES_SignFile } from 'projects/codx-es/src/lib/codx-es.model';
import { PopupAddSignFileComponent } from 'projects/codx-es/src/lib/sign-file/popup-add-sign-file/popup-add-sign-file.component';
import { CodxExportComponent } from 'projects/codx-share/src/lib/components/codx-export/codx-export.component';
import { firstValueFrom } from 'rxjs';
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
  // @Input() process: any;
  @Input() isCreate: boolean = true;
  // @Input() tabInstances = [];
  @ViewChild('templateDetail', { static: true })
  templateDetail: TemplateRef<any>;
  @ViewChild('itemTemplate', { static: true })
  itemTemplate: TemplateRef<any>;
  @ViewChild('detailViewInstance')
  detailViewInstance: InstanceDetailComponent;
  @ViewChild('cardKanban') cardKanban!: TemplateRef<any>;
  @ViewChild('viewColumKaban') viewColumKaban!: TemplateRef<any>;
  @ViewChild('popDetail') popDetail: TemplateRef<any>;
  @Output() valueListID = new EventEmitter<any>();
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
  isUseSuccess: boolean = true;
  isUseFail: boolean = true;
  stepIdClick = '';
  listProccessCbx: any;
  sumDaySteps: number;
  lstParticipants = [];
  oldIdInstance: any;
  viewMode: any;
  viewModeDetail = 'S';
  totalInstance: number = 0;
  itemSelected: any;
  stepSuccess: any;
  stepFail: any;
  viewType = 'd';
  autoName: string = '';
  processID = '';
  //bien chuyen page
  process: any;
  tabInstances = [];
  continueLoad = false;
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE

  constructor(
    private inject: Injector,
    private callFunc: CallFuncService,
    private codxDpService: CodxDpService,
    private changeDetectorRef: ChangeDetectorRef,
    private noti: NotificationsService,
    private pageTitle: PageTitleService,
    private layout: LayoutService,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) {
    super(inject);
    this.dialog = dialog;
    //thao tesst
    this.router.params.subscribe((param) => {
      this.funcID = param['funcID'];
      this.processID = param['processID'];
      //tam thoi làm vậy đã
      this.codxDpService.dataProcess.subscribe((res) => {
        if (res && res.read) {
          this.process = res;
          this.isCreate = this.process.create;
          this.continueLoad = true;
        } else {
          this.continueLoad = false;
          this.codxService.navigate('', `dp/dynamicprocess/DP0101`);
        }
      });
      // let dataProcess = await firstValueFrom(this.codxDpService.getProcessByProcessID(this.processID));
      // if (!dataProcess || !dataProcess?.read) {
      //
    });

    if (this.continueLoad) {
      this.cache.valueList('DP034').subscribe((res) => {
        if (res && res.datas) {
          var tabIns = [];
          res.datas.forEach((element) => {
            var tab = {};
            tab['viewModelDetail'] = element?.value;
            tab['textDefault'] = element?.text;
            tab['icon'] = element?.icon;
            tabIns.push(tab);
          });
          this.tabInstances = tabIns;
        }
      });
      this.layout.setUrl('dp/dynamicprocess/DP0101');
      this.layout.setLogo(null);

      this.cache.functionList(this.funcID).subscribe((f) => {
        if (f) this.pageTitle.setSubTitle(f?.customName);
        this.cache.moreFunction(f.formName, f.gridViewName).subscribe((res) => {
          if (res && res.length > 0) {
            this.moreFuncInstance = res;
          }
        });
      });
      //  this.process = dt?.data?.data;
      this.autoName = this.process?.autoName;
      this.stepSuccess = this.process?.steps?.filter((x) => x.isSuccessStep)[0];
      this.stepFail = this.process?.steps?.filter((x) => x.isFailStep)[0];
      this.isUseSuccess = this.stepSuccess?.isUsed;
      this.isUseFail = this.stepFail?.isUsed;
      this.showButtonAdd = this.isCreate;
    }
  }
  ngAfterViewInit(): void {
    if (!this.continueLoad) return;
    this.viewMode = this.process?.viewMode ?? 6; //dang lỗi nên gán cứng
    this.viewModeDetail = this.process?.viewModeDetail ?? 'S';
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
  onInit() {
    if (!this.continueLoad) return;
    this.button = {
      id: 'btnAdd',
    };
    this.dataObj = {
      // processID: this.process?.recID ? this.process?.recID : '',
      processID: this.processID,
      showInstanceControl: this.process?.showInstanceControl
        ? this.process?.showInstanceControl
        : '2',
      hiddenInstanceReason: this.getListStatusInstance(
        this.isUseSuccess,
        this.isUseFail
      ),
    };

    // if(this.process.steps != null && this.process.steps.length > 0){
    //   this.listSteps = this.process.steps;
    //   this.listStepsCbx = JSON.parse(JSON.stringify(this.listSteps));
    //   this.deleteListReason(this.listStepsCbx);
    //   this.getSumDurationDayOfSteps(this.listStepsCbx);
    // }

    this.codxDpService
      .createListInstancesStepsByProcess(this.process?.recID)
      .subscribe((dt) => {
        if (dt && dt?.length > 0) {
          this.listSteps = dt;
          this.listStepsCbx = JSON.parse(JSON.stringify(this.listSteps));
      //    this.deleteListReason(this.listStepsCbx);
          this.getSumDurationDayOfSteps(this.listStepsCbx);
        }
      });
    this.getPermissionProcess(this.processID);
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
    this.resourceKanban.className = 'ProcessesBusiness';
    this.resourceKanban.method = 'GetColumnsKanbanAsync';
    this.resourceKanban.dataObj = this.dataObj;
    this.getListCbxProccess(this.process?.applyFor);
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
              option.Width = '800px';
              option.zIndex = 1001;
              this.view.dataService.dataSelected.processID = this.process.recID;
              if (!this.process.instanceNoSetting) {
                this.codxDpService
                  .genAutoNumber(this.funcID, 'DP_Instances', 'InstanceNo')
                  .subscribe((res) => {
                    if (res) {
                      this.view.dataService.dataSelected.instanceNo = res;
                      this.openPopUpAdd(applyFor, formMD, option, 'add');
                    }
                  });
              } else
                this.codxDpService
                  .getAutoNumberByInstanceNoSetting(
                    this.process.instanceNoSetting
                  )
                  .subscribe((isNo) => {
                    if (isNo) {
                      this.view.dataService.dataSelected.instanceNo = isNo;
                      this.openPopUpAdd(applyFor, formMD, option, 'add');
                    }
                  });
            });
        });
      });
    });
  }
  copy(data, titleAction) {
    if (data) {
      this.view.dataService.dataSelected = JSON.parse(JSON.stringify(data));
      this.oldIdInstance = data.recID;
    }
    this.view.dataService
      .copy(this.view.dataService.dataSelected)
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
                this.codxDpService
                  .GetStepsByInstanceIDAsync([data.recID, data.processID])
                  .subscribe((res) => {
                    if (res && res?.length > 0) {
                      this.listStepInstances = JSON.parse(JSON.stringify(res));
                      var formMD = new FormModel();
                      formMD.funcID = funcIDApplyFor;
                      formMD.entityName = fun.entityName;
                      formMD.formName = fun.formName;
                      formMD.gridViewName = fun.gridViewName;
                      option.Width = '800px';
                      option.zIndex = 1001;
                      if (!this.process.instanceNoSetting) {
                        this.codxDpService
                          .genAutoNumber(
                            this.funcID,
                            'DP_Instances',
                            'InstanceNo'
                          )
                          .subscribe((res) => {
                            if (res) {
                              this.view.dataService.dataSelected.instanceNo =
                                res;
                              this.openPopUpAdd(
                                applyFor,
                                formMD,
                                option,
                                titleAction
                              );
                            }
                          });
                      } else {
                        this.codxDpService
                          .getAutoNumberByInstanceNoSetting(
                            this.process.instanceNoSetting
                          )
                          .subscribe((isNo) => {
                            if (isNo) {
                              this.view.dataService.dataSelected.instanceNo =
                                isNo;
                              this.openPopUpAdd(
                                applyFor,
                                formMD,
                                option,
                                titleAction
                              );
                            }
                          });
                      }
                    }
                  });
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
        'add' ? this.listSteps : this.listStepInstances,
        this.titleAction,
        formMD,
        this.listStepsCbx,
        (this.sumDaySteps = this.getSumDurationDayOfSteps(this.listStepsCbx)),
        this.lstParticipants,
        this.oldIdInstance,
        this.autoName,
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
      // var ojb = {
      //   totalInstance: 100
      // };
      // this.dialog.close(ojb);
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
                this.codxDpService
                  .GetStepsByInstanceIDAsync([data.recID, data.processID])
                  .subscribe((res) => {
                    if (res && res?.length > 0) {
                      this.listStepInstances = JSON.parse(JSON.stringify(res));
                      var formMD = new FormModel();
                      formMD.funcID = funcIDApplyFor;
                      formMD.entityName = fun.entityName;
                      formMD.formName = fun.formName;
                      formMD.gridViewName = fun.gridViewName;

                      option.Width = '800px';
                      option.zIndex = 1001;
                      this.view.dataService.dataSelected.processID =
                        this.process.recID;
                      var dialogEditInstance = this.callfc.openSide(
                        PopupAddInstanceComponent,
                        [
                          'edit',
                          applyFor,
                          this.listStepInstances,
                          this.titleAction,
                          formMD,
                          this.listStepsCbx,
                          (this.sumDaySteps = this.getSumDurationDayOfSteps(
                            this.listStepsCbx
                          )),
                          this.autoName,
                        ],
                        option
                      );
                      dialogEditInstance.closed.subscribe((e) => {
                        if (e && e.event != null) {
                          //xu ly data đổ về
                          this.detectorRef.detectChanges();
                        }
                      });
                    }
                  });
              });
          });
        });
      });
  }

  //End

  //Event
  clickMF(e, data?) {
    this.dataSelected = data;
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
      //Đóng nhiệm vụ = true;
      case 'DP14':
        this.openOrClosed(data, true);
        break;
      //Mở nhiệm vụ = false;
      case 'DP15':
        this.openOrClosed(data, false);
        break;
      //export File
      case 'DP16':
        this.exportFile();
        break;
      //trinh kí File
      case 'DP17':
        this.approvalTrans('tes1', 'test2');
        break;
    }
  }

  openOrClosed(data, check) {
    if (this.process.showInstanceControl === '1') {
      this.noti
        .alertCode('DP018', null, "'" + this.titleAction + "'")
        .subscribe((info) => {
          if (info.event.status == 'Y') {
            this.codxDpService
              .openOrClosedInstance(data.recID, check)
              .subscribe((res) => {
                if (res) {
                  this.dataSelected.closed = check;
                  this.noti.notifyCode(check ? 'DP016' : 'DP017');
                  this.view.dataService.update(this.dataSelected).subscribe();
                }
              });
          }
        });
    } else if (
      this.process.showInstanceControl === '0' ||
      this.process.showInstanceControl === '2'
    ) {
      this.view.dataService.dataSelected = data;

      this.noti
        .alertCode('DP018', null, "'" + this.titleAction + "'")
        .subscribe((info) => {
          if (info.event.status == 'Y') {
            this.codxDpService
              .openOrClosedInstance(data.recID, check)
              .subscribe((res) => {
                if (res) {
                  this.dataSelected.closed = check;
                  this.noti.notifyCode(check ? 'DP016' : 'DP017');
                  this.view.dataService.remove(this.dataSelected).subscribe();
                  this.detectorRef.detectChanges();
                }
              });
          }
        });
    }
    this.changeDetectorRef.detectChanges();
  }

  beforeClosed(opt: RequestOption, check) {
    var itemSelected = opt.data[0];
    opt.methodName = 'OpenOrClosedInstanceAsync';
    opt.data = [itemSelected.recID, check];
    return true;
  }

  //#popup roles

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'SYS003':
            if ((data.status !== '1' && data.status !== '2') || data.closed)
              res.disabled = true;
            break;
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
          //more core - thay doi nhieu dong, bo chon, chon tat ca..
          case 'SYS005':
          case 'SYS007':
          case 'SYS006':
            res.disabled = true;
            break;
          //Chỉnh sửa, chuyển tiếp, thất bại, thành công
          case 'SYS103':
          case 'SYS03':
          case 'DP09':
            let isUpdate = data.write;
            if (
              !isUpdate ||
              (data.status !== '1' && data.status !== '2') ||
              data.closed
            )
              res.disabled = true;
            break;
          //Copy
          case 'SYS104':
          case 'SYS04':
            let isCopy = this.isCreate ? true : false;
            if (!isCopy || data.closed) res.disabled = true;
            break;
          //xóa
          case 'SYS102':
          case 'SYS02':
            let isDelete = data.delete;
            if (!isDelete || data.closed) res.disabled = true;
            break;
          //Đóng nhiệm vụ = true
          case 'DP14':
            if (data.closed) res.disabled = true;
            break;
          //Mở nhiệm vụ = false
          case 'DP15':
            if (!data.closed) res.disabled = true;
            break;
          case 'DP02':
            let isUpdateFail = data.write;
            if (
              !isUpdateFail ||
              (data.status !== '1' && data.status !== '2') ||
              data.closed ||
              !this.isUseFail
            ) {
              res.disabled = true;
            }

            break;
          case 'DP10':
            let isUpdateSuccess = data.write;
            if (
              !isUpdateSuccess ||
              (data.status !== '1' && data.status !== '2') ||
              data.closed ||
              !this.isUseSuccess
            ) {
              res.disabled = true;
            }
            break;
        }
      });
    }
  }
  //End

  getPermissionProcess(id) {
    this.codxDpService.getProcess(id).subscribe((res) => {
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
        this.viewDetail(e.data);
        break;
    }
  }

  viewDetail(data) {
    this.dataSelected = data;
    let option = new DialogModel();
    option.IsFull = true;
    option.zIndex = 999;
    this.viewType = 'p';
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
    popup.closed.subscribe((e) => {
      this.viewType = 'd';
    });
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
  moveStage(dataMore, data, listStepCbx) {
    if (!this.isClick) {
      return;
    }
    if (listStepCbx.length == 0 || listStepCbx == null) {
      listStepCbx = this.listSteps;
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
            var stepReason = {
              isUseFail: this.isUseFail,
              isUseSuccess: this.isUseSuccess,
            };
            var obj = {
              stepName: this.getStepNameById(data.stepID),
              formModel: formMD,
              instance: data,
              listStepCbx: listStepCbx,
              stepIdClick: this.stepIdClick,
              stepReason: stepReason,
              headerTitle: dataMore.defaultName,
              listStepProccess: this.process.steps
            };
            var dialogMoveStage = this.callfc.openForm(
              PopupMoveStageComponent,
              '',
              850,
              900,
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
                this.view.dataService.update(data).subscribe();
                if (this.kanban) this.kanban.updateCard(data);
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
            let reason = isMoveSuccess ? this.stepSuccess : this.stepFail;
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
                if (data.refID !== this.guidEmpty) {
                  this.valueListID.emit(data.refID);
                }
                if (e.event.isReason != null) {
                  this.moveReason(null, data, e.event.isReason);
                }
                this.dataSelected = data;
                this.detailViewInstance.dataSelect = this.dataSelected;
                this.view.dataService.update(data).subscribe();
                if (this.kanban) this.kanban.updateCard(data);
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

  // deleteListReason(listStep: any): void {
  //   listStep.pop();
  //   listStep.pop();
  // }

  getStepNameById(stepId: string): string {
    // let listStep = JSON.parse(JSON.stringify(this.listStepsCbx))
    return this.listSteps
      .filter((x) => x.stepID === stepId)
      .map((x) => x.stepName)[0];
  }
  clickMoreFunc(e) {
    this.lstStepInstances = e.lstStepCbx;
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
        this.listProccessCbx = this.listProccessCbx.filter(
          (x) => x !== this.process.recID
        );
      });
    });
  }

  getSumDurationDayOfSteps(listStepCbx: any) {
   let total = listStepCbx.filter(x=> !x.isSuccessStep && !x.isFailStep)
   .reduce((sum, f) => sum + f?.durationDay + f?.durationHour + this.setTimeHoliday(f?.excludeDayoff), 0);
    return total;
  }
  setTimeHoliday(dayOffs: string): number {
    let listDays= dayOffs.split(';');
    return listDays.length
}

  getListStatusInstance(isSuccess: boolean, isFail: boolean) {
    if (!isSuccess && !isFail) {
      return '1;2';
    } else if (!isSuccess) {
      return '3;4';
    } else if (!isFail) {
      return '5;6';
    }
    return '';
  }
  #endregion;

  //Export file
  exportFile() {
    var gridModel = new DataRequest();
    gridModel.formName = this.view.formModel.formName;
    gridModel.entityName = this.view.formModel.entityName;
    gridModel.funcID = this.view.formModel.funcID;
    gridModel.gridViewName = this.view.formModel.gridViewName;
    gridModel.page = this.view.dataService.request.page;
    gridModel.pageSize = this.view.dataService.request.pageSize;
    gridModel.predicate = this.view.dataService.request.predicates;
    gridModel.dataValue = this.view.dataService.request.dataValues;
    gridModel.entityPermission = this.view.formModel.entityPer;
    //
    this.callfc.openForm(
      CodxExportComponent,
      null,
      null,
      800,
      '',
      [gridModel, this.dataSelected.recID],
      null
    );
  }
  //Xét duyệt
  approvalTrans(processID: any, datas: any) {
    // this.api
    //   .execSv(
    //     'ES',
    //     'ES',
    //     'ApprovalTransBusiness',
    //     'GetCategoryByProcessIDAsync',
    //     processID
    //   )
    //   .subscribe((res2: any) => {
    // let dialogModel = new DialogModel();
    // dialogModel.IsFull = true;
    // dialogModel.zIndex=1010 ;
    //trình ký
    //  if (res2?.eSign == true) {
    //let signFile = new ES_SignFile();
    // signFile.recID = datas.recID;
    //  signFile.title = datas.title;
    // signFile.categoryID = res2?.categoryID;
    //signFile.refId = datas.recID;
    // signFile.refDate = datas.refDate;
    //signFile.refNo = datas.refNo;
    //signFile.priority = datas.urgency;
    // signFile.refType = this.formModel?.entityName;
    //signFile.files = [];
    // if (this.data?.files) {
    //   for (var i = 0; i < this.data?.files.length; i++) {
    //     var file = new File();
    //     file.fileID = this.data?.files[i].recID;
    //     file.fileName = this.data?.files[i].fileName;
    //     file.eSign = true;
    //     signFile.files.push(file);
    //   }
    // }
    // let dialogApprove = this.callfc.openForm(
    //   PopupAddSignFileComponent,
    //   'Chỉnh sửa',
    //   700,
    //   650,
    //   '',
    //   {
    //     oSignFile: signFile,
    //     // files: this.data?.files,
    //     //  cbxCategory: this.gridViewSetup['CategoryID']?.referedValue,
    //     disableCateID: true,
    //     formModel: this.view?.currentView?.formModel,
    //   },
    //   '',
    //   dialogModel
    // );
    // dialogApprove.closed.subscribe((res) => {
    //   if (res.event && res.event?.approved == true) {
    //   }
    // });
    //this.callfunc.openForm();
    // } else if (res2?.eSign == false) {
    // }
    //xét duyệt
    // });
  }
}
