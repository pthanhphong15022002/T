import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { ApiHttpService, CacheService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'hr-popup-add-holiday-type',
  templateUrl: './popup-add-holiday-type.component.html',
  styleUrls: ['./popup-add-holiday-type.component.css']
})
export class PopupAddHolidayTypeComponent implements OnInit{
  data:any = null;
  dialog:DialogRef = null;
  fromModel:FormModel = null;

  constructor(
    private api:ApiHttpService,
    private cache:CacheService,
    private detectorRef:ChangeDetectorRef,
    @Optional() dialogData:DialogData,
    @Optional() dialogRef:DialogRef
  ) 
  {
    this.data = dialogData.data;
    this.dialog = dialogRef;
    this.fromModel = dialogRef.formModel;
  }

  ngOnInit(): void {
  }


}
