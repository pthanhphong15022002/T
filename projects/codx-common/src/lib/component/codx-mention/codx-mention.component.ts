import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FieldSettings, MentionComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ApiHttpService, CacheService, DataRequest } from 'codx-core';
import { Subject, takeUntil } from 'rxjs';

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
  }

  ngAfterViewInit(): void {
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // load(){
  //   if(!this.autoLoad) return;
  //   this.api.execSv("SYS","Core","DataBusiness","LoadDataCbxAsync",this.request)
  //   .pipe(takeUntil(this.destroy$))
  //   .subscribe((res:any) => {
  //     if(res)
  //     {
  //       let datas = JSON.parse(res[0]);
  //       if(datas.length > 0)
  //       {
  //         this.dataSource = this.dataSource.concat(datas);
  //         datas.forEach(item => {
  //           this.ej2Mention.addItem(item);
  //         });
  //         this.detectorRef.detectChanges();
  //       }
  //     }
  //   });
  // }

  // open(){
  //   let t = this;
  //   this.ej2Mention.element.querySelector('.e-content')
  //   .addEventListener('scroll',(e) => {
  //     this.onscroll(e,t);
  //   });
  // }

  // onscroll(ele:any,t:any){
  //   if (!t.loaded && ((ele.srcElement.scrollHeight -  ele.srcElement.scrollTop) < 350)) 
  //   {
  //     t.load();
  //   }
  // }
  
  // h = null;
  // filtering(event:any){
  //   this.request.searchText = event.text;
  //   if(this.h)
  //     clearTimeout(this.h);
  //   this.h = setTimeout(() => this.load() ,200);
  // }


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
