import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthService, DialogData, DialogRef, ScrollComponent } from 'codx-core';

@Component({
  selector: 'lib-activies-slider',
  templateUrl: './activies-slider.component.html',
  styleUrls: ['./activies-slider.component.scss']
})
export class ActiviesSliderComponent implements OnInit {
  dialog: DialogRef;
  lstApproval:any[] = [];
  constructor
  (
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    private auth:AuthService,
    @Optional() dialog?: DialogRef,
    @Optional() data?: DialogData
  )
  {
    this.dialog = dialog;
  }

  ngOnInit(): void {
    this.getDataAsync();
  }

  ngAfterViewInit(){
    ScrollComponent.reinitialization();
  }
  pageIndex:number = 0;
  getDataAsync(){
    this.api.execSv(
      'BG',
      'ERM.Business.BG',
      'NotificationBusinesss',
      'GetApprovalAsync',
      [this.pageIndex]
    ).subscribe((res:any[]) => {
      if(res){
        this.lstApproval = res[0];
        this.dt.detectChanges();
      }
    });
  }
  clickCloseFrom(){
    this.dialog.close();
  }
  onScroll(event: any) 
  {
    
  }
}
