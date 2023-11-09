import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiHttpService, AuthStore, CacheService, NotificationsService } from 'codx-core';

@Component({
  selector: 'co-popup-add-meeting',
  templateUrl: './popup-add-meeting.component.html',
  styleUrls: ['./popup-add-meeting.component.css']
})
export class PopupAddMeetingComponent implements OnInit, AfterViewInit {

  
  user:any = null;
  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private notiService:NotificationsService,
    private auth : AuthStore,
    private dt:ChangeDetectorRef
  )
  {
    this.user = auth.get();
  }
  ngOnInit(): void {
  }
  ngAfterViewInit(): void {
  }

}
