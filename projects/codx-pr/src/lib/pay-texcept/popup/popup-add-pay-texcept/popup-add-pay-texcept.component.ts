import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';

@Component({
  selector: 'lib-popup-add-pay-texcept',
  templateUrl: './popup-add-pay-texcept.component.html',
  styleUrls: ['./popup-add-pay-texcept.component.css']
})
export class PopupAddPayTexceptComponent implements OnInit,AfterViewInit {

  user:any;
  dialog:DialogRef;
  data:any;
  headerText:string;
  constructor
  (
    private api:ApiHttpService,
    private cache:CacheService,
    private notiSV:NotificationsService,
    private dt:ChangeDetectorRef,
    private auth:AuthStore,
    @Optional() dialogRef:DialogRef,
    @Optional() dialogData:DialogData
  ) 
  {
    
  }
  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }


  onSave(){
    
  }
}
