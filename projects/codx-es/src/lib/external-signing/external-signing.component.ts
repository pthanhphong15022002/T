import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxEsService } from '../codx-es.service';
import { ApiHttpService, AuthStore } from 'codx-core';

@Component({
  selector: 'lib-external-signing',
  templateUrl: './external-signing.component.html',
  styleUrls: ['./external-signing.component.scss'],
})
export class ExternalSigningComponent implements OnInit {
  transRecID: string;
  oApprovalTrans: any = {};
  isAfterRender: boolean = false;
  user: import("codx-core").UserModel;

  constructor(
    private esService: CodxEsService,
    private api: ApiHttpService,
    private auth: AuthStore,
    private activedRouter: ActivatedRoute
  ) {
    this.transRecID = this.activedRouter.snapshot.params['id'];
    this.user = this.auth.get();
    //this.transRecID = this.activedRouter.snapshot.queryParams['recID'];
  }

  ngOnInit(): void {
    this.api.execSv("SYS","AD","UsersBusiness","CreateUserNoLoginAsync","").subscribe((item:any)=>{
      if(item) this.auth.set(item);
      this.esService.getOneApprovalTrans(this.transRecID).subscribe((res) => {
        if (res) {
          this.oApprovalTrans = res;
          this.isAfterRender = true;
        }
      });
    });
    
  }

  changeConfirmState(event) {}

  changeActiveOpenPopup(event) {}

  changeSignerInfo(event) {}
}
