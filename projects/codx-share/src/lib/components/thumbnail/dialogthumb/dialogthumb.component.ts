import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AnimationSettingsModel, DialogComponent } from '@syncfusion/ej2-angular-popups';

@Component({
  selector: 'lib-dialogthumb',
  templateUrl: './dialogthumb.component.html',
  styleUrls: ['./dialogthumb.component.css']
})
export class DialogthumbComponent implements OnInit , OnChanges{
  @Input()  dataFile:any = {};
  @Output() dialogClosed = new EventEmitter();

  @ViewChild('Dialog') public Dialog: DialogComponent;
  animationSettings: AnimationSettingsModel = { effect: 'None' };
  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes["dataFile"] && changes["dataFile"].currentValue != changes["dataFile"].previousValue )
      this.dataFile = changes["dataFile"].currentValue 
  }

  ngOnInit(): void {
  }

  public dlgBtnClick = (dialog: any): void => {
    //this.Dialog.refresh();
    this.Dialog.hide();  
  }

  afterClose(evt: any){
    this.dialogClosed.emit(this);
    this.Dialog.destroy();
  }

}
