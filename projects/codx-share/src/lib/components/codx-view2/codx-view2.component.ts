import { AfterViewInit, Component, Input, OnInit, SimpleChanges, TemplateRef } from '@angular/core';
import { ApiHttpService, ButtonModel, CacheService, DataRequest, ViewModel, ViewType } from 'codx-core';
import { Observable } from 'rxjs';

@Component({
  selector: 'codx-view2',
  templateUrl: './codx-view2.component.html',
  styleUrls: ['./codx-view2.component.css']
})
export class CodxView2Component implements OnInit , AfterViewInit{
  @Input() tmpRightToolBar?: TemplateRef<any>;
  @Input() tmpHeader?: TemplateRef<any> = null;
  @Input() tmpItem?: TemplateRef<any>;

  @Input() service!: string;
  @Input() assemblyName = 'ERM.Business.Core';
  @Input() className = 'DataBusiness';
  @Input() method = 'LoadDataAsync';
  @Input() predicate: string = '';
  @Input() dataValue: string = '';
  @Input() predicates: string = '';
  @Input() dataValues: string = '';
  @Input() dataSource:any;
  @Input() bodyCss:any;
  
  request:DataRequest;
  viewList: Array<ViewModel> = [];
  fMoreFuncs: ButtonModel[];
  constructor(
    private cache: CacheService,
    private api: ApiHttpService,
  ) 
  {
    this.request = new DataRequest();
    this.request.page = 1;
    this.request.pageSize = 20
  }
  ngAfterViewInit(): void {
   
   const resizeObserver = new ResizeObserver(entries => 
    this.setHeight()
    );
    resizeObserver.observe(document.body);
  }

  setHeight()
  {
    var h = document.getElementById("view2-header").offsetHeight;
    alert(h);

    if(h > 0)
    {
      h += 90;
      let height = window.innerHeight - h;
      document.getElementById("codx-view2-body").style.cssText = "height:" +height+"px !important";
    }
    else
    {
      document.getElementById("codx-view2-body").removeAttribute("height");
    }
  }

  ngOnInit(): void {
    this.request.predicate = this.predicate;
    this.request.dataValue = this.dataValue;
    this.request.predicates = this.predicates;
    this.request.dataValues = this.dataValues;

    this.viewList = 
    [
      {
        id: '1',
        type: ViewType.card,
        active: true,
        sameData: true,
      },
      // {
      //   id: '2',
      //   type: ViewType.list,
      //   active: false,
      //   sameData: true,
      // },
    ];

    this.fMoreFuncs = [
      {
        id: 'id-select-multi',
        formName: 'System',
        text: 'Chọn nhiều dòng',
        disabled: false,
      },
      // {
      //   id: 'id-refresh',
      //   formName: 'System',
      //   text: 'Làm mới',
      //   disabled: true,
      // },
      {
        id: 'id-codx-open-setting',
        formName: 'System',
        text: 'Thiết lập',
        disabled: false,
      },
    ];
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['dataSource'] &&
      changes['dataSource']?.currentValue != changes['dataSource']?.previousValue
    ) 
    {
      this.dataSource = changes['dataSource']?.currentValue;
      if(!this.dataSource) this.loadData();
    }
  }

  loadData()
  {
    this.fetch().subscribe((item:any)=>{
      if(item && item.length > 0)
      {
        this.dataSource = item[0];
      }
    });
  }
  
  fetch(): Observable<any>
  {
    return this.api.execSv(
      this.service,
      this.assemblyName,
      this.className,
      this.method,
      this.request
    )
  }

  onSearch(e:any)
  {

  }
  
  viewChanged(e:any)
  {

  }
  
  sortChanged(e:any)
  {

  }
  
  clickToolbarMore(e:any)
  {

  }

}
