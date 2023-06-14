import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ApiHttpService, CacheService, CallFuncService, NotificationsService } from 'codx-core';

@Component({
  selector: 'step-task',
  templateUrl: './step-task.component.html',
  styleUrls: ['./step-task.component.scss']
})
export class StepTaskComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() isDataLoading: any;
  @Input() dataSelected: any;
  @Input() listInstanceStep: any[];
  @Output() continueStep = new EventEmitter<any>();
  @Output() saveAssignTask = new EventEmitter<any>();
  status = [];
  type = '';
  crrViewGant = 'W';
  vllViewGannt = 'DP042';
  typeTime;
  listInstanceStepShow = [];
  isShowElement = true;
  indexAddTask: number;
  constructor(
    private cache: CacheService,
    private callFunc: CallFuncService,
    private api: ApiHttpService,
    private notiService: NotificationsService,
  ) {
    this.cache.valueList('DP028').subscribe(res => {
      if(res?.datas){
        this.status = res?.datas;
      }
    })
  }

  ngOnInit(): void {
    this.isDataLoading;
    this.listInstanceStep;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.dataSelected){
      this.getViewModeDetailByProcessID();
    }
    if(changes?.listInstanceStep){
      this.listInstanceStepShow = this.listInstanceStep;
    }
  }

  ngAfterViewInit(): void {

  }

  getViewModeDetailByProcessID(){
    if(this.dataSelected){
      this.api.exec<any>(
        'DP',
        'ProcessesBusiness',
        'GetViewModeDetailByProcessIDAsync',
        this.dataSelected?.processID
      ).subscribe(res => {
        this.type = res ? res : 'S';        
      })
    }
    
  }

  changeValue(e){
    this.type = e.data;
  }
  changeValueDropdownSelect(e){
    if(e.field == 'status'){
      if(e?.data?.length == 0){
        this.listInstanceStepShow = this.listInstanceStep;
      }else{
        this.listInstanceStepShow = this.listInstanceStep.filter(step => e?.data?.includes(step.stepStatus))
      }
    }
    if(e.field == 'show' && e.data?.length > 0){
      this.isShowElement = e.data[0] == '1' ? true : false;
    }else{
      this.isShowElement = true;
    }
  }
  

  handelContinueStep(event, step){
    this.continueStep.emit({isTaskEnd: event, step: step})
  }

  handelSaveAssignTask(event){
    this.saveAssignTask.emit(event);
  }

  changeViewTimeGant(e) {
    this.typeTime = e;
  }

  addTask(){
    this.indexAddTask = this.listInstanceStep.findIndex(step => step.stepStatus == '1');
    setTimeout(() => {
      this.indexAddTask = -1;
    },1000);
  }
}
