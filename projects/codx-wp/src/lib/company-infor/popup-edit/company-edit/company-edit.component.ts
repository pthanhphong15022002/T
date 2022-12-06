import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Permission } from '@shared/models/file.model';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { ApiHttpService, AuthService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { WP_News } from '../../../models/WP_News.model';

@Component({
  selector: 'app-company-edit',
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.scss']
})
export class CompanyEditComponent implements OnInit {

  data:WP_News = null;
  dateStart: Date;
  dateEnd: Date;
  subContent: string;
  isVideo = true;
  newsType: any;
  dataOld:any ;
  user:any;
  dialogRef: DialogRef;
  formGroup: FormGroup;
  dialogData:any;
  dataEdit:any;
  constructor(
    private api:ApiHttpService,
    private auth: AuthService,
    private dt:ChangeDetectorRef,
    private notifySvr:NotificationsService,
    private sanitizer: DomSanitizer,
    @Optional() dialog?: DialogData,
    @Optional() dialogRef?: DialogRef
    ) 
  {
    this.dialogRef = dialogRef;
    this.dialogData = dialog.data;
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    if(this.dialogData){
      this.data = this.dialogData;
    }
    else
    {
      this.data = new WP_News();
    }
  }

  valueChange(event: any) {
    if(event)
    {
      this.data.contents = event.data;
      this.dt.detectChanges();
    }
    
  }

  clickInsertNews(){
    if(this.data){
        this.api
        .execSv(
          'WP',
          'ERM.Business.WP',
          'NewsBusiness',
          'InsertCompanyinfoAsync',
          [this.data]
        ).subscribe((res:any) => {
          if(res)
          {
            this.dataOld = {...res};
            this.dialogRef.close(this.dataOld);
          }
        });
      }
    }
}
