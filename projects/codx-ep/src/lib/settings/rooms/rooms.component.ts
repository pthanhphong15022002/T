import { Component, TemplateRef, ViewChild, Injector } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  ButtonModel,
  DialogRef,
  SidebarModel,
  UIComponent,
  ViewModel,
  ViewsComponent,
  ViewType,
} from 'codx-core';
import { PopupAddRoomsComponent } from './popup-add-rooms/popup-add-rooms.component';
@Component({
  selector: 'setting-rooms',
  templateUrl: 'rooms.component.html',
  styleUrls: ['rooms.component.scss'],
})
export class RoomsComponent extends UIComponent {
  @ViewChild('view') viewBase: ViewsComponent;
  funcID: string;
  service: string = 'EP';
  assemblyName: string = 'EP';
  entityName: string = 'EP_Resources';
  className: string = 'ResourcesBusiness';
  method: string = 'GetListAsync';
  predicate: string = 'ResourceType=@0';
  dataValue: string = '1';

  constructor(private injector: Injector) {
    super(injector);
    this.funcID = this.router.snapshot.params['funcID'];
  }

  onInit(): void {}

  ngAfterViewInit(): void {
    // if (this.viewBase)
    //   this.viewBase.dataService.methodDelete = 'DeleteResourceAsync';
  }
}
