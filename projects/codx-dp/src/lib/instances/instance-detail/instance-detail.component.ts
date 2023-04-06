import {
  DP_Steps,
  DP_Instances_Steps,
  DP_Instances,
} from './../../models/models';
import { CodxDpService } from './../../codx-dp.service';
import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ChangeDetectorRef,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  CRUDService,
  ApiHttpService,
  CacheService,
  CallFuncService,
  DialogModel,
  DialogRef,
} from 'codx-core';
import { PopupMoveStageComponent } from '../popup-move-stage/popup-move-stage.component';
import { InstancesComponent } from '../instances.component';
import { DomSanitizer } from '@angular/platform-browser';
import { ViewJobComponent } from '../../dynamic-process/popup-add-dynamic-process/step-task/view-step-task/view-step-task.component';

@Component({
  selector: 'codx-instance-detail',
  templateUrl: './instance-detail.component.html',
  styleUrls: ['./instance-detail.component.scss'],
})
export class InstanceDetailComponent implements OnInit {
  @Input() formModel: any;
  @Input() dataService: CRUDService;
  @Output() progressEvent = new EventEmitter<object>();
  @Output() moreFunctionEvent = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @Input() stepName: string;
  @Input() progress = '0';
  @Input() dataSelect: any;
  @Input() listStepsProcess: any;
  @Input() listCbxProccess: any;
  @Input() viewModelDetail = 'S';
  @ViewChild('viewDetailsItem') viewDetailsItem;
  @Input() viewType = 'd';
  @Input() listSteps: DP_Instances_Steps[] = []; //instanceStep
  @Input() tabInstances = [];
  @ViewChild('viewDetail') viewDetail;
  @Input() viewsCurrent = '';
  @Input() moreFunc: any;
  @Input() reloadData = false;
  @Input() stepStart: any;
  @Output() clickStartInstances = new EventEmitter<any>();
  id: any;
  totalInSteps: any;
  tmpTeps: DP_Instances_Steps;
  currentNameStep: Number;
  //progressbar
  labelStyle = { color: '#FFFFFF' };
  showProgressValue = true;
  animation = { enable: true, duration: 2000, delay: 0 };
  trackThickness: Number = 24;
  progressThickness: Number = 24;
  value: Number = 30;
  cornerRadius: Number = 30;
  idCbx = 'S';
  listStepInstance: any;
  instanceStatus: any;
  currentStep = 0;
  instance: any;
  listTypeTask = [];
  //gantchat
  ganttDs = [];
  ganttDsClone = [];
  dataColors = [];
  taskFields = {
    id: 'recID',
    name: 'name',
    startDate: 'startDate',
    endDate: 'endDate',
    type: 'type',
    color: 'color',
  };
  dialogPopupDetail: DialogRef;
  currentElmID: any;
  moreFuncCrr: any;

  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
    { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  titleDefault = '';

  isHiddenReason: boolean = false;

  instanceId: string;
  proccesNameMove: string;
  onwer: string;
  lstInv = '';
  stepValue = {};
  readonly strInstnace: string = 'instnace';
  readonly strInstnaceStep: string = 'instnaceStep';
  treeTask = [];
  isSaving = false;
  readonly guidEmpty: string = '00000000-0000-0000-0000-000000000000'; // for save BE
  isStart = false;

  constructor(
    private callfc: CallFuncService,
    private dpSv: CodxDpService,
    private api: ApiHttpService,
    private cache: CacheService,
    private changeDetec: ChangeDetectorRef,
    private callFC: CallFuncService,
    private popupInstances: InstancesComponent,
    public sanitizer: DomSanitizer
  ) {
    this.cache.functionList('DPT03').subscribe((fun) => {
      if (fun) this.titleDefault = fun.customName || fun.description;
    });
  }

  ngOnInit(): void {
    this.cache.valueList('DP035').subscribe((res) => {
      if (res.datas) {
        this.listTypeTask = res?.datas;
      }
    });
  }

  ngAfterViewInit(): void {
    this.rollHeight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSelect']) {
      if (changes['dataSelect'].currentValue?.recID != null) {
        this.id = changes['dataSelect'].currentValue.recID;
        this.dataSelect = changes['dataSelect'].currentValue;
        this.instanceStatus = this.dataSelect.status;
        this.GetStepsByInstanceIDAsync();
        this.getDataGanttChart(
          this.dataSelect.recID,
          this.dataSelect.processID
        );
      }
    } else if (changes['reloadData'] && this.reloadData) {
      this.instanceStatus = this.dataSelect.status;
      // if (this.moreFuncCrr)changes['dataSelect'].currentValue = this.dataSelect
      // this.viewDetail.ngOnChanges(changes)
      this.getStageByStep(this.listSteps);
      this.changeDetec.detectChanges();
    }
  }

  GetStepsByInstanceIDAsync() {
    var data = [this.id, this.dataSelect.processID, this.instanceStatus];
    this.dpSv.GetStepsByInstanceIDAsync(data).subscribe((res) => {
      if (res && res?.length > 0) {
        this.loadTree(res);
        this.listStepInstance = JSON.parse(JSON.stringify(res));
        this.listSteps = res;
        this.getStageByStep(this.listSteps);
      } else {
        this.listSteps = [];
        this.stepName = '';
        this.progress = '0';
        this.tmpTeps = null;
      }
      //  this.getListStepsStatus();
    });
  }

  getStageByStep(listSteps) {
    this.isStart =
      listSteps?.length > 0 && listSteps[0]['startDate'] ? true : false;
    var total = 0;
    for (var i = 0; i < listSteps.length; i++) {
      var stepNo = i;
      var data = listSteps[i];
      if (data.stepID == this.dataSelect.stepID) {
        this.lstInv = this.getInvolved(data.roles);
        this.stepName = data.stepName;
        this.currentStep = stepNo;
        this.currentNameStep = this.currentStep;
        this.tmpTeps = data;
        this.stepValue = {
          textColor: data.textColor,
          backgroundColor: data.backgroundColor,
          icon: data.icon,
          iconColor: data.iconColor,
        };
      }
      total += data.progress;
      stepNo = i + 1;
    }
    if (listSteps != null && listSteps.length - 2 > 0) {
      this.progress = (total / (listSteps.length - 2)).toFixed(1).toString();
    } else {
      this.progress = '0';
    }
    this.currentStep = listSteps.findIndex((x) => x.stepStatus === '1');
    this.checkCompletedInstance(this.instanceStatus);
  }

  getInvolved(roles) {
    var id = '';
    if (roles != null && roles.length > 0) {
      var lstRole = roles.filter((x) => x.roleType == 'R');
      lstRole.forEach((element) => {
        if (!id.split(';').includes(element.objectID)) {
          id = id + ';' + element.objectID;
        }
      });
    }
    return id;
  }

  sortListSteps(ins, process) {
    var listStep = process.steps.sort(function (x, y) {
      return x.stepNo > 0 && y.stepNo > 0
        ? x.stepNo - y.stepNo
        : x.stepNo > 0
        ? -1
        : y.stepNo > 0
        ? 1
        : x.stepNo - y.stepNo;
    });
    ins = listStep
      .reduce((result, x) => {
        let matches = ins.filter((y) => x.recID === y.stepID);
        if (matches.length) {
          result.push(matches[0]);
        }
        return result;
      }, [])
      .sort((x, y) => {
        let firstStep = listStep.find((z) => z.recID === y.stepID);
        return listStep.indexOf(firstStep);
      });

    return ins;
  }

  // getStepsByProcessID(recID){
  //   this.dpSv.getStepsByProcessID(recID).subscribe((res) => {
  //     if (res != null || res.length > 0) {
  //       this.listSteps = res;
  //     }
  //   });
  // }

  cbxChange(e) {
    this.viewModelDetail = e?.data;
  }

  clickMF(e, data) {
    this.moreFunctionEvent.emit({
      e: e,
      data: data,
      lstStepCbx: this.listStepInstance,
    });
    // console.log(e);
    // switch (e.functionID) {
    //   case 'DP09':
    //   // API của bảo nha
    //  //   this.continues(data);
    //     this.popupInstances.moveStage(e,data,this.listSteps);
    //     break;
    //   case 'DP02':
    //     this
    //     break;
    // }
  }

  changeDataMF(e, data) {
    if (this.viewsCurrent == 'k-')
      this.moreFuncCrr = JSON.parse(JSON.stringify(e));
    this.changeMF.emit({
      e: e,
      data: data,
      listStepCbx: this.listSteps,
      isStart: this.isStart,
    });
    // console.log(e);
    // if (e) {
    //   e.forEach((element) => {
    //     if (
    //       element.functionID == 'SYS002' ||
    //       element.functionID == 'SYS001' ||
    //       element.functionID == 'SYS004' ||
    //       element.functionID == 'SYS003' ||
    //       element.functionID == 'SYS005'
    //     )
    //       element.disabled = true;
    //   });
    // }
  }

  click(indexNo, data) {
    if (
      this.currentStep < indexNo &&
      (this.instanceStatus === '1' || this.instanceStatus === '2')
    )
      return;
    this.currentNameStep = indexNo;
    var indx = this.listSteps.findIndex((x) => x.stepID == data);
    this.tmpTeps = this.listSteps[indx];
    this.lstInv = this.getInvolved(this.tmpTeps.roles);
    this.onwer = this.tmpTeps?.owner; // nhớ cho phép null cái
  }

  // continues(data) {
  //   if (this.currentStep + 1 == this.listSteps.length) return;
  //   this.dpSv.GetStepsByInstanceIDAsync(data.recID).subscribe(res =>{
  //     res.forEach((element) => {
  //       if (element != null && element.recID == this.dataSelect.stepID) {
  //         this.tmpTeps = element;
  //       }
  //     })
  //   })
  //   this.currentStep++;
  //   this.currentNameStep = this.currentStep;
  //   this.changeDetec.detectChanges();
  // }

  setHTMLCssStages(oldStage, newStage) {}

  //ganttchar
  getDataGanttChart(instanceID, processID) {
    this.api
      .exec<any>('DP', 'InstanceStepsBusiness', 'GetDataGanntChartAsync', [
        instanceID,
        processID,
      ])
      .subscribe((res) => {
        if (res && res?.length > 0) {
          this.ganttDs = res;
          this.ganttDsClone = JSON.parse(JSON.stringify(this.ganttDs));
          let test = this.ganttDsClone.map((i) => {
            return {
              name: i.name,
              start: i.startDate,
              end: i.endDate,
            };
          });
          console.log('thuan', test);

          this.changeDetec.detectChanges();
        }
      });
  }
  getColor(recID) {
    var idx = this.ganttDs.findIndex((x) => x.recID == recID);
    return this.ganttDs[idx]?.color;
  }
  //end ganttchar

  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }

  checkCompletedInstance(instanceStatus: any) {
    if (instanceStatus === '1' || instanceStatus === '2') {
      this.deleteListReason(this.listSteps);
    }
  }

  getbackgroundColor(step) {
    return step?.backgroundColor
      ? '--primary-color:' + step?.backgroundColor
      : '--primary-color: #23468c';
  }

  getColorStepName(status: string) {
    if (status === '1') {
      return 'step current';
    } else if (
      status === '3' ||
      status === '4' ||
      status === '5' ||
      status === '' ||
      status === null
    ) {
      return 'step old';
    }
    return 'step';
  }

  getReasonByStepId(stepId: string) {
    var idx = this.listSteps.findIndex((x) => x.stepID === stepId);
    return this.listSteps[idx];
  }
  getStepNameIsComlepte(data) {
    var idx = this.listSteps.findIndex(
      (x) => x.stepStatus === '4' || x.stepStatus === '5'
    );
    if (idx > -1) {
      var reasonStep = this.listSteps[idx];
      var indexProccess = this.listCbxProccess.findIndex(
        (x) => x.recID === data?.refID
      );
      if (indexProccess <= -1) {
        var indexProccess = this.listCbxProccess.findIndex(
          (x) => x.recID === this.guidEmpty
        );
      }
      var proccesMove = this.listCbxProccess[indexProccess];
      this.proccesNameMove = proccesMove?.processName;
    }
    return reasonStep?.stepName ?? '';
  }

  clickDetailGanchart(recID) {
    let data = this.ganttDsClone?.find((item) => item.recID === recID);
    if (data) {
      this.callfc.openForm(ViewJobComponent, '', 800, 550, '', {
        value: data,
        listValue: this.ganttDsClone,
      });
    }
  }

  rollHeight() {
    let classViewDetail: any;
    var heighOut = 25;
    if (this.viewType == 'd') {
      classViewDetail = document.getElementsByClassName('codx-detail-main')[0];
    }
    if (!classViewDetail) return;
    let heightVD = classViewDetail.clientHeight;
    let classHeader = document.getElementsByClassName('codx-detail-header')[0];
    let heightHD = classHeader.clientHeight;
    let classFooter = document.getElementsByClassName('codx-detail-footer')[0];
    let heightFT = classFooter.clientHeight;

    var maxHeight = heightVD - heightHD - heightFT - heighOut;
    var div = document.getElementById('viewModeDetail');
    if (div) {
      div.style.setProperty('max-height', maxHeight + 'px', 'important');
    }
  }
  loadTree(listStep) {
    var listRefTask = [];
    listStep.forEach((obj) => {
      if (obj.tasks?.length > 0) {
        var arr = obj.tasks.map((x) => x.recID);
        listRefTask = listRefTask.concat(arr);
      }
    });
    if (listRefTask?.length > 0) {
      this.dpSv.getTree(JSON.stringify(listRefTask)).subscribe((res) => {
        if (res) this.treeTask = res;
      });
    }
  }
  saveAssign(e) {
    if (e) {
      this.loadTree(this.listSteps);
      this.GetStepsByInstanceIDAsync();
    }
  }
  showColumnControl(stepID) {
    if (this.listStepsProcess?.length > 0) {
      var idx = this.listStepsProcess.findIndex((x) => x.recID == stepID);
      if (idx == -1) return 1;
      return this.listStepsProcess[idx]?.showColumnControl;
    }
    return 1;
  }

  inputElmIDCustomField(e) {
    this.currentElmID = e;
  }
  actionSaveCustomField(e) {
    this.isSaving = e;
  }
  clickMenu(e) {
    this.viewModelDetail = e;
    this.isSaving = false;
    this.currentElmID = null;
  }

  startInstances() {
    this.clickStartInstances.emit(true);
  }
}
