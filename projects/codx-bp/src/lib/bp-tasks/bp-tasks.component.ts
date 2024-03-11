import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AuthStore,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupBpTasksComponent } from './popup-bp-tasks/popup-bp-tasks.component';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'lib-bp-tasks',
  templateUrl: './bp-tasks.component.html',
  styleUrls: ['./bp-tasks.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BpTasksComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplateList') headerTemplateList?: TemplateRef<any>;
  @ViewChild('templateMore') templateMore: TemplateRef<any>;
  views: Array<ViewModel> = [];
  user: any;

  dataSelected: any;
  hidenMF: boolean = false;
  constructor(
    inject: Injector,
    private codxShareService: CodxShareService,
    private auth: AuthStore
  ) {
    super(inject);
    this.user = this.auth.get();
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
      {
        type: ViewType.grid,
        active: false,
        sameData: true,
        model: {
          template2: this.templateMore,
        },
      },
    ];
    this.detectorRef.detectChanges();
  }

  selectedChange(data: any) {
    this.dataSelected = data?.data ? data?.data : data;
    this.detectorRef.detectChanges();
  }

  clickMF(e, data) {
    this.dataSelected = data;
    switch (e.functionID) {
      case 'BPT0601':
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

  changeDataMF(e, data) {
    if (e != null && data != null) {
      e.forEach((res) => {
        switch (res.functionID) {
          case 'BPT0601':
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

  dbClickEvent(e) {
    if (e && e?.data) {
      this.popupTasks(e, 'edit');
    }
  }

  popupTasks(e, action) {
    if (e?.process != null && e?.dataIns) {
      var option = new SidebarModel();
      // option.FormModel = this.view.formModel; //Đợi có grid mở lên
      option.FormModel = {
        formName: 'BPTasks',
        gridViewName: 'grvBPTasks',
        entityName: 'BP_Tasks',
      };
      let privileged = true;
      if (e?.data?.permissions) {
        privileged = e?.data?.permissions.some(
          (x) => x.objectID == this.user.userID && x.objectType == 'U'
        );
      }
      option.zIndex = 1010;
      this.cache.gridViewSetup('BPTasks', 'grvBPTasks').subscribe((grid) => {
        const obj = {
          data: e?.data,
          action: action,
          process: e?.process,
          dataIns: e?.dataIns,
          privileged: privileged,
        };
        let popup = this.callfc.openSide(PopupBpTasksComponent, obj, option);
        popup.closed.subscribe((res) => {
          if (res && res.event != null) {
            this.view.dataService.update(res.event, true).subscribe();
            this.dataSelected = JSON.parse(JSON.stringify(res.event));
            this.detectorRef.detectChanges();
            // this.detectorRef.markForCheck();
          }
        });
      });
    }
  }
}
