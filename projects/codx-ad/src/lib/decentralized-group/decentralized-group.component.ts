import { Component, Injector, TemplateRef, ViewChild } from '@angular/core';
import {
  ButtonModel,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewType,
} from 'codx-core';
import { AddDecentralGroupMemComponent } from './add-decentral-group-mem/add-decentral-group-mem.component';
import { CodxAdService } from '../codx-ad.service';

@Component({
  selector: 'lib-decentralized-group',
  templateUrl: './decentralized-group.component.html',
  styleUrls: ['./decentralized-group.component.scss'],
})
export class DecentralizedGroupComponent extends UIComponent {
  views: Array<ViewModel> = [];
  button: ButtonModel[] = [{ id: 'btnAdd' }];
  @ViewChild('item') itemTemplate: TemplateRef<any>;

  //predicate for groupType 3: nhom phan quyen
  groupType = '3';
  moreFuncName: string = '';
  func: any;
  itemSelected: any;
  constructor(private inject: Injector, private adService: CodxAdService) {
    super(inject);
  }
  onInit() {}
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
    this.detectorRef.detectChanges();
    this.cache.functionList(this.view.formModel.funcID).subscribe((res) => {
      if (res) this.func = res;
    });
  }
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
        this.deleteGroup(data);
        break;
      case 'SYS03':
        this.edit(data, e.text);
        break;
      case 'SYS04':
        // this.copy(data, e.text);
        break;
    }
  }

  add() {
    this.view.dataService.addNew().subscribe((res) => {
      if (res) {
        let option = new SidebarModel();
        option.DataService = this.view.dataService;
        option.FormModel = this.view.formModel;
        option.Width = '850px';
        let title = this.moreFuncName + ' ' + this.func.description;
        let dialogAddGroup = this.callfc.openSide(
          AddDecentralGroupMemComponent,
          {
            title: title,
            formType: 'add',
          },
          option
        );
        dialogAddGroup.closed.subscribe((e) => {
          this.view.dataService.update(e.event).subscribe((data) => {
            console.log('event', e);
          });
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
      option.Width = '850px';
      let title = text + ' ' + this.func.description;
      let side = this.callfc.openSide(
        AddDecentralGroupMemComponent,
        {
          title: title,
          formType: 'edit',
        },
        option
      );
      side.closed.subscribe((x) => {
        if (x.event) {
          this.view.dataService.update(x.event).subscribe();
        }
        this.view.dataService.clear;
      });
    });
  }

  deleteGroup(data) {
    this.view.dataService.dataSelected = data;
    this.view.dataService.delete([data]).subscribe((res2) => {
      console.log('res2', res2);
      if (res2) {
        this.adService.removeGroupAsync(data.groupID).subscribe((res) => {
          this.detectorRef.detectChanges();
        });
      }
    });
  }

  selectedChange(val: any) {
    this.itemSelected = val.data;
  }
}
