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
import { CRUDService, ApiHttpService, CacheService } from 'codx-core';
import { PopupMoveStageComponent } from '../popup-move-stage/popup-move-stage.component';
import { InstancesComponent } from '../instances.component';
import { log } from 'console';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'codx-instance-detail',
  templateUrl: './instance-detail.component.html',
  styleUrls: ['./instance-detail.component.scss'],
})
export class InstanceDetailComponent implements OnInit {
  @Input() formModel: any;
  @Input() dataService: CRUDService;
  @Input() recID: any;
  @Output() progressEvent = new EventEmitter<object>();
  @Output() moreFunctionEvent = new EventEmitter<any>();
  @Output() changeMF = new EventEmitter<any>();
  @Input() stepName: string;
  @Input() progress = '0';
  @Input() dataSelect: any;
  @Input() listStepNew: any;
  @Input() listCbxProccess: any;
  @Input() viewModelDetail = 'S';
  id: any;
  totalInSteps: any;
  @Input() listSteps: DP_Instances_Steps[] = [];
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
  listStepUpdate:any;
  instanceStatus: any;
  currentStep = 0;
  instance:any;
  //gantchat
  ganttDs = [];
  dataColors = [];
  taskFields = {
    id: 'recID',
    name: 'name',
    startDate: 'startDate',
    endDate: 'endDate',
    type: 'type',
    color:'color'
  };

  tabControl = [
    { name: 'History', textDefault: 'Lịch sử', isActive: true },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Attachment', textDefault: 'Đính kèm', isActive: false },
    { name: 'References', textDefault: 'Liên kết', isActive: false },
    { name: 'Tasks', textDefault: 'Công việc', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  titleDefault ='';

  isHiddenReason: boolean = false;

  instanceId:string;
  proccesNameMove: string;
  onwer:string;
  readonly strInstnace: string = 'instnace';
  readonly strInstnaceStep: string = 'instnaceStep';

  constructor(
    private dpSv: CodxDpService,
    private api: ApiHttpService,
    private cache: CacheService,
    private changeDetec: ChangeDetectorRef,
    private popupInstances: InstancesComponent,
    public sanitizer: DomSanitizer,
  ) {
    this.cache.functionList('DPT03').subscribe((fun) => {
      if (fun) this.titleDefault = fun.customName || fun.description;
    });
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    //Add 'implements AfterViewInit' to the class.
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    // if (changes['recID']) {
    //   if (changes['recID'].currentValue == this.id) return;
    //   this.id = changes['recID'].currentValue;
    //   this.getInstanceByRecID(this.id);
    //   this.getStepsByInstanceID(this.id);
    // }
    if (changes['dataSelect']) {
      this.id = changes['dataSelect'].currentValue.recID;
      this.dataSelect = changes['dataSelect'].currentValue;
      // this.currentStep = this.dataSelect.currentStep; // curenSteps da xoa
      // this.currentStep = 
      this.instanceStatus = this.dataSelect.status;
      this.instance = this.dataSelect;
     this.GetStepsByInstanceIDAsync(this.id);
     // this.GetStepsByInstanceIDAsync(changes['dataSelect'].currentValue.steps);
      this.getDataGanttChart(this.recID);
    }
    console.log(this.formModel);
  }

  GetStepsByInstanceIDAsync(insID){
    // var data = [insID,proccessID];
       var data = [insID];
     this.dpSv.GetStepsByInstanceIDAsync(data).subscribe((res) => {
       if (res) {
        this.listSteps = res;
        this.getListStepsStatus();
        var total = 0;
        for (var i = 0; i < this.listSteps.length; i++) {
          var stepNo = i;
          var data = this.listSteps[i];
          if (data.stepID == this.dataSelect.stepID) {
            this.stepName = data.stepName;
            this.currentStep = stepNo;
            this.currentNameStep = this.currentStep;
            this.tmpTeps = data;
          }
          total += data.progress;
          stepNo = i + 1;
        }
        if (this.listSteps != null && this.listSteps.length > 0) {
          this.progress = (total / this.listSteps.length).toFixed(1).toString();
        } else {
          this.progress = '0';
        }

      } else {
        this.listSteps = [];
        this.stepName = '';
        this.progress = '0';
        this.tmpTeps = null;
       }
    //  this.getListStepsStatus();
    });
  }

  getStepsByInstanceID(list) {
    list.forEach((element) => {
      if (element.indexNo == this.currentStep) {
        this.tmpTeps = element;
      }
    });
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
    this.moreFunctionEvent.emit({e: e, data: data, lstStepCbx: this.listStepNew, lstStepInstance: this.listSteps});
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
    this.changeMF.emit({e: e, data: data, listStepCbx: this.listStepNew})
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
    // if (this.currentStep < indexNo) return;
    // this.currentNameStep = indexNo;
    var indx = this.listSteps.findIndex(x=>x.stepID == data);
    this.tmpTeps =  this.listSteps[indx];
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
  getDataGanttChart(instanceID) {
    this.api
      .exec<any>(
        'DP',
        'InstanceStepsBusiness',
        'GetDataGanntChartAsync',
        instanceID
      )
      .subscribe((res) => {
        if (res && res?.length > 0) {
          this.ganttDs = res;
          this.changeDetec.detectChanges();
        }
      });
  }
  getColor(recID){
    var idx =  this.ganttDs.findIndex(x=>x.recID==recID) ;
    return  this.ganttDs[idx]?.color
  }
 //end ganttchar

  handleListStep(listStepNew:any, listStep:any){
  const mapList = new Map(listStep.map(item => [item.stepID, item.stepStatus]));

  var updatedArray = listStepNew.map(item => ({
    ...item,
    stepStatus: mapList.get(item.stepID) || item.stepStatus || ''
  }));
    let list =  updatedArray.map(x=> {return {stepID: x.stepID, stepName: x.stepName, stepStatus: x.stepStatus}});
  return list;
  }
  deleteListReason(listStep: any): void {
    listStep.pop();
    listStep.pop();
  }

  getListStepsStatus(){
    let listStepHandle = JSON.parse(JSON.stringify(this.listStepNew));
    this.listStepUpdate = this.handleListStep(listStepHandle,this.listSteps);
    this.checkCompletedInstance(this.instanceStatus);
   }
   checkCompletedInstance(instanceStatus:any){
    if(instanceStatus === '3' ||  instanceStatus === '4' ) {
      this.listStepUpdate.pop();
    }
    else if (instanceStatus === '5' ||  instanceStatus === '6' ) {
      this.listStepUpdate.splice(this.listStepUpdate.length -2 , 1);
    }
    else {
      this.deleteListReason(this.listStepUpdate);
    }
   }

   getColorStepName(status: string){
    if(status === '1'){
      return 'step current';
    }
    else if(status === '3' || status === '4' || status === '5' ||  status === '' ||status === null) {
      return 'step old';
    }
    return 'step';
   // item?.stepStatus === '1' ? 'step current':  item?.stepStatus === '3' || item?.stepStatus === '4' || item?.stepStatus === '5' ||  item?.stepStatus === '' ||item?.stepStatus === null ? 'step old': 'step' "
   }
   getReasonByStepId(stepId:string){
    var idx =  this.listStepNew.findIndex(x=>x.stepID === stepId) ;
    return  this.listStepNew[idx];
   }
   getStepNameIsComlepte(){
    var idx =  this.listSteps.findIndex(x=> x.stepStatus === '4' || x.stepStatus === '5');
    if(idx > -1) {
      var reasonStep = this.listSteps[idx];
      var idxProccess =  this.listCbxProccess.findIndex(x=> x.recID === this.instance?.newProcessID);
      var proccesMove = this.listCbxProccess[idxProccess];
      this.proccesNameMove = proccesMove?.processName ?? ''

    }
    return  reasonStep?.stepName?? '';
   }
  //  getProccessNameIsMove(index:any){

  //   return  this.listSteps[idx]?.stepName ?? '';
  //  }

}
