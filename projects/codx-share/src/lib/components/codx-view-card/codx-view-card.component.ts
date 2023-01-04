import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'codx-view-card',
  templateUrl: './codx-view-card.component.html',
  styleUrls: ['./codx-view-card.component.css']
})
export class CodxViewCardComponent implements OnInit {

  @Input() card:any = null
  file:any = null;
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if(this.card)
    {
      this.getFilepattern(this.card.patternID);
    }
  }


  // Get card
  getFilepattern(patternID:string){
    if(patternID){
      this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByIbjectIDAsync',
        [patternID])
        .subscribe((res:any) => {
          if (res) 
          {
            this.file = res;
            this.dt.detectChanges();
          }
      })
    }
  }
}
