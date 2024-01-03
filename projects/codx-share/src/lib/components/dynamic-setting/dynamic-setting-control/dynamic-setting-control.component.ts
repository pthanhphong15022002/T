import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { DataRequest, UIComponent } from 'codx-core';

@Component({
  //standalone:true,
  selector: 'dynamic-setting-control',
  templateUrl: './dynamic-setting-control.component.html',
  styleUrls: ['./dynamic-setting-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicSettingControlComponent extends UIComponent{
  //#region Contrucstor
  @Input() setting: any = [];
  @Input() dataValue: any = {};
  @Output() valueChanges: EventEmitter<any> = new EventEmitter();
  oldDataValue: any = {};
  constructor(
    private inject: Injector,
  ) {
    super(inject);
  }
  //#endregion Contrucstor

  //#region Init
  onInit() {
  }

  ngDoCheck() {
    this.detectorRef.detectChanges();
  }
  //#endregion Init

  //#region Event
  valueChange(event:any,data: any){
    this.valueChanges.emit(event);
  }

  openPopup(evt: any, item: any, reference: string = '') {

  }

  openSub(evt: any, data: any, dataValue: any) {

  }

  collapseItem(evt: any, setting: any) {

  }
  //#endregion Event

  //#region Function
  //#endregion Function
}
