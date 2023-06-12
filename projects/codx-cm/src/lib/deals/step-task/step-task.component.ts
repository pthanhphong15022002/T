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
  @Input() listStep: any;
  @Output() continueStep = new EventEmitter<any>();
  @Output() saveAssignTask = new EventEmitter<any>();
  status = [];
  type = '';
  crrViewGant = 'W';
  vllViewGannt = 'DP042';
  typeTime;
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
    this.listStep;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes?.dataSelected){
      this.getViewModeDetailByProcessID();
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
  

  handelContinueStep(event, step){
    this.continueStep.emit({isTaskEnd: event, step: step})
  }

  handelSaveAssignTask(event){
    this.saveAssignTask.emit(event);
  }

  changeViewTimeGant(e) {
    this.typeTime = e;
  }
}
