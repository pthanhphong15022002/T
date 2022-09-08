import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ApiHttpService, ViewModel, ViewType } from 'codx-core';
import { ViewDetailComponent } from 'projects/codx-wp/src/lib/news/view-detail/view-detail.component';
import { TM_TaskGroups } from '../../../models/TM_TaskGroups.model';
import { TM_Parameter } from '../../../models/TM_Tasks.model';

@Component({
  selector: 'view-assign-tasks-meeting',
  templateUrl: './view-assign-tasks-meeting.component.html',
  styleUrls: ['./view-assign-tasks-meeting.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class ViewAssignTasksMeetingComponent implements OnInit {
  @ViewChild('panelRight') panelRight?: TemplateRef<any>;
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  @ViewChild('detail') detail: ViewDetailComponent;
  @Input() listRecID = [];
  datas : any ;
  views: Array<ViewModel> = [];
  user: any;
  funcID: any;
  dataTree = [];
  itemSelected: any;
  vllStatus = 'TM007';
  vllApproveStatus = 'TM011';
  vllVerifyStatus = 'TM008';
  vllExtendStatus = 'TM010';
  vllConfirmStatus = 'TM009';
  dataReferences: any;
  param: TM_Parameter = new TM_Parameter();
  paramModule: any;
  listTaskResousce = [];
  searchField = '';
  listTaskResousceSearch = [];
  listRoles = [];
  vllRole = 'TM002';
  countResource = 0;
  popoverCrr: any;
  popoverDataSelected: any;
  taskGroup: any;

  constructor(
    private detectorRef: ChangeDetectorRef,
    private api: ApiHttpService
  ) {
 
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.api
    .execSv<any>(
      'TM',
      'TM',
      'TaskBussiness',
      'GetListTaskAssignByByMeetingAsync',
      this.listRecID
    )
    .subscribe((res) => {
      this.datas = res ;
    });
    this.views = [
      {
        type: ViewType.listdetail,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
          panelRightRef: this.panelRight,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  //function

  getParam(callback = null) {
    this.api
      .execSv<any>(
        'SYS',
        'ERM.Business.SYS',
        'SettingValuesBusiness',
        'GetByModuleWithCategoryAsync',
        ['TMParameters', '1']
      )
      .subscribe((res) => {
        if (res) {
          var param = JSON.parse(res.dataValue);
          this.param = param;
          this.paramModule = param;
          return callback && callback(true);
        }
      });
  }

  getTaskGroup(idTasKGroup, e, data) {
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskGroupBusiness',
        'GetAsync',
        idTasKGroup
      )
      .subscribe((res) => {
        if (res) {
          this.taskGroup = res;
          this.convertParameterByTaskGroup(res);
        } else {
          this.param = this.paramModule;
        }
      });
  }

  //#region Convert
  convertParameterByTaskGroup(taskGroup: TM_TaskGroups) {
    this.param.ApproveBy = taskGroup.approveBy;
    this.param.ApproveControl = taskGroup.approveControl;
    this.param.AutoCompleted = taskGroup.autoCompleted;
    this.param.ConfirmControl = taskGroup.confirmControl;
    this.param.EditControl = taskGroup.editControl;
    this.param.LocationControl = taskGroup.locationControl;
    this.param.MaxHours = taskGroup.maxHours.toString();
    this.param.MaxHoursControl = taskGroup.maxHoursControl;
    this.param.PlanControl = taskGroup.planControl;
    this.param.ProjectControl = taskGroup.projectControl;
    this.param.UpdateControl = taskGroup.updateControl;
    this.param.VerifyBy = taskGroup.verifyBy;
    this.param.VerifyByType = taskGroup.verifyByType;
    this.param.VerifyControl = taskGroup.verifyControl;
    this.param.DueDateControl = taskGroup.dueDateControl;
    this.param.ExtendControl = taskGroup.extendControl;
    this.param.ExtendBy = taskGroup.extendBy;
    this.param.CompletedControl = taskGroup.completedControl;
  }
  //#endregion

  popoverEmpList(p: any, task) {
    this.listTaskResousceSearch = [];
    this.countResource = 0;
    if (this.popoverCrr) {
      if (this.popoverCrr.isOpen()) this.popoverCrr.close();
    }
    if (this.popoverDataSelected) {
      if (this.popoverDataSelected.isOpen()) this.popoverDataSelected.close();
    }
    this.api
      .execSv<any>(
        'TM',
        'ERM.Business.TM',
        'TaskResourcesBusiness',
        'GetListTaskResourcesByTaskIDAsync',
        task.taskID
      )
      .subscribe((res) => {
        if (res) {
          this.listTaskResousce = res;
          this.listTaskResousceSearch = res;
          this.countResource = res.length;
          p.open();
          this.popoverCrr = p;
        }
      });
  }

  searchName(e) {
    var listTaskResousceSearch = [];
    this.searchField = e;
    if (this.searchField.trim() == '') {
      this.listTaskResousceSearch = this.listTaskResousce;
      return;
    }
    this.listTaskResousce.forEach((res) => {
      var name = res.resourceName;
      if (name.toLowerCase().includes(this.searchField.toLowerCase())) {
        listTaskResousceSearch.push(res);
      }
    });
    this.listTaskResousceSearch = listTaskResousceSearch;
  }

  hoverPopover(p: any) {
    this.popoverDataSelected = p;
  }

  //end
}
