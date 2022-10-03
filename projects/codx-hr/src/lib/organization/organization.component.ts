import {
  Component,
  Injector,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  ButtonModel,
  CodxTreeviewComponent,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { PopupAddOrganizationComponent } from './popup-add-organization/popup-add-organization.component';

@Component({
  selector: 'lib-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.css'],
})
export class OrgorganizationComponent extends UIComponent {
  views: Array<ViewModel> = [];
  button?: ButtonModel;
  orgUnitID: string = '';
  parentID: string = '';
  detailComponent: any;
  treeComponent?: CodxTreeviewComponent;
  currentView: any;
  @ViewChild('templateTree') templateTree: TemplateRef<any>;
  @ViewChild('templateDetail') templateDetail: TemplateRef<any>;
  constructor(inject: Injector) {
    super(inject);
  }

  onInit(): void {
    this.button = {
      id: 'btnAdd',
    };
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

  orgChartAfterView(evt: any) {
    this.detailComponent = evt;
  }

  onSelectionChanged(evt: any) {
    if (evt && evt.data && this.orgUnitID != evt.data.orgUnitID) {
      this.orgUnitID = evt.data.orgUnitID;
      this.parentID = evt.data.parentID;
      this.detectorRef.detectChanges();
    }
  }

  click(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  add() {
    this.currentView = this.view.currentView;
    if (this.currentView)
      this.treeComponent = this.currentView.currentComponent?.treeView;
    this.view.dataService.addNew().subscribe(() => {
      let option = new SidebarModel();
      option.Width = '550px';
      option.DataService = this.view?.currentView?.dataService;
      option.FormModel = this.view?.formModel;
      var dialog = this.callfc.openSide(
        PopupAddOrganizationComponent,
        {
          function: this.view.function,
          orgUnitID: this.orgUnitID,
          detailComponent: this.detailComponent,
          treeComponent: this.treeComponent,
        },
        option
      );
    });
  }

  changeView(evt: any) {}
}
