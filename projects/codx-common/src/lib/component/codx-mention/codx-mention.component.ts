import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MentionComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ApiHttpService, CacheService, DataRequest } from 'codx-core';

@Component({
  selector: 'codx-mention',
  templateUrl: './codx-mention.component.html',
  styleUrls: ['./codx-mention.component.css']

})



export class CodxMentionComponent implements OnInit, AfterViewInit{

  @Input() targetId:string = "";
  @Input() predicates:string = "";
  @Input() dataValues:string = "";
  @Output() selectedChange = new EventEmitter();

  dataSource:any[] = [];
  request:DataRequest;

  
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
    this.request = new DataRequest();
    this.request.comboboxName = "Users";
    this.request.pageLoading = true;
    this.request.page = 0;
    this.request.pageSize = 20;
    
  }

  ngAfterViewInit(): void {
    
  }
  
  loaded:boolean = false;
  totalPage:number = 0;
  load(){
    if(this.request.page > this.totalPage) return;
    this.loaded = true;
    this.request.page++;
    this.api.execSv("SYS","Core","DataBusiness","LoadDataCbxAsync",this.request)
    .subscribe((res:any) => {
      if(res)
      {
        let datas = JSON.parse(res[0]);
        if(datas.length > 0)
        {
          this.dataSource = this.dataSource.concat(datas);
          this.totalPage = Math.ceil(res[1]/this.request.pageSize);
          this.loaded = false;
          datas.forEach(item => {
            this.ej2Mention.addItem(item);
          });
          this.detectorRef.detectChanges();
        }
      }
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
    }
  }

  dataSelected:any[];
  select(event:any){
    if(event)
    {
      this.dataSelected.push(event.itemData);
      this.selectedChange.emit(this.dataSelected);
    }
  }

  filtering(event){
    this.request.searchText = event.text;
    this.load();
  }


}
