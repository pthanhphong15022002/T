import { DialogData, DialogRef, UIComponent } from 'codx-core';
import { Component, Injector, OnInit, Optional } from '@angular/core';
import { CodxEpService } from 'projects/codx-ep/src/public-api';

@Component({
  selector: 'lib-popup-color-stationery',
  templateUrl: './popup-color-stationery.component.html',
  styleUrls: ['./popup-color-stationery.component.scss']
})
export class PopupColorStationeryComponent extends UIComponent {

  constructor(
    private injector: Injector,
    private epService: CodxEpService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(injector)
  }

  onInit(): void {
  }

}
