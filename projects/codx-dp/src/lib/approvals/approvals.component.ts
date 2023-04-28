import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthStore, CacheService } from 'codx-core';
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
  lstDtDis: any;
  gridViewSetup: any;
  formModel: any;
  view: any = {};
  dataItem = {};
  dvlRelType: any;
  ms020: any;
  ms021: any;
  active = 1;
  referType = 'source';
  userID: any;
  transID='c6f87dcd-9a20-4661-b25f-3436bf532f42'
  approveStatus='0'

  constructor(
    private cache: CacheService,
    private codxDP: CodxDpService,
    private router: ActivatedRoute,
    private authStore : AuthStore,
    private layoutDP: LayoutComponent,
  ) {
    this.userID = this.authStore.get().userID;
  }
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnInit(): void {
    this.layoutDP.hidenNameProcess();
    this.router.params.subscribe((params) => {
      this.funcID = params['FuncID'];
      if (params['id']) this.getGridViewSetup(this.funcID, params['id']);
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

      this.getData(id);
    });
  }

  getData(id) {
    //id la cua noi dung instance
  }

  handleViewFile(e: any) {
    if (e == true) {
      var index = this.data.listInformationRel.findIndex(
        (x) => x.userID == this.userID && x.relationType != '1'
      );
      if (index >= 0) this.data.listInformationRel[index].view = '3';
    }
  }
}
