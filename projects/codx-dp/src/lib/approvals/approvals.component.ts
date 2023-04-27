import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CacheService } from 'codx-core';
import { CodxDpService } from '../codx-dp.service';
import { ActivatedRoute } from '@angular/router';

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
  constructor(
    private cache: CacheService,
    private codxDP: CodxDpService,
    private router: ActivatedRoute
  ) {}
  ngOnChanges(changes: SimpleChanges): void {}
  ngOnInit(): void {
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

  getData(id) {}
}
