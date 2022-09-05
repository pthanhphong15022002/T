import {
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ButtonModel, UIComponent, ViewModel, ViewType } from 'codx-core';

@Component({
  selector: 'lib-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
})
export class OrgorganizationComponent extends UIComponent {
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  orgUnitID: string = '';
  @ViewChild('templateTree') templateTree: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail: TemplateRef<any>;
  constructor(inject: Injector) {
    super(inject);
  }

  onInit(): void {
    // this.button = {
    //   id: 'btnAdd',
    // };
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.treedetail,
        sameData: true,
        active: true,
        model: {
          resizable: true,
          template: this.templateTree,
          panelRightRef: this.templateDetail,
        },
      },
    ];
    this.view.dataService.parentIdField = 'ParentID';
    this.detectorRef.detectChanges();
  }

  onSelectionChanged(evt: any) {
    if (evt && evt.data) {
      this.orgUnitID = evt.data.orgUnitID;
      this.detectorRef.detectChanges();
    }
  }

  changeView(evt: any) {}
}
