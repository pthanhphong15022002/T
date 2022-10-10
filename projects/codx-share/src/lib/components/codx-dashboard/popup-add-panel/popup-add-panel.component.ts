import { Component, Optional } from "@angular/core";
import { NotificationsService, ApiHttpService, DialogData, DialogRef } from "codx-core";

@Component({
  selector: 'popup-add-panel',
  templateUrl: './popup-add-panel.component.html',
  styleUrls: ['./popup-add-panel.component.scss'],
})
export class PopupAddPanelComponent {
  data!: any;
  dialog: any;
  constructor(
    private notiService: NotificationsService,
    private api: ApiHttpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
    )
  {
    //this.dataID = dt?.data[];
    this.data = dt?.data;
    this.dialog = dialog;

  }

  valueChange(evt:any){
    this.data[evt.field] = evt.data;
  }
  saveForm(){
    this.dialog && this.dialog.close(this.data);
  }
}
