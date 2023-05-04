import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore, ButtonModel, NotificationsService, UIComponent, ViewModel, ViewType } from 'codx-core';
import { JournalService } from '../journals/journals.service';

@Component({
  selector: 'lib-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css']
})
export class ApprovalsComponent extends UIComponent {
//#region Constructor
@ViewChild('itemTemplate') itemTemplate?: TemplateRef<any>;
views: Array<ViewModel> = [];
button: ButtonModel = {
  id: 'btnAdd',
};
functionName: string;
data : any = [];
vll86 = [];
vll85 = [];
func = [];
user: any;
dataValues:any;
cashpayment :any = [];
constructor(
  inject: Injector,
  private route: Router,
  private notiService: NotificationsService,
  private journalService: JournalService,
  private authstore: AuthStore
) {
  super(inject);
  this.user = this.authstore.get();
  this.dataValues = 'AC'+ ';' + this.user.userID;
}
//#region Constructor

//#region Init
onInit(): void {
  this.cache.valueList('AC077').subscribe((func) => {
    if (func) this.func = func.datas;
  });

  this.cache.valueList('AC086').subscribe((res) => {
    if (res) {
      this.vll86 = res.datas;
    }
  });
  this.cache.valueList('AC085').subscribe((res) => {
    if (res) {
      this.vll85 = res.datas;
    }
  });
}

ngAfterViewInit(): void {
  this.views = [
    {
      type: ViewType.smallcard,
      active: true,
      sameData: true,
      model: {
        template: this.itemTemplate,
      },
    },
  ];

  this.cache.functionList(this.view.funcID).subscribe((res) => {
    this.functionName =
      res.defaultName.charAt(0).toLowerCase() + res.defaultName.slice(1);
  });
}
//#region Init

//#region Events
clickMF(e, data) {
  switch (e.functionID) {
    case 'SYS02':
      //this.delete(data);
      break;
    case 'SYS03':
      //this.edit(data);
      break;
    case 'SYS04':
      //this.copy(e, data);
      break;
  }
  //#region Events
}
}
