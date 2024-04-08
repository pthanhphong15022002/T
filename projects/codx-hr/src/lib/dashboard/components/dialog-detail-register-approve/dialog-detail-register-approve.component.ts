import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogComponent, DialogModule } from '@syncfusion/ej2-angular-popups';
import { EmitType } from '@syncfusion/ej2-base';
import { HistoryLevelComponent } from './components/history-level/history-level.component';

@Component({
  selector: 'lib-dialog-detail-register-approve',
  templateUrl: './dialog-detail-register-approve.component.html',
  styleUrls: ['./dialog-detail-register-approve.component.scss'],
  standalone:true,
  imports:[DialogModule,CommonModule, HistoryLevelComponent]
})
export class DialogDetailRegisterApproveComponent implements OnInit {
  @ViewChild('ejDialog') ejDialog: DialogComponent | any;
  public animationSettings: Object = { effect: 'SlideRight', duration: 400, delay: 0 };
  public isShow: boolean = false;
  constructor() { }
  ngOnInit() {

  }
  public onOpenDialog(event:any):void{
    this.isShow = true;
    if(this.ejDialog){
      this.ejDialog.show();
    }
  };
  public onOverlayClick: EmitType<object> = () => {
    this.isShow = false;
    this.ejDialog.hide();
  }

  public onBeforeOpen(args:any):void{
    args.maxHeight = '100vh';
  }
}
