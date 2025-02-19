import { AddApproversComponent } from './add/add.component';
import {
  UIComponent,
  ViewModel,
  ViewType,
  ButtonModel,
  SidebarModel,
  RequestOption,
} from 'codx-core';
import {
  Component,
  OnInit,
  Injector,
  AfterViewInit,
  ViewChild,
  TemplateRef,
  ChangeDetectorRef,
} from '@angular/core';

@Component({
  selector: 'lib-approvers',
  templateUrl: './approvers.component.html',
  styleUrls: ['./approvers.component.css'],
})
export class ApproversComponent extends UIComponent implements AfterViewInit {
  //#region Constructor
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [{ id: 'btnAdd' }];
  func: any;

  //Start Tooltip
  resources: Array<any> = [];
  resourcesCount: number = 0;
  resouscesSearch: Array<any> = [];
  popoverCrr: any;
  //End tooltip
  moreFuncName: string = '';
  itemSelected:any;
  
  @ViewChild('item2') itemTemplate: TemplateRef<any>;
  constructor(
    injector: Injector,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    super(injector);
  }
  //#endregion
  //#region  Init
  onInit(): void {
    this.cache.moreFunction('CoDXSystem', '').subscribe((res) => {
      if (res && res.length) {
        let m = res.find((x) => x.functionID == 'SYS01');
        if (m) this.moreFuncName = m.defaultName;
      }
    });
  }

  ngAfterViewInit(): void {
    this.views = [
      {
        type: ViewType.list,
        active: true,
        sameData: true,
        model: {
          template: this.itemTemplate,
        },
      },
    ];
    this.changeDetectorRef.detectChanges();
    this.cache.functionList(this.view.formModel.funcID).subscribe((res) => {
      if (res) this.func = res;
    });
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

  moreFunction(e: any, data) {
    switch (e.functionID) {
      case 'SYS02':
        this.delete(data);
        break;
      case 'SYS03':
        this.edit(data, e.text);
        break;
      case 'SYS04':
        this.copy(data, e.text);
        break;
    }
  }

  popoverEmpList(e, data) {
    if (this.popoverCrr) {
      if (this.popoverCrr.isOpen()) this.popoverCrr.close();
    }
    this.resources = data.members;
    console.log(this.resources);
    this.resourcesCount = data.members.length;
    e.open();
  }

  searchName(e) {
    var resouscesSearch = [];
    if (e.trim() == '') {
      this.resouscesSearch = this.resources;
      return;
    }

    this.resources.forEach((res) => {
      var name = res.resourceName;
      if (name.toLowerCase().includes(e.toLowerCase())) {
        resouscesSearch.push(res);
      }
    });
    this.resouscesSearch = resouscesSearch;
  }
  //#endregion

  //#region method
  add() {
    this.view.dataService.addNew().subscribe((res) => {
      if (res) {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '550px';
        let action = 'add';
        let title = this.moreFuncName + ' ' + this.func.description;
        let side = this.callfc.openSide(
          AddApproversComponent,
          [title, action],
          option
        );
        side.closed.subscribe((x) => {
          if (x.event == null) {
            if (this.view.dataService.hasSaved) {
              this.view.dataService
                .delete([this.view.dataService.dataSelected], false)
                .subscribe();
            }
          } else {
            this.view.dataService.dataSelected.members = x.event.members;
            this.view.dataService.dataSelected.memberIDs = x.event.memberIDs;
            if (this.view.dataService.hasSaved) {
              this.view.dataService
                .update(this.view.dataService.dataSelected)
                .subscribe();
            } else {
              this.view.dataService.add(x.event).subscribe();
            }
          }
          this.view.dataService.hasSaved = false;

          this.view.dataService.clear();
        });
      }
    });
  }

  edit(data, text) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.edit(data).subscribe((res) => {
      let option = new SidebarModel();
      option.DataService = this.view.dataService;
      option.FormModel = this.view.formModel;
      option.Width = '550px';
      let action = 'edit';
      let title = text + ' ' + this.func.description;
      let side = this.callfc.openSide(
        AddApproversComponent,
        [title, action],
        option
      );
      side.closed.subscribe((x) => {
        if (x.event == null) this.view.dataService.clear();
        else {
          this.view.dataService.update(x.event).subscribe();
        }
      });
    });
  }

  copy(data, text) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.copy().subscribe((res) => {
      if (res) {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '550px';
        let action = 'add';
        let title = text + ' ' + this.func.description;
        let side = this.callfc.openSide(
          AddApproversComponent,
          [title, action],
          option
        );
        side.closed.subscribe((x) => {
          if (x.event == null && this.view.dataService.hasSaved)
            this.view.dataService
              .delete([this.view.dataService.dataSelected])
              .subscribe();
        });
      }
    });
  }

  delete(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService
      .delete([data], true, (option: RequestOption) =>
        this.beforeDelete(option)
      )
      .subscribe();
  }
  //#endregion

  //#region  method
  beforeDelete(opt: RequestOption) {
    opt.service = 'SYS';
    opt.assemblyName = 'AD';
    opt.className = 'UserGroupsBusiness';
    opt.methodName = 'DeleteAsync';
    opt.data = [
      this.view.dataService.dataSelected.recID,
      this.view.dataService.dataSelected['groupID'],
    ];
    return true;
  }
  //#endregion

  selectedChange(val:any)
  {
    this.itemSelected = val?.data;
  }
}
