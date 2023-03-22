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
import { CacheService, Util } from 'codx-core';
import {
  convertHtmlAgency,
  convertHtmlAgency2,
  extractContent,
  formatDtDis,
} from 'projects/codx-od/src/lib/function/default.function';
import { DispatchService } from 'projects/codx-od/src/lib/services/dispatch.service';
import { CodxHrService } from '../codx-hr.service';

@Component({
  selector: 'lib-approvel-hr',
  templateUrl: './approvel-hr.component.html',
  styleUrls: ['./approvel-hr.component.css'],
})
export class ApprovelHrComponent implements OnInit,  AfterViewInit, OnChanges{
  extractContent = extractContent
    convertHtmlAgency = convertHtmlAgency2
    data:any;
    funcID: any;
    lstDtDis: any;
    gridViewSetup: any;
    formModel: any;
    view:any = {}
    dataItem = {}
    dvlRelType: any;
    ms020: any;
    ms021: any;
    active = 1;
  constructor(
    private cache: CacheService,
    private hrService: CodxHrService,
    private router : ActivatedRoute
  ) {}

  ngOnChanges(changes: SimpleChanges, ): void { }
  ngOnInit(): void {
    debugger
    this.router.params.subscribe((params) => {
      this.funcID = params['FuncID'];
      if(params['id']) this.getGridViewSetup(this.funcID , params['id']);
    });
   
  }

  ngAfterViewInit(): void {
   
  }
 
  getGridViewSetup(funcID:any, id:any)
  {
    this.cache.functionList(funcID).subscribe((fuc) => {
      this.formModel = 
      {
        entityName : fuc?.entityName,
        formName : fuc?.formName,
        funcID : funcID,
        gridViewName : fuc?.gridViewName
      }
    
      this.getDtDis(id);
    });
  
  }
  getDtDis(id: any) {
    this.data = null;
    if(id)
    {
      // this.odService.getDetailDispatch(id,this.formModel?.entityName,true).subscribe((item) => {
      //   //this.getChildTask(id);
      //   if (item) {
      //     this.data = formatDtDis(item);
      //     //this.view.dataService.setDataSelected(this.lstDtDis);
      //   }
      // });
    }
  }
  getSubTitle(relationType:any , agencyName:any , shareBy: any )
  {
    if(relationType == "1") return Util.stringFormat(this.ms020?.customName, this.fmTextValuelist(relationType,"6"), agencyName);
    return Util.stringFormat(this.ms021?.customName, this.fmTextValuelist(relationType,"6"),shareBy);
  }
  fmTextValuelist(val: any, type: any) {
    var name = "";
    try {
      switch (type) {
       
        case "6":
          {
            var data = this.dvlRelType?.datas.filter(function (el: any) { return el.value == val });
            return data[0].text;
          }
       
      }
      return name;
    }
    catch (ex) {
      return "";
    }
  } 
  openFormFuncID(val: any , datas:any = null) {
  }
}
