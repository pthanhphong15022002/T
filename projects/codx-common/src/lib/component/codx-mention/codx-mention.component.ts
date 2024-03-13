import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MentionComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ApiHttpService, CacheService, DataRequest } from 'codx-core';

@Component({
  selector: 'codx-mention',
  templateUrl: './codx-mention.component.html',
  styleUrls: ['./codx-mention.component.css']

})
export class CodxMentionComponent implements OnInit, AfterViewInit{

  @Input() targetId:string = "";
  dataSource:any[] = [];
  request:DataRequest = new DataRequest();
  page:number = 0;
  pageSize:number= 20;

  @ViewChild("ej2Mention") ej2Mention:MentionComponent;
  constructor
  (
    private api:ApiHttpService,
    private cacheService:CacheService,
    private detectorRef:ChangeDetectorRef
  ) 
  {
    
  }
  
  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    
  }
  
  loaded:boolean = false;
  load(){
    this.request.comboboxName = "Users";
    this.request.page = this.page + 1;
    this.request.pageSize = this.pageSize;
    this.request.pageLoading = true;
    let t = this;
    this.api.execSv("SYS","Core","DataBusiness","LoadDataCbxAsync",this.request)
    .subscribe((res:any) => {
      if(res)
      {
        let datas = JSON.parse(res[0]);
        if(datas && datas.length > 0)
        {
          t.dataSource = t.dataSource.concat(datas);
          datas.forEach(item => {
            this.ej2Mention.addItem(item);
          });
          t.detectorRef.detectChanges();
        }
      }
      this.page = this.page + 1;
      t.loaded = false;
    });
  }

  open(){
    let t = this;
    this.ej2Mention.element.querySelector('.e-content')
    .addEventListener('scroll',(e) => {
      this.onscroll(e,t);
    });
  }

  onscroll(ele:any,t:any){
    if (!t.loaded && ((ele.srcElement.scrollHeight -  ele.srcElement.scrollTop) < 350)) 
    {
      t.load();
      t.loaded = true;
      t.detectorRef.detectChanges();
    }
  }

  select(event:any){
    debugger
  }
}
