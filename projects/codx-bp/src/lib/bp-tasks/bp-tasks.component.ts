import {
  AfterViewInit,
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { SidebarModel, UIComponent, ViewModel, ViewType } from 'codx-core';
import { PopupBpTasksComponent } from './popup-bp-tasks/popup-bp-tasks.component';

@Component({
  selector: 'lib-bp-tasks',
  templateUrl: './bp-tasks.component.html',
  styleUrls: ['./bp-tasks.component.css'],
})
export class BpTasksComponent
  extends UIComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('templateList') templateList?: TemplateRef<any>;
  @ViewChild('headerTemplateList') headerTemplateList?: TemplateRef<any>;
  views: Array<ViewModel> = [];

  dataSelected: any;

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
    ];
  }

  selectedChange(data: any) {
    this.dataSelected = data?.data ? data?.data : data;
    this.detectorRef.detectChanges();
  }

  dbClickEvent(e) {
    if (e && e?.data) {
      this.popupTasks(e?.data, 'edit');
    }
  }

  popupTasks(data, action) {
    var option = new SidebarModel();
    // option.FormModel = this.view.formModel; //Đợi có grid mở lên
    option.FormModel = {
      formName: 'BPTasks',
      gridViewName: 'grvBPTasks',
      entityName: 'BP_Tasks',
    };
    option.zIndex = 1010;
    this.cache
      .gridViewSetup(
        'BPTasks',
        'grvBPTasks'
      )
      .subscribe((grid) => {
        const obj = { data: data, action: action };
        let popup = this.callfc.openSide(PopupBpTasksComponent, obj, option);
        popup.closed.subscribe((res) => {});
      });
  }
}
