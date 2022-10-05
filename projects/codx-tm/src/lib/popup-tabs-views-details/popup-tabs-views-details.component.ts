import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';
import moment from 'moment';
import { CodxTMService } from '../codx-tm.service';
import { TabModelSprints } from '../models/TM_Sprints.model';

@Component({
  selector: 'lib-popup-tabs-views-details',
  templateUrl: './popup-tabs-views-details.component.html',
  styleUrls: ['./popup-tabs-views-details.component.scss'],
})
export class PopupTabsViewsDetailsComponent
  implements OnInit, AfterViewInit
{
  title = 'Danh sách công việc';
  data: any;
  dialog: DialogRef;
  active = 1;
  iterationID: any;
  functionParent: any;
  meetingID: any;
  dataObjTasks: any;
  dataObjMeetings: any;
  user: any;
  funcID: any;
  tabControl: TabModelSprints[] = [];
  name = 'AssignTo';
  projectID: any;
  resources: any;
  searchField = '';
  listTaskResousceSearch = [];
  listTaskResousce = [];
  countResource = 0;
  vllStatus = 'TM004';
  vllRole = 'TM002';
  popoverCrr: any;
  private all: TabModelSprints[] = [
    { name: 'Dashboard', textDefault: 'Dashboard', isActive: false },
    { name: 'Tasks', textDefault: 'Công việc', isActive: true },
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comments', textDefault: 'Bình luận', isActive: false },
    { name: 'Meetings', textDefault: 'Họp định kì', isActive: false },
  ];
  nameObj: any;
  projectCategory: string = '2'; //set cứng đợi bảng PM_Projects hoàn thiện xong join projectID
  createdByName: any;
  showButtonAdd = true;
  showMoreFunc = true;
  offset = '0px';
  constructor(
    private tmSv: CodxTMService,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.iterationID = dt?.data?.iterationID;
    this.meetingID = dt?.data?.meetingID;
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.loadTabView();
  }
  ngAfterViewInit(): void {
    let body = document.body;
    if (body.classList.contains('toolbar-fixed')) {
      body.classList.remove('toolbar-fixed');
    }
    if (this.iterationID && this.iterationID != '') {
      this.tmSv.getSprintsDetails(this.iterationID).subscribe((res) => {
        if (res) {
          this.data = res;
          this.createdByName = res.createdByName;
          this.nameObj = res.iterationName;
          this.projectID = res?.projectID;
          this.resources = res.resources;
          this.dataObjTasks = {
            projectID: this.projectID ? this.projectID : '',
            resources: this.resources ? this.resources : '',
            iterationID: this.iterationID ? this.iterationID : '',
            viewMode: res.viewMode ? res.viewMode : '',
          };

          // if (this.resources != null) {
          //   this.getListUserByResource(this.resources);
          // }
        }
      });
    }

    //hủy sửa lại theo Thương
    if (this.meetingID) {
      this.tmSv.getMeetingID(this.meetingID).subscribe((res) => {
        if (res) {
          this.data = res;
          this.createdByName = res.userName;
          this.nameObj = res.meetingName;
          this.projectID = res.refID; // ở meeting là refID
          var resourceTaskControl = [];
          var arrayResource = res?.resources;
          if (arrayResource && arrayResource.length > 0) {
            arrayResource.forEach((data) => {
              if (data.taskControl) resourceTaskControl.push(data.resourceID);
            });
          }
          (this.resources =
            resourceTaskControl.length > 0
              ? resourceTaskControl.join(';')
              : ''),
            (this.dataObjMeetings = {
              projectID: this.projectID ? this.projectID : '',
              resources: this.resources,
              fromDate: res.fromDate ? moment(new Date(res.fromDate)) : '',
              endDate: res.toDate ? moment(new Date(res.toDate)) : '',
            });

          this.showButtonAdd = false;
          this.showMoreFunc = false;
        }
      });
    }

    this.functionParent = this.tmSv.functionParent;
    if (this.meetingID) {
      this.all = [
        {
          name: 'MeetingContents',
          textDefault: 'Nội dung họp',
          isActive: false,
        },
        { name: 'Comments', textDefault: 'Thảo luận', isActive: true },
        { name: 'AssignTo', textDefault: 'Giao việc', isActive: false },
        { name: 'Tasks', textDefault: 'Công việc', isActive: false },
      ];
    }
  }

  loadTabView() {
    if (this.tabControl.length == 0) {
      this.tabControl = this.all;
    } else {
      this.active = this.tabControl.findIndex(
        (x: TabModelSprints) => x.isActive == true
      );
    }
    this.changeDetectorRef.detectChanges();
  }

  clickMenu(item) {
    this.name = item.name;
    this.tabControl.forEach((obj) => {
      if (obj.isActive == true) {
        obj.isActive = false;
        return;
      }
    });
    // var body = document.querySelectorAll('body.toolbar-enabled');
    // if(body && body.length > 0)
    if (this.name == 'AssignTo' || this.name == 'Meetings')
      this.offset = '65px';
    else this.offset = '0px';
    item.isActive = true;
    this.changeDetectorRef.detectChanges();
  }
}
