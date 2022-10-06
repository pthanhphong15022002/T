import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, DialogData, DialogRef } from 'codx-core';
import moment from 'moment';
import { CodxTMService } from '../codx-tm.service';
import { TabModelSprints } from '../models/TM_Sprints.model';

@Component({
  selector: 'lib-popup-tabs-views-details',
  templateUrl: './popup-tabs-views-details.component.html',
  styleUrls: ['./popup-tabs-views-details.component.scss'],
})
export class PopupTabsViewsDetailsComponent implements OnInit, AfterViewInit {
  title = 'Danh sách công việc';
  createdByName: any;
  dialog: DialogRef;
  active = 1;
  iterationID: any;
  data: any;
  functionParent: any;
  meetingID: any;
  dataObj: any;
  dataObjAssign: any;
  user: any;
  funcID: any;
  tabControl: TabModelSprints[] = [];
  name = 'Tasks';
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
  showButtonAdd = true;
  showMoreFunc = true;
  offset = '0px';
  listRecID = [];

  constructor(
    private tmSv: CodxTMService,
    private activedRouter: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.data = dt?.data?.data;
    this.dataObj = dt?.data?.dataObj;
    this.functionParent = this.activedRouter.snapshot.params['funcID'];

    if (this.data?.iterationID) {
      // this.projectCategory = this.data?.projectCategory;
      this.createdByName = this.data?.createdByName;
      this.nameObj = this.data?.iterationName;
      this.projectID = this.data?.projectID;
      this.resources = this.data?.resources;
      this.iterationID = this.data?.iterationID;
    }

    if (this.data?.meetingID) {
      this.getListRecID(this.meetingID);
      this.createdByName = this.data?.userName;
      this.nameObj = this.data?.meetingName;
      this.projectID = this.data?.refID;
      this.resources = this.dataObj?.resources;
      this.meetingID = this.data?.meetingID;
      this.name = 'Comments';
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

      this.showButtonAdd = false;
      this.showMoreFunc = false;
    }

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
  }

  loadTabView() {
    if (this.tabControl.length == 0) {
      this.tabControl = this.all;
    } else {
      this.active = this.tabControl.findIndex(
        (x: TabModelSprints) => x.isActive == true
      );
    }
    if (
      this.name == 'Tasks' ||
      this.name == 'AssignTo' ||
      this.name == 'Meetings'
    )
      this.offset = '65px';
    else this.offset = '0px';
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
    if (
      this.name == 'Tasks' ||
      this.name == 'AssignTo' ||
      this.name == 'Meetings'
    )
      this.offset = '65px';
    else this.offset = '0px';
    item.isActive = true;
    this.changeDetectorRef.detectChanges();
  }

  //#region get List recID - chaỵ lại vì khi giao việc nó không cap nhật lúc đó
  getListRecID(meetingID) {
    this.tmSv.getCOMeetingByID(meetingID).subscribe((res) => {
      if (res) {
        this.listRecID.push(res.recID);
        if (res.contents) {
          var contents = res.contents;
          contents.forEach((data) => {
            // if(data.recID !='')
            this.listRecID.push(data.recID);
          });
        }
        var listRecID =
          this.listRecID.length > 0 ? this.listRecID.join(';') : '';
        this.dataObjAssign = { listRecID: listRecID };
      }
    });
  }
}
