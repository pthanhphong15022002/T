import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService, FormModel } from 'codx-core';
import { CodxCmService } from '../codx-cm.service';
import { request } from 'http';
import { classNames } from '@syncfusion/ej2-angular-buttons';

@Component({
  selector: 'lib-cm-approval',
  templateUrl: './cm-approval.component.html',
  styleUrls: ['./cm-approval.component.css'],
})
export class CmApprovalComponent {
  funcID: any;
  itemDetailId: any;
  formModel: FormModel;
  data: any;

  constructor(
    private cache: CacheService,
    private cmService: CodxCmService,
    private router: ActivatedRoute
  ) {
    this.router.params.subscribe((params) => {
      this.funcID = params['funcID'];
      // this.itemDetailId = params['id'];
      if (this.funcID)
        this.cache.functionList(this.funcID).subscribe((fuc) => {
          this.formModel = {
            entityName: fuc?.entityName,
            formName: fuc?.formName,
            funcID: this.funcID,
            gridViewName: fuc?.gridViewName,
          };
        });
    });
  }

  ngOnInit(): void {
    this.router.params.subscribe((params) => {
      this.itemDetailId = params['id'];
      if (this.itemDetailId) {
        this.getDataDetail();
      }
    });
  }

  getDataDetail() {
    let classNames = 'QuotationsBusiness';
    this.cmService
      .loadDataApproverByID(this.itemDetailId, classNames)
      .subscribe((res) => {
        if (res) {
          this.data = res;
        }
      });
  }
}
