import { AfterViewInit, ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiHttpService, CacheService, NotificationsService, AuthStore, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'co-popup-template',
  templateUrl: './popup-template.component.html',
  styleUrls: ['./popup-template.component.css']
})
export class PopupTemplateComponent implements OnInit, AfterViewInit{
  
  user:any = null;
  formModel:FormModel = null;
  dialogData:any = null;
  dialogRef:DialogRef = null;
  data:any = null;
  active = "1";
  searchText:string = "";
  constructor
  (
    private api:ApiHttpService,
    private cache:CacheService,
    private notiService:NotificationsService,
    private auth : AuthStore,
    private changeDetectorRef:ChangeDetectorRef,
    @Optional() dt: DialogData,
    @Optional() dr: DialogRef
  ) 
  {
    this.user = auth.get();
    this.dialogData = dt.data;
    this.dialogRef = dr;
    this.formModel = dr.formModel;
  }
  
  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
  }


  //nav Changed
  navChanged(event:any){

  }

}
