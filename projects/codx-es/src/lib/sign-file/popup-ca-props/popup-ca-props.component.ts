import { Component, Injector, OnInit, Optional } from '@angular/core';
import { UIComponent, AuthStore, DialogData, DialogRef } from 'codx-core';
import { CodxEsService } from '../../codx-es.service';

@Component({
  selector: 'lib-popup-ca-props',
  templateUrl: './popup-ca-props.component.html',
  styleUrls: ['./popup-ca-props.component.scss'],
})
export class PopupCaPropsComponent extends UIComponent {
  constructor(
    private inject: Injector,
    private esService: CodxEsService,
    private authStore: AuthStore,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    super(inject);
    this.dialog = dialog;
    this.data = dt.data;
  }

  data;
  title: string;
  funcID;
  dialog;

  stt;
  failReasons;

  onInit(): void {
    this.title = this.data.title;
    this.stt = this.data.status;
    this.failReasons = this.data.vertifications;
    this.detectorRef.detectChanges();
  }

  saveDialog() {
    this.dialog.close();
  }
}
