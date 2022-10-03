import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  LayoutService,
  NotificationsService,
  ScrollComponent,
} from 'codx-core';
import moment from 'moment';
import { CodxTMService } from '../../codx-tm.service';
import { TabModelSprints } from '../../models/TM_Sprints.model';

@Component({
  selector: 'codx-sprintdetails',
  templateUrl: './sprintdetails.component.html',
  styleUrls: ['./sprintdetails.component.scss'],
})
export class SprintDetailsComponent implements OnInit, AfterViewInit {
  active = 1;
  iterationID: any;
  functionParent: any
  data: any;
  meetingID: any;
  dataObj: any;
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
  // private all = [
  //   'Dashboard',
  //   'Công việc',
  //   'Lịch sử',
  //   'Bình luận',
  //   'Họp định kì',
  // ];
  private all: TabModelSprints[] = [
    { name: 'Dashboard', textDefault: 'Dashboard', isActive: false },
    { name: 'AssignTo', textDefault: 'Công việc', isActive: true },
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comments', textDefault: 'Bình luận', isActive: false },
    { name: 'Meetings', textDefault: 'Họp định kì', isActive: false },
  ];
  nameObj: any;
  projectCategory: string = "2";  //set cứng đợi bảng PM_Projects hoàn thiện xong join projectID
  createdByName: any;
  showTabDasboard = true;
  showTabTasks = true;
  showTabHistory = true;
  showTabComments = true;
  showTabMeetings = true;
  showButtonAdd = true;
  showMoreFunc = true ;
   offset = "0px";

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private layout: LayoutService,
    private authStore: AuthStore,
    private api: ApiHttpService,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private cache: CacheService,
    private tmSv: CodxTMService
  ) {
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.layout.setUrl(this.tmSv.urlback);
    this.functionParent = this.tmSv.functionParent;
    this.cache.functionList(this.funcID).subscribe(f => {
      if (f) this.layout.setLogo(f.smallIcon);
    })
    this.activedRouter.queryParams.subscribe((params) => {
      if (params) {
        this.meetingID = params?.meetingID;
        this.iterationID = params?.iterationID;
      }
    });

    if (this.iterationID && this.iterationID != '') {
      this.tmSv.getSprintsDetails(this.iterationID).subscribe((res) => {
        if (res) {
          this.data = res;
          this.createdByName = res.createdByName;
          this.nameObj = res.iterationName;
          this.projectID = res?.projectID;
          this.resources = res.resources;
          this.dataObj = {
            projectID: this.projectID ? this.projectID : '',
            resources: this.resources ? this.resources : '',
            iterationID: this.iterationID ? this.iterationID : '',
            viewMode: res.viewMode ? res.viewMode : '',
          };

          if (this.resources != null) {
            this.getListUserByResource(this.resources);
          }
        }
      });
    }
    if (this.meetingID) {
      this.tmSv.getMeetingID(this.meetingID).subscribe((res) => {
        if (res) {
          this.data = res;
          this.createdByName = res.userName;
          this.nameObj = res.meetingName;
          this.projectID = res.refID;  // ở meeting là refID
          var resourceTaskControl = [];
          var arrayResource = res?.resources;
          if (arrayResource && arrayResource.length > 0) {
            arrayResource.forEach(data => {
              if (data.taskControl) resourceTaskControl.push(data.resourceID);
            })
          }
          this.resources = resourceTaskControl.length > 0 ? resourceTaskControl.join(";") : '',
            this.dataObj = {
              projectID: this.projectID ? this.projectID : '',
              resources: this.resources,
              fromDate: res.fromDate ? moment(new Date(res.fromDate)) : '',
              endDate: res.toDate ? moment(new Date(res.toDate)) : '',
            };
          if (this.resources != null) {
            this.getListUserByResource(this.resources);
          }
          this.showButtonAdd = false;
          this.showMoreFunc = false;
        }
      });
    }

    this.functionParent = this.tmSv.functionParent;
    if (this.meetingID) {
      //sau mấy cái này sẽ được truyền qua state
      // this.showTabHistory = false;
      // this.showTabComments = false;
      // this.showTabMeetings = false;
      // this.all = ['Dashboard', 'Công việc'];
      this.all = [
        { name: 'Dashboard', textDefault: 'Dashboard', isActive: false },
        { name: 'AssignTo', textDefault: 'Công việc', isActive: true },
      ];
    }
  }
  ngOnInit(): void {
    // var body = document.querySelectorAll('body.toolbar-enabled');
    // if(body && body.length > 0)
    if(this.name =='AssignTo' || this.name =='Meetings')
    this.offset ="65px";else this.offset ="0px"
    this.loadTabView();
  }
  ngAfterViewInit(): void { 
    
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
    if(this.name =='AssignTo' || this.name =='Meetings')
    this.offset ="65px";else this.offset = "0px" ;
    item.isActive = true;
    this.changeDetectorRef.detectChanges();
  }
  //popoverCrr
  popoverEmpList(p: any) {
    // if (this.popoverCrr) {
    //   if (this.popoverCrr.isOpen()) this.popoverCrr.close();
    // }
    // if(p.isOpen) p.close() ;
    p.open();
    //this.popoverCrr = p;
  }

  searchName(e) {
    var listTaskResousceSearch = [];
    this.searchField = e;
    if (this.searchField.trim() == '') {
      this.listTaskResousceSearch = this.listTaskResousce;
      return;
    }
    this.listTaskResousce.forEach((res) => {
      var name = res.employeeName;
      if (name.toLowerCase().includes(this.searchField.toLowerCase())) {
        listTaskResousceSearch.push(res);
      }
    });
    this.listTaskResousceSearch = listTaskResousceSearch;
  }

  getListUserByResource(resources) {
    this.api
      .execSv<any>(
        'HR',
        'ERM.Business.HR',
        'EmployeesBusiness',
        'GetListEmployeesByUserIDAsync',
        JSON.stringify(resources.split(';'))
      )
      .subscribe((data) => {
        if (data) {
          this.listTaskResousce = data;
          this.listTaskResousceSearch = data;
          this.countResource = data.length;
          this.changeDetectorRef.detectChanges();
        }
      });
  }
}
