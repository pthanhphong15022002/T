import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogRef, DialogData, ApiHttpService } from 'codx-core';

@Component({
  selector: 'lib-setting-notify-drawer',
  templateUrl: './setting-notify-drawer.component.html',
  styleUrls: ['./setting-notify-drawer.component.scss']
})
export class SettingNotifyDrawerComponent implements OnInit {

  dialog: any;
  funcID:string ="";
  lstAlertRule:any[] = [];
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private route:ActivatedRoute,
    @Optional() dialog?: DialogRef,
    @Optional() dd?: DialogData
  ) 
  {
    this.dialog = dialog;
    this.funcID = dd.data;
  }

  ngOnInit(): void {
    this.getAlertRules();
  }

  getAlertRules(){
    this.api.execSv("SYS","ERM.Business.AD","AlertRulesBusiness","GetListAsync",this.funcID)
    .subscribe((res:any[]) => {
      console.log(res);
      this.lstAlertRule = res;
    })
  }

}
