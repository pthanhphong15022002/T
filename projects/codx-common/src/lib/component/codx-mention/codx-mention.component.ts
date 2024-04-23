import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FieldSettings, MentionComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ApiHttpService, CacheService, DataRequest } from 'codx-core';
import { Subject, map, takeUntil } from 'rxjs';

@Component({
  selector: 'codx-mention',
  templateUrl: './codx-mention.component.html',
  styleUrls: ['./codx-mention.component.css']

})



export class CodxMentionComponent implements OnInit, AfterViewInit,OnDestroy{

  @Input() targetId:string = "";
  @Input() dataSource:any[] = []
  @Input() autoLoad:boolean = false;
  @Input() fields:FieldSettings
  @Output() selectedChange = new EventEmitter<any>();

  request:DataRequest;
  destroy$ = new Subject<void>();
  
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
    this.request.page = 1;
    this.request.pageSize = 20;
    if(this.autoLoad)
    {
      this.load();
    }
  }

 
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    if(this.ej2Mention)
    {
      let t = this;
      this.ej2Mention.element
      .querySelector('.e-content')
      .addEventListener('scroll',(e) => {
        this.onscroll(e,t);
      }); 
    }
  }

  load(){
    this.api.execSv("SYS","Core","DataBusiness","LoadDataCbxAsync",this.request)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:any) => {
      if(res)
      {
        let datas = JSON.parse(res[0]);
        if(datas?.length > 0)
        {
          if(!this.dataSource)
          {
            this.dataSource = [...datas];
          }
          else
          {
            // datas.forEach((item:any) => this.ej2Mention.addItem(item));
            this.dataSource = this.dataSource.concat(datas);
          }
          this.detectorRef.detectChanges();
        }
      }
    });
  }

  onscroll(ele:any,t:any){
    if (!t.loaded && ((ele.srcElement.scrollHeight -  ele.srcElement.scrollTop) < 350)) 
    {
      debugger
    }
  }
  
  h = null;
  filtering(event:any){
    this.request.searchText = event.text;
    if(this.h)
      clearTimeout(this.h);
    this.h = setTimeout(() => this.load() ,200);
  }


  dataSelected:any[] = [];
  change(event:any){
    if(event)
    {
      if(!this.dataSelected) this.dataSelected = [];
      this.dataSelected.push(event.itemData);
      this.selectedChange.emit(event);
    }
  }

}
