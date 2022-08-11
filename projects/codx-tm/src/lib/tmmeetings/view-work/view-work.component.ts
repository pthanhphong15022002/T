import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CodxTMService } from '../../codx-tm.service';
import { CO_Meetings, TabControl } from '../../models/CO_Meetings.model';

@Component({
  selector: 'lib-view-work',
  templateUrl: './view-work.component.html',
  styleUrls: ['./view-work.component.css']
})
export class ViewWorkComponent implements OnInit {
  active = 1;
  meeting = new CO_Meetings();
  data: any;
  startDateMeeting: any;
  name= '';
  private all = ['Dashboard', 'Công việc'];
  tabControl: TabControl[] = [];

  constructor(
    private tmService: CodxTMService,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.loadData();
    if (this.tabControl.length == 0) {
      this.all.forEach((res, index) => {
        var tabModel = new TabControl();
        tabModel.name = tabModel.textDefault = res;
        if (index == 1) tabModel.isActive = true;
        else tabModel.isActive = false;
        this.tabControl.push(tabModel);
      });
    } else {
      this.active = this.tabControl.findIndex(
        (x: TabControl) => x.isActive == true
      );
    }
    this.changeDetectorRef.detectChanges();
  }

  loadData(){
    // if (this.meetingID != null) {
      this.tmService.getMeetingID('MEET2208-0257').subscribe((res) => {
        if (res) {
          this.data = res;
          this.meeting = this.data;
          this.startDateMeeting = this.meeting.startDate;

        // }
      }
    });
  }

  clickMenu(item) {
    this.name = item.name;
    this.tabControl.forEach((obj) => {
      if (obj.isActive == true) {
        obj.isActive = false;
        return;
      }
    });
    item.isActive = true;
    this.changeDetectorRef.detectChanges();
  }
}
