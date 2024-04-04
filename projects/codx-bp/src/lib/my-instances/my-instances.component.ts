import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  AuthStore,
  DialogModel,
  NotificationsService,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/public-api';
import { CodxBpService } from '../codx-bp.service';
import { ProcessReleaseDetailComponent } from '../processes/popup-add-process/process-release/process-release-detail/process-release-detail.component';
import { PopupBpTasksComponent } from '../bp-tasks/popup-bp-tasks/popup-bp-tasks.component';

@Component({
  selector: 'lib-my-instances',
  templateUrl: './my-instances.component.html',
  styleUrls: ['./my-instances.component.css'],
})
export class MyInstancesComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplateList') headerTemplateList?: TemplateRef<any>;
  views: Array<ViewModel> = [];
  predicates = 'Permissions.Any(ObjectID=@0)';
  dataValues = '';
  dataSelected: any;
  user: any;
  constructor(
    inject: Injector,
    private bpService: CodxBpService,
    private notiSv: NotificationsService,
    private codxShareService: CodxShareService,
    private authstore: AuthStore
  ) {
    super(inject);
    this.user = this.authstore.get();
    this.dataValues = this.user?.userID;
  }

  onInit(): void {}

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        sameData: true,
        active: true,
        model: {
          template: this.templateList,
          headerTemplate: this.headerTemplateList,
        },
      },
    ];
  }

  selectedChange(data: any) {
    this.dataSelected = data?.data ? data?.data : data;
    this.detectorRef.detectChanges();
  }

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'BPT0501':
          case 'BPT0502':
          case 'SYS003':
          case 'SYS004':
          case 'SYS001':
          case 'SYS002':
            res.disabled = false;
            break;
          default:
            res.disabled = true;
            break;
        }
      });
    }
  }

  clickMF(e, data) {
    this.dataSelected = data;
    switch (e.functionID) {
      case 'BPT0501':
        this.openFormDetail(data);
        break;
      case 'BPT0502':
        this.openTask(data);
        break;
      default: {
        this.codxShareService.defaultMoreFunc(
          e,
          data,
          null,
          this.view.formModel,
          this.view.dataService,
          this
        );
        break;
      }
    }
  }
  dbClick(e) {
    if (e && e?.data) {
      this.openFormDetail(e?.data);
    }
  }
  openFormDetail(dt: any) {
    var option = new DialogModel();
    option.IsFull = true;
    option.FormModel = this.view.formModel;
    option.zIndex = 100;
    this.api
      .execSv<any>('BP', 'ERM.Business.BP', 'ProcessesBusiness', 'GetAsync', [
        dt?.processID,
      ])
      .subscribe((process) => {
        if (process) {
          let popup = this.callfc.openForm(
            ProcessReleaseDetailComponent,
            '',
            850,
            600,
            '',
            { data: dt, process: process },
            '',
            option
          );
        }
      });
  }

  openTask(data) {
    this.api
      .execSv<any>(
        'BP',
        'ERM.Business.BP',
        'ProcessInstancesBusiness',
        'GetTaskActivedByInstanceIDAsync',
        [data?.recID]
      )
      .subscribe((res) => {
        if (res && res[0] && res[1]) {
          var option = new SidebarModel();
          // option.FormModel = this.view.formModel; //Đợi có grid mở lên
          option.FormModel = {
            formName: 'BPTasks',
            gridViewName: 'grvBPTasks',
            entityName: 'BP_Tasks',
          };
          let privileged = true;
          if (res[0].permissions) {
            privileged = res[0].permissions.some(
              (x) => x.objectID == this.user.userID && x.objectType == 'U'
            );
          }
          option.zIndex = 1010;
          this.cache
            .gridViewSetup('BPTasks', 'grvBPTasks')
            .subscribe((grid) => {
              const obj = {
                data: res[0],
                action: 'edt',
                process: res[1],
                dataIns: res[2],
                privileged: privileged,
              };
              let popup = this.callfc.openSide(
                PopupBpTasksComponent,
                obj,
                option
              );
              popup.closed.subscribe((res) => {
                if (res && res.event?.data != null) {
                  // this.view.dataService.update(res.event, true).subscribe();
                  // this.dataSelected = JSON.parse(JSON.stringify(res.event));
                  // this.detectorRef.detectChanges();
                }
              });
            });
        }
      });
  }
}
