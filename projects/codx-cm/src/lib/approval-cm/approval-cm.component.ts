import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, CacheService, FormModel } from 'codx-core';

@Component({
  selector: 'lib-approval-cm',
  templateUrl: './approval-cm.component.html',
  styleUrls: ['./approval-cm.component.css'],
})
export class ApprovalCmComponent implements OnInit {
  userID: any;
  funcID: any;
  recIDAprrover: any;
  formModel: any;

  constructor(
    private authStore: AuthStore,
    private router: ActivatedRoute,
    private cache: CacheService
  ) {
    this.userID = this.authStore.get().userID;
    this.router.params.subscribe((params) => {
      this.funcID = params['FuncID'];
      this.recIDAprrover = params['id'];
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
    throw new Error('Method not implemented.');
  }
}
