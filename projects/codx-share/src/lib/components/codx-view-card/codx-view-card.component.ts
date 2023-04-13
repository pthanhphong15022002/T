import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { environment } from 'src/environments/environment';
import { CodxShareService } from '../../codx-share.service';

@Component({
  selector: 'codx-view-card',
  templateUrl: './codx-view-card.component.html',
  styleUrls: ['./codx-view-card.component.css']
})
export class CodxViewCardComponent implements OnInit {

  @Input() card:any = null;
  @Input() objectID:string = "";
  file:any = null;
  constructor(
    private api:ApiHttpService,
    private codxShareSV:CodxShareService,
    private dt:ChangeDetectorRef
  ) 
  {

  }

  ngOnInit(): void {   
    this.getFilepattern(this.card.pattern);
  }


  // Get pattern
  getFilepattern(patternID:string){
    if(patternID)
    {
      debugger
      this.api
      .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByIbjectIDAsync',
        [patternID])
        .subscribe((res:any[]) => {
          if(res){
            res.forEach(x => {
              if(x.referType === 'image')
              {
                x["source"] = this.codxShareSV.getThumbByUrl(x.url,900);
              }
            })
            this.file = res[0];
            this.dt.detectChanges();
          }
      })
    }
  }
}
