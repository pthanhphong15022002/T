import { Component, Injector, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef, UIComponent } from 'codx-core';

@Component({
  selector: 'codx-notify-drawer',
  templateUrl: './notify-drawer.component.html',
})
export class NotifyDrawerComponent extends UIComponent implements OnInit {
  
  dialog:any ;
  constructor(
    private inject:Injector,
    @Optional() dialog: DialogRef,
    @Optional() dt: DialogData
  ) 
  { super(inject);
    this.dialog = dialog;
  }

  onInit(): void {
    
  }
}
