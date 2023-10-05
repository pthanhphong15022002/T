import { Component, EventEmitter, Input, OnInit, Optional, Output } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

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

  isLoading = true;
  lstOrg = [];
  isDisable = false;
  id: any;
  fieldsCustomer = { text: 'customerName', value: 'recID' };
  type = '';
  listCustomer;
  constructor(
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) {
    this.dialog = dialog;
  }

  ngOnInit(): void {

  }

  async ngAfterViewInit() {

  }
  onSave() {
    this.dialog.close();
  }
  valueChangeCombobox(event, type) {}
  valueChangeRadio(event){}
  searchName(e) {}
}
