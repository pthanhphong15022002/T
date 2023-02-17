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

  currentStep = 0;
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

  constructor(
    private dpSv: CodxDpService,
    private api: ApiHttpService,
    private cache: CacheService,
    private changeDetec: ChangeDetectorRef,
    private popupInstances: InstancesComponent
  ) {

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
      if (changes['dataSelect'].currentValue.recID == this.id) return;
      this.id = changes['dataSelect'].currentValue.recID;
      this.dataSelect = changes['dataSelect'].currentValue;
      this.currentStep = this.dataSelect.currentStep;
      this.GetStepsByInstanceIDAsync(this.id);
      //cái này xóa luon di. chưa chạy xong api mà gọi ra la sai
      // if (this.listSteps == null && this.listSteps.length == 0) {
      //   this.tmpTeps = null;
      // }
      this.getDataGanttChart(this.recID);
    }
    console.log(this.formModel);
  }

  GetStepsByInstanceIDAsync(insID){
     this.dpSv.GetStepsByInstanceIDAsync(insID).subscribe((res) => {
      if (res) {
        this.listSteps = res;
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
    this.idCbx = e?.data;
  }

  clickMF(e, data) {
    this.moreFunctionEvent.emit({e: e, data: data, lstSteps: this.listSteps});
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
    this.changeMF.emit({e: e, data: data})
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
    if (this.currentStep < indexNo) return;
    this.currentNameStep = indexNo;
    this.tmpTeps = data;
  }

  continues(data) {
    if (this.currentStep + 1 == this.listSteps.length) return;
    this.dpSv.GetStepsByInstanceIDAsync(data.recID).subscribe(res =>{
      res.forEach((element) => {
        if (element != null && element.recID == this.dataSelect.stepID) {
          this.tmpTeps = element;
        }
      })
    })
    this.currentStep++;
    this.currentNameStep = this.currentStep;
    this.changeDetec.detectChanges();
  }

  setHTMLCssStages(oldStage, newStage) {}

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
}
