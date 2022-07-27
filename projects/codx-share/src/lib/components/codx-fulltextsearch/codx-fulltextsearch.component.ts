import { Component, OnInit, AfterViewInit,  OnChanges, SimpleChanges, Input, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, CacheService, DataRequest } from 'codx-core';
import { convertHtmlAgency, extractContent, getIdUser } from 'projects/codx-od/src/lib/function/default.function';
@Component({
  selector: 'codx-fulltextsearch',
  templateUrl: './codx-fulltextsearch.component.html',
  styleUrls: ['./codx-fulltextsearch.component.scss']
})

export class CodxFullTextSearch implements OnInit , OnChanges , AfterViewInit  {
  extractContent = extractContent;
  convertHtmlAgency = convertHtmlAgency;
  getIdUser = getIdUser;
  gridViewSetup: any;
  dataGroup = [];
  firstCbb = [];
  countCbb = 0;
  filter = {};
  searchData:any;
  count = 0;
  txtSearch = "";
  @Input() widthLeft = 300;
  @Input() widthRight : any;
  @Input() centerTmp?: TemplateRef<any>;
  @Input() rightTmp?: TemplateRef<any>;
  @Input() funcID: any;
  constructor( 
    private router: ActivatedRoute,
    protected cache: CacheService,
    private api: ApiHttpService,
  ) 
  { 

  }
  ngAfterViewInit(): void {
    //debugger;
  }
  ngOnInit(): void {
    if(!this.funcID)
      this.router.params.subscribe((params) => {
        this.funcID = params['funcID'];
        if(this.funcID)     this.getGridViewSetup();
      });
    this.getGridViewSetup();
    this.searchText(this.txtSearch);
  }
  ngOnChanges(changes: SimpleChanges): void {
  }

  getGridViewSetup(){
   
    this.cache.functionList(this.funcID).subscribe((fuc) => {
      this.cache
      .gridViewSetup(fuc?.formName, fuc?.gridViewName)
      .subscribe((grd) => {
        this.gridViewSetup = grd;
        this.formatGridView(grd);
      });
    });
  }
  formatGridView(grd:any)
  {
    var key = Object.keys(grd);
  
    for(var i = 0 ; i< key.length ; i++)
    {
      if(grd[key[i]]?.fullTextSearch)
      {
        //vll && cbb
        if(grd[key[i]]?.referedType == "2" || grd[key[i]]?.referedType=="3")
        {
          var obj = {
            referedType : grd[key[i]]?.referedType,
            headerText: grd[key[i]]?.headerText,
            data: grd[key[i]]?.headerText
          };
          this.getDataByRefValue(grd[key[i]]?.referedType, grd[key[i]]?.referedValue,obj , key[i])
        }
        else 
        {
          var objn = {
            dataType :  grd[key[i]]?.dataType,
            headerText : grd[key[i]]?.headerText,
            view: key[i]
          };
          objn.headerText = grd[key[i]]?.headerText;
          this.dataGroup.push(objn);
        }
      }
    }
  }
  getDataByRefValue(type:any,refValue:any,data:any , key :any)
  {
    let a= new DataRequest();
    a.comboboxName = refValue;
    a.page = 1;
    a.pageSize = 5;
    //vll
    if(type == "2")
      this.cache.valueList(refValue).subscribe(item=>{
        if(item)
        {
          var res = item?.datas
          var result = [];
          res.forEach(element => {
            var obj = 
            {
              id : element?.value,
              name : element?.text,
              view : key
            }
            result.push(obj);
          });
          data.data = result;
          this.dataGroup.push(data);
        }
      })
    //cbb
    else if(type == "3")
      this.cache.combobox(refValue).subscribe(cbb=>{
        this.api.execSv("OD","CM","DataBusiness","LoadDataCbxAsync",a).subscribe((item)=>{
          if(item)
          {
            var res = JSON.parse(item[0]);
            this.countCbb += res.length;
            var result = [];
            res.forEach(element => {
              var obj = 
              {
                id : element[cbb?.viewMember],
                name : element[cbb?.valueMember],
                view : cbb?.viewMember
              }
              result.push(obj);
            });
            data.data = result;
            //this.innerHTML(html , arrayCbb);
            this.dataGroup.push(data);
          }
        }) as any;
      })
  }
  changeValueText(view: any , e: any)
  {
   
    var data = e?.data; 
    this.filter[view]=[data];
    this.searchText(this.txtSearch);
  } 
  changeValueCbb(id:any = "" , view: any , e:any)
  {
    var data = e?.data; 

    if(!(view in this.filter))
      this.filter[view] = [];

    if(data && !this.filter[view].includes(id))
      this.filter[view].push(id); 
    else
      this.filter[view] = this.filter[view].filter(function(e) { return e !== id }); 
    //debugger;
    this.searchText(this.txtSearch);
  }
  searchText(val:any)
  {
    this.txtSearch = val;
    this.api.execSv<any>("OD","OD", "DispatchesBusiness", "SearchFullTextAdvAsync",
    {
      query: val,
      filter: this.filter,
      functionID:  this.funcID,
      entityName: "OD_Dispatches",
      page: 1,
      pageSize: 5
    }).subscribe((item) => {
      if(item)
      {
        this.count = 0;
        this.searchData = item;
        if(item[1]) this.count = item[1];
      }
    });
  }
  aaa(e:any)
  {
    debugger;
  }
}
