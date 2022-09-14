import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Permission } from '@shared/models/file.model';
import { ApiHttpService, AuthService, CallFuncService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { WP_News } from '../../../models/WP_News.model';

@Component({
  selector: 'app-company-edit',
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.scss']
})
export class CompanyEditComponent implements OnInit {

  data:any;
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
    private callFunc:CallFuncService,
    private notifySvr:NotificationsService,
    private dmSV:CodxDMService,
    private sanitizer: DomSanitizer,
    @Optional() dialog?: DialogData,
    @Optional() dialogRef?: DialogRef
    ) 
  {
    this.dialogRef = dialogRef;
    this.dataOld = dialog.data
    this.user = this.auth.userValue;
  }

  ngOnInit(): void {
    this.data = this.dataOld;
    this.dt.detectChanges();
  }

  valueChange(event: any) {
    this.data.contents = event.data;
    this.dt.detectChanges();
  }

  clickInsertNews(){
    this.api
      .execSv(
        'WP',
        'ERM.Business.WP',
        'NewsBusiness',
        'InsertCompanyinfoAsync',
        [this.data,this.dataOld.recID]
      )
      .subscribe((res) => {
        if(res)
        {
          this.dataOld = res;
          this.dataOld.contentHtml = this.sanitizer.bypassSecurityTrustHtml(this.data.contents);
          this.dialogRef.close(this.dataOld);
          this.dt.detectChanges();
          this.notifySvr.notifyCode('E0026');
        }
      });
    }
}
