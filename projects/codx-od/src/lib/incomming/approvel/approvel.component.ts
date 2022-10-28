import {
  Component,
  TemplateRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  Injector,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CacheService, Util } from 'codx-core';
import { convertHtmlAgency2, extractContent, formatDtDis } from '../../function/default.function';
import { DispatchService } from '../../services/dispatch.service';


@Component({
  selector: 'app-od-approvel',
  templateUrl: './approvel.component.html',
  styleUrls: ['./approvel.component.scss'],
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
  constructor(
    private cache: CacheService,
    private odService: DispatchService,
    private router : ActivatedRoute
  ) {
  
  }
  ngOnChanges(changes: SimpleChanges, ): void { }
  ngOnInit(): void {
    this.router.params.subscribe((params) => {
      this.funcID = params['funcID'];
      if(params['id']) this.getDtDis(params['id']);
      //this.getGridViewSetup(funcId);
    });
  }

  ngAfterViewInit(): void {
   
  }
 
  getGridViewSetup(funcID:any)
  {
    debugger;
    this.cache.functionList(funcID).subscribe((fuc) => {
      this.formModel = 
      {
        entityName : fuc?.entityName,
        formName : fuc?.formName,
        funcID : funcID,
        gridViewName : fuc?.gridViewName
      }
      this.view.formModel = this.formModel;
      this.cache
        .gridViewSetup(fuc?.formName, fuc?.gridViewName)
        .subscribe((grd) => {
          this.gridViewSetup = grd;
        })
    });
    this.cache.message("OD020").subscribe(item=>{
      this.ms020 = item;
    })
    this.cache.message("OD021").subscribe(item=>{
      this.ms021 = item;
    })
    this.cache.valueList("OD008").subscribe((item) => {
      this.dvlRelType = item;
    })
  }
  getDtDis(id: any) {
    this.data = null;
    if(id)
    {
      this.odService.getDetailDispatch(id,this.formModel?.entityName).subscribe((item) => {
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
