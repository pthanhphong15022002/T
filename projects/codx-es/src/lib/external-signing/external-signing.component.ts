import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxEsService } from '../codx-es.service';
import { ApiHttpService, AuthStore } from 'codx-core';
import { CodxShareService } from 'projects/codx-share/src/lib/codx-share.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-external-signing',
  templateUrl: './external-signing.component.html',
  styleUrls: ['./external-signing.component.scss'],
})
export class ExternalSigningComponent implements OnInit {
  transRecID: string;
  oApprovalTrans: any = {};
  isAfterRender: boolean = false;
  user: import('codx-core').UserModel;
  fileURL = null;

  constructor(
    private esService: CodxEsService,
    private shareService: CodxShareService,
    private api: ApiHttpService,
    private auth: AuthStore,
    private cr: ChangeDetectorRef,
    private activedRouter: ActivatedRoute
  ) {
    this.transRecID = this.activedRouter.snapshot.params['id'];
    this.user = this.auth.get();
    //this.transRecID = this.activedRouter.snapshot.queryParams['recID'];
  }

  ngOnInit(): void {
    this.api
      .execSv('SYS', 'AD', 'UsersBusiness', 'CreateUserNoLoginAsync', '')
      .subscribe((item: any) => {
        if (item) {
          this.auth.set(item);
          this.loadSF();
        }
      });
  }
  loadSF() {
    this.esService.getOneApprovalTrans(this.transRecID).subscribe((res:any) => {
      if (res) {
        this.oApprovalTrans = res;
        if (res?.status == '3') {
          //Chưa duyệt/từ chối
          this.isAfterRender = true;
          this.cr.detectChanges();
        } else {
          this.shareService
            .getFileByObjectID(this.oApprovalTrans?.transID)
            .subscribe((file) => {
              if (file) {
                this.fileURL = environment.urlUpload + '/' + file[0]?.pathDisk;
                this.isAfterRender = true;
                this.cr.detectChanges();
              }
            });
        }
      }
    });
  }
  changeConfirmState(event) {
    this.isAfterRender = false;
    this.cr.detectChanges();
    if(event){
      setTimeout(() => this.loadSF(), 2000);
    }
    else{
      this.loadSF()
    }
  }

  changeActiveOpenPopup(event) {}

  changeSignerInfo(event) {}
}
