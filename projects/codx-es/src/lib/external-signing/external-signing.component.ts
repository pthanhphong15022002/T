import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxEsService } from '../codx-es.service';

@Component({
  selector: 'lib-external-signing',
  templateUrl: './external-signing.component.html',
  styleUrls: ['./external-signing.component.scss'],
})
export class ExternalSigningComponent implements OnInit {
  transRecID: string;
  oApprovalTrans: any = {};
  isAfterRender: boolean = false;

  constructor(
    private esService: CodxEsService,
    private activedRouter: ActivatedRoute
  ) {
    this.transRecID = this.activedRouter.snapshot.params['id'];
    console.log(this.transRecID);
  }

  ngOnInit(): void {
    this.esService.getOneApprovalTrans(this.transRecID).subscribe((res) => {
      if (res) {
        this.oApprovalTrans = res;
        this.isAfterRender = true;
      }
    });
  }

  changeConfirmState(event) {}

  changeActiveOpenPopup(event) {}

  changeSignerInfo(event) {}
}
