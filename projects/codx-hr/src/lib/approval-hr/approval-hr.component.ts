import {
  Component,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  Injector,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Input } from '@syncfusion/ej2-angular-inputs';
import { CacheService, DataRequest, Util } from 'codx-core';
import {
  convertHtmlAgency,
  convertHtmlAgency2,
  extractContent,
  formatDtDis,
} from 'projects/codx-od/src/lib/function/default.function';
import { DispatchService } from 'projects/codx-od/src/lib/services/dispatch.service';
import { CodxHrService } from '../codx-hr.service';

@Component({
  selector: 'lib-approval-hr',
  templateUrl: './approval-hr.component.html',
  styleUrls: ['./approval-hr.component.css'],
})
@ViewChild
export class ApprovalHrComponent implements OnInit, AfterViewInit, OnChanges {
  extractContent = extractContent;
  convertHtmlAgency = convertHtmlAgency2;
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
  referType = 'source'

  constructor(
    private cache: CacheService,
    private hrService: CodxHrService,
    private router: ActivatedRoute
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {}
  ngOnInit(): void {
    this.router.params.subscribe((params) => {
      this.funcID = params['FuncIDs'];
      console.log('funcccc id', this.funcID);
      
      if (params['id']) this.getGridViewSetup(this.funcID, params['id']);
    });
    console.log('asdasdasdasd');
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

      this.getDetailContract(id);
    });
  }
  getDetailContract(id: any) {
    this.data = null;
    if (id) {
      let request = new DataRequest();
      request.entityName = this.formModel.entityName;
      request.predicate = 'RecID=@0';
      request.dataValue = id;
      request.pageLoading = false;
      this.hrService.loadData('HR', request).subscribe((res) => {
        if (res) {
          console.log('object hdld',res);
          this.data = res[0][0];
          console.log('data hdld', this.data);
          
        }
      });
    }
  }
  getSubTitle(relationType: any, agencyName: any, shareBy: any) {
    if (relationType == '1')
      return Util.stringFormat(
        this.ms020?.customName,
        this.fmTextValuelist(relationType, '6'),
        agencyName
      );
    return Util.stringFormat(
      this.ms021?.customName,
      this.fmTextValuelist(relationType, '6'),
      shareBy
    );
  }
  fmTextValuelist(val: any, type: any) {
    var name = '';
    try {
      switch (type) {
        case '6': {
          var data = this.dvlRelType?.datas.filter(function (el: any) {
            return el.value == val;
          });
          return data[0].text;
        }
      }
      return name;
    } catch (ex) {
      return '';
    }
  }
  openFormFuncID(val: any, datas: any = null) {}
}
