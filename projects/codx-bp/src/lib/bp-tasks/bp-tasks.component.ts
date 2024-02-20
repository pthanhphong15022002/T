import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupBpTasksComponent } from './popup-bp-tasks/popup-bp-tasks.component';

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

  dataSelected: any;
  hidenMF: boolean = false;
  constructor(inject: Injector) {
    super(inject);
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

  clickMF(e, data) {}

  dbClickEvent(e) {
    if (e && e?.data) {
      this.popupTasks(e, 'edit');
    }
  }

  popupTasks(e, action) {
    var option = new SidebarModel();
    // option.FormModel = this.view.formModel; //Đợi có grid mở lên
    option.FormModel = {
      formName: 'BPTasks',
      gridViewName: 'grvBPTasks',
      entityName: 'BP_Tasks',
    };
    option.zIndex = 1010;
    this.cache.gridViewSetup('BPTasks', 'grvBPTasks').subscribe((grid) => {
      debugger;
      const obj = {
        data: e?.data,
        action: action,
        process: e?.process,
        dataIns: e?.dataIns,
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
