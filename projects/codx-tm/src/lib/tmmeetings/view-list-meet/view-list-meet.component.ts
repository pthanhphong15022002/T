import { ChangeDetectorRef, ViewChild } from '@angular/core';
import { CO_Resources } from './../../models/CO_Meetings.model';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Optional,
  Output,
} from '@angular/core';
import {
  DialogData,
  DialogRef,
  FormModel,
  CallFuncService,
  ViewsComponent,
} from 'codx-core';
import { PopupRescheduleMeetingComponent } from '../popup-reschedule-meeting/popup-reschedule-meeting.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'lib-view-list-meet',
  templateUrl: './view-list-meet.component.html',
  styleUrls: ['./view-list-meet.component.scss'],
})
export class ViewListMeetComponent implements OnInit {
  @Input() data?: any;
  @Input() formModel?: FormModel;

  @Output() clickMoreFunction = new EventEmitter<any>();
  @Output() viewDetail = new EventEmitter<any>();
  @ViewChild('view') view!: ViewsComponent;

  month: any;
  day: any;
  startTime: any;
  endTime: any;
  resources: CO_Resources[] = [];
  resourceID: any;
  popoverCrr: any;
  countResource = 0;
  dialog: any;
  funcID: any;
  constructor(
    private activedRouter: ActivatedRoute,
    private callFc: CallFuncService,
    private detectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    if (!this.funcID)
      this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnInit(): void {
    console.log(this.data);
    this.getDate();
    this.getResourceID();
  }

  clickMF(e: any, dt?: any) {
    this.clickMoreFunction.emit({ e: e, data: dt });
  }
  changeDataMF(e: any, data: any) {
    if (e) {
      e.forEach((x) => {
        //an giao viec
        if (x.functionID == 'SYS005') {
          x.disabled = true;
        }
      });
    }
  }
  getResourceID() {
    this.resources = this.data.resources;
    var id = '';
    this.resources.forEach((e) => {
      id += e.resourceID + ';';
    });
    if (id != '') {
      this.resourceID = id.substring(0, id.length - 1);
    }
  }

  getDate() {
    if (this.data.startDate) {
      var date = new Date(this.data.startDate);
      this.month = this.addZero(date.getMonth() + 1);
      this.day = this.addZero(date.getDate());
      var endDate = new Date(this.data.endDate);
      let start =
        this.addZero(date.getHours()) + ':' + this.addZero(date.getMinutes());
      let end =
        this.addZero(endDate.getHours()) +
        ':' +
        this.addZero(endDate.getMinutes());

      this.startTime = start + ' - ' + end;
    }
  }

  addZero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  }

  convertHtmlAgency(position: any) {
    var desc = '<div class="d-flex">';
    if (position)
      desc +=
        '<div class="d-flex align-items-center me-2"><span class=" text-dark-75 font-weight-bold icon-apartment1"></span><span class="">' +
        position +
        '</span></div>';

    return desc + '</div>';
  }

  popoverEmpList(p: any) {
    if (this.popoverCrr) {
      if (this.popoverCrr.isOpen()) this.popoverCrr.close();
      p.open();
      this.popoverCrr = p;
    }
  }

  searchName(e) {
    this.data.resources = this.data.resources.filter((val) =>
      val.resourceName.toLowerCase().includes(e.toLowerCase())
    );
  }
  dbClick(data) {
    this.viewDetail.emit(data);
  }

  updateTimeMeeting(data) {
    var obj = {
      data: data,
      funcID: this.funcID,
    };
    this.dialog = this.callFc.openForm(
      PopupRescheduleMeetingComponent,
      '',
      500,
      350,
      '',
      obj
    );
    this.dialog.closed.subscribe((e) => {
      if (e?.event && e?.event != null) {
        this.data = e?.event;
        this.detectorRef.detectChanges();
      }
    });
  }
}
