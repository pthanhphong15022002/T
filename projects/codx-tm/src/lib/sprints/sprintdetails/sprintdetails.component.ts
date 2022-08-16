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
  NotificationsService,
} from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';
import { TabModelSprints } from '../../models/TM_Sprints.model';

@Component({
  selector: 'codx-sprintdetails',
  templateUrl: './sprintdetails.component.html',
  styleUrls: ['./sprintdetails.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SprintDetailsComponent implements OnInit, AfterViewInit {
  active = 1;
  iterationID: any;
  data: any;
  meetingID: any;
  dataObj: any;
  user: any;
  funcID: any;
  tabControl: TabModelSprints[] = [];
  name = 'Công việc';
  projectID: any;
  resources: any;
  searchField = '';
  listTaskResousceSearch = [];
  listTaskResousce = [];
  countResource = 0;
  vllStatus = 'TM004';
  vllRole = 'TM002';
  popoverCrr: any;
  private all = [
    'Dashboard',
    'Công việc',
    'Lịch sử',
    'Bình luận',
    'Họp định kì',
  ];
  nameObj: any;
  projectCategory: any;
  createdByName: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private authStore: AuthStore,
    private api: ApiHttpService,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private cache: CacheService,
    private tmSv: CodxTMService
  ) {
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];

    this.activedRouter.queryParams.subscribe((params) => {
      if (params) {
        this.meetingID = params?.meetingID;
        this.iterationID = params?.iterationID;
      }
    });
    if (this.iterationID != '') {
      this.tmSv.getSprintsDetails(this.iterationID).subscribe((res) => {
        if (res) {
          this.data =res ;
          this.createdByName = res.createdByName;
          this.nameObj = res.iterationName;
          this.projectID = res?.projectID;
          this.resources = res.resources;
          this.dataObj = {
            projectID: this.projectID ? this.projectID : '',
            resources : this.resources? this.resources:'' ,
            iterationID: this.iterationID ? this.iterationID : '',
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
          this.data =res ;
          this.createdByName = res.userName;
          this.nameObj = res.meetingName;
          this.projectID = res.projectID;
          this.resources = res.avataResource;
          this.dataObj = {
            projectID: this.projectID ? this.projectID : '',
            resources : this.resources? this.resources:'' ,
          };
          if (this.resources != null) {
            this.getListUserByResource(this.resources);
          }
        }
      });
    }
    if (this.meetingID) this.all = ['Dashboard', 'Công việc'];
  }
  ngOnInit(): void {
    if (this.tabControl.length == 0) {
      this.all.forEach((res, index) => {
        var tabModel = new TabModelSprints();
        tabModel.name = tabModel.textDefault = res;
        if (index == 1) tabModel.isActive = true;
        else tabModel.isActive = false;
        this.tabControl.push(tabModel);
      });
    } else {
      this.active = this.tabControl.findIndex(
        (x: TabModelSprints) => x.isActive == true
      );
    }
    this.changeDetectorRef.detectChanges();
  }
  ngAfterViewInit(): void {}

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
  //popoverCrr
  popoverEmpList(p: any) {
    if (this.popoverCrr) {
      if (this.popoverCrr.isOpen()) this.popoverCrr.close();
      p.open();
      this.popoverCrr = p;
    }
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
