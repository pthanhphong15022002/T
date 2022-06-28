import { AfterViewInit, Component, OnInit, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'popup-add-calendar',
  templateUrl: './popup-add-calendar.component.html',
  styleUrls: ['./popup-add-calendar.component.scss'],
})
export class PopupAddCalendarComponent implements OnInit, AfterViewInit {
  dialog: DialogRef;
  dialogAddCalendar: FormGroup;
  formModel: FormModel;
  
  constructor(
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ){
    this.dialog = dialog;
  }

  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    
  }

  valueChange(event) {
    if (event?.field) {
      if (event?.data === Object(event?.data))
        this.dialogAddCalendar.patchValue({ [event['field']]: event.data.value });
      else this.dialogAddCalendar.patchValue({ [event['field']]: event.data });
    }
  }
}
