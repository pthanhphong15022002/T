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
import { convertHtmlAgency2, extractContent, formatDtDis } from '../../function/default.function';
import { DispatchService } from '../../services/dispatch.service';


@Component({
  selector: 'app-od-approvel',
  templateUrl: './approvel.component.html',
  styleUrls: ['./approvel.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ODApprovelComponent
  implements OnInit , AfterViewInit, OnChanges {

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
    referType = 'source'
  constructor(
    private cache: CacheService,
    private odService: DispatchService,
    private router : ActivatedRoute
  ) {
  
  }
  ngOnChanges(changes: SimpleChanges, ): void { }
  ngOnInit(): void {
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

      this.odService.getDetailDispatch(id,this.formModel?.entityName,this.referType,true).subscribe((item) => {
        //this.getChildTask(id);
        if (item) {
          this.data = formatDtDis(item);
          //this.view.dataService.setDataSelected(this.lstDtDis);
        }
      });
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
       
        // Trạng thái RelationType
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
