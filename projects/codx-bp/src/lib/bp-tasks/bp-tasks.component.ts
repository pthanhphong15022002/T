import { AfterViewInit, Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UIComponent, ViewModel, ViewType } from 'codx-core';

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
}
