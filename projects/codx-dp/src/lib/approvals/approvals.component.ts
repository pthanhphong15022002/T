import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { ApiHttpService, AuthStore, CacheService } from 'codx-core';
import { CodxDpService } from '../codx-dp.service';
import { ActivatedRoute } from '@angular/router';
import { LayoutComponent } from '../_layout/layout.component';

@Component({
  selector: 'app-dp-approvals',
  templateUrl: './approvals.component.html',
  styleUrls: ['./approvals.component.css'],
})
export class ApprovalsComponent implements OnInit, AfterViewInit, OnChanges {
  // extractContent = extractContent;
  // convertHtmlAgency = convertHtmlAgency2;
  data: any;
  funcID: any;
  // lstDtDis: any;
  // gridViewSetup: any;
  formModel: any;
  active = 1;
  referType = 'source';
  userID: any;
  transID = '28666dd2-2a40-4777-837e-12fb9ef5b956';
  approveStatus = '0';

  constructor(
    private cache: CacheService,
    private codxDP: CodxDpService,
    private router: ActivatedRoute,
    private authStore: AuthStore,
    private layoutDP: LayoutComponent,
    private changeDetectorRef: ChangeDetectorRef,
    private api: ApiHttpService
  ) {
    this.userID = this.authStore.get().userID;
  }
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnInit(): void {
    this.layoutDP.hidenNameProcess();
    this.router.params.subscribe((params) => {
      this.funcID = params['FuncID'];
      if (params['id']) this.getGridViewSetup(this.funcID, params['id']);
      this.getData(params['id']);
    });
  }

  ngAfterViewInit(): void {}

  getGridViewSetup(funcID: any, id: any) {
    this.cache.functionList(funcID).subscribe((fuc) => {
      this.formModel = {
        entityName: fuc?.entityName,
        formName: fuc?.formName,
        funcID: funcID,
        gridViewName: fuc?.gridViewName,
      };
    });
  }

  getData(id) {
    //id la cua noi dung instance
    this.api
      .exec<any>('DP', 'InstancesBusiness', 'GetInstancesDetailByRecIDAsync', [
        id,
      ])
      .subscribe((res) => {
        if (res) {
          this.data = res[0];
          this.transID = res[1];
          this.approveStatus = this.data?.approveStatus ?? '0';
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  handleViewFile(e: any) {
    // if (e == true) {
    //   var index = this.data.listInformationRel.findIndex(
    //     (x) => x.userID == this.userID && x.relationType != '1'
    //   );
    //   if (index >= 0) this.data.listInformationRel[index].view = '3';
    // }
  }
}
