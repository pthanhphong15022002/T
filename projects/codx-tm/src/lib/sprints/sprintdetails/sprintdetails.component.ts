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
  @Input() projectID?: any;
  @Input() resources?: any;
  active = 1;
  sprints: any;
  iterationID: any;
  dataObj: any;
  user: any;
  funcID: any;
  tabControl: TabModelSprints[] = [];
  name = 'Công việc';
  // projectID: any;
  // resources: any;
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
    if (this.funcID == 'TMT03012') this.all = ['Dashboard', 'Công việc'];
    this.activedRouter.firstChild?.params.subscribe(
      (data) => (this.iterationID = data.id)
    );
    // this.activedRouter.params.subscribe((routeParams) => {
    //   var state = history.state;
    //   if (state) {
    //     this.iterationID = state.iterationID || '';
    //   }
    // });
    if (this.iterationID != '') {
      this.tmSv.getSprintsDetails(this.iterationID).subscribe((res) => {
        if (res) {
          this.sprints = res;
          this.projectID = this.sprints?.projectID;
          this.resources = this.sprints.resources;
          this.dataObj = {
            projectID: this.projectID ? this.projectID : '',
            iterationID: this.iterationID ? this.iterationID : '',
          };
          if (this.sprints?.resources != null) {
            this.getListUserByResource(this.sprints?.resources);
            // this.api
            //   .execSv<any>(
            //     'HR',
            //     'ERM.Business.HR',
            //     'EmployeesBusiness',
            //     'GetListEmployeesByUserIDAsync',
            //     JSON.stringify(this.sprints?.resources.split(';'))
            //   )
            //   .subscribe((data) => {
            //     if (data) {
            //       this.listTaskResousce = data;
            //       this.listTaskResousceSearch = data;
            //       this.countResource = data.length;
            //       this.changeDetectorRef.detectChanges();
            //     }
            //   });
          }
        }
      });
    } else if (this.resources) this.getListUserByResource(this.resources);
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
