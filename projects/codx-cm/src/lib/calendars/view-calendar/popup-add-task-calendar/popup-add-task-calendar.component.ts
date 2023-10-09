import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import { StepService } from 'projects/codx-share/src/lib/components/codx-step/step.service';

@Component({
  selector: 'lib-popup-add-task-calendar',
  templateUrl: './popup-add-task-calendar.component.html',
  styleUrls: ['./popup-add-task-calendar.component.css']
})
export class PopupAddTaskCalendarComponent implements OnInit {
  @Input() lstParticipants = [];
  @Input() dialog: any;
  @Output() eventUser = new EventEmitter();
  @Input() isType = '';
  @Input() owner = '';
  title = 'Chọn ';
  checkRight = false;
  checkUser = false;
  currentLeft = 0;
  currentRight = 0;

  taskType;

  isLoading = true;
  lstOrg = [];
  isDisable = false;
  id: any;
  fieldsCustomer = { text: 'customerName', value: 'recID' };
  type = '';
  listCustomer;
  refValue = {
    case:"CMCasesOfCalendar",
    deal:"CMDealsOfCalendar",
    contract:"CMContractsOfCalendar",
    customer:"CMCustomersOfCalendar",
    lead:"CMLeadsOfCalendar",
  }
  refValueType = '';
  constructor(
    private stepService: StepService,
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.dialog = dialog;
    this.taskType =  dt?.data?.taskType;
  }

  ngOnInit(): void {

  }

  async ngAfterViewInit() {

  }
  continue() {
    this.dialog.close();
    this.stepService.addTask('add','',null,this.taskType,null,'',true,'','right');
  }

  changeType(type){
    if(this.type != type){
      this.type = '';
      this.type = type;
      this.refValueType = this.refValue[type];
    }
  }
  valueChangeCombobox(event, type) {}
  valueChangeRadio(event){}
  searchName(e) {}
}
