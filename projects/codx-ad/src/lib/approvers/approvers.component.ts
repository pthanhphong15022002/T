import { AddApproversComponent } from './add/add.component';
import { UIComponent, ViewModel, ViewType, ButtonModel, SidebarModel } from 'codx-core';
import { Component, OnInit, Injector, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'lib-approvers',
  templateUrl: './approvers.component.html',
  styleUrls: ['./approvers.component.css']
})
export class ApproversComponent extends UIComponent implements AfterViewInit {
  //#region Constructor
  views: Array<ViewModel> = [];
  button: ButtonModel = { id: 'btnAdd' };
  @ViewChild('itemTemplate') itemTemplate: TemplateRef<any>;
  constructor(injector: Injector) {
    super(injector);
  }
  //#endregion
  //#region  Init
  onInit(): void { }

  ngAfterViewInit(): void {
    this.views = [{
      type: ViewType.list,
      active: true,
      sameData: true,
      model: {
        template: this.itemTemplate
      }
    }]
  }
  //#endregion

  //#region event
  tbBtnclick(evt: ButtonModel) {
    switch (evt.id) {
      case 'btnAdd':
        this.add();
        break;
    }
  }

  moreFunction(e, data) {

  }

  clickItem(e) {

  }
  //#endregion

  //#region method
  add() {
    this.view.dataService.addNew().subscribe(res => {
      if (res) {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = "550px";
        let side = this.callfc.openSide(AddApproversComponent, null, option)
      }
    })
  }
  //#endregion
}
