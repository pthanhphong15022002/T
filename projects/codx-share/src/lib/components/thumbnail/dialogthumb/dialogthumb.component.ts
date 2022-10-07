import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AnimationSettingsModel, DialogComponent } from '@syncfusion/ej2-angular-popups';

@Component({
  selector: 'lib-dialogthumb',
  templateUrl: './dialogthumb.component.html',
  styleUrls: ['./dialogthumb.component.css']
})
export class DialogthumbComponent implements OnInit {
  @Input()  dataFile:any = {};
  @Output() dialogClosed = new EventEmitter();

  @ViewChild('Dialog') public Dialog: DialogComponent;
  animationSettings: AnimationSettingsModel = { effect: 'None' };
  constructor() { }

  ngOnInit(): void {
  }

  public dlgBtnClick = (dialog: any): void => {
    //this.Dialog.refresh();
    this.Dialog.hide();  
  }

  afterClose(evt: any){
    debugger
    this.dialogClosed.emit(this);
    this.Dialog.destroy();
  }

}
