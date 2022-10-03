import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { ApiHttpService, DialogData, DialogRef, FormModel } from 'codx-core';

@Component({
  selector: 'lib-post-search',
  templateUrl: './popup-search.component.html',
  styleUrls: ['./popup-search.component.scss']
})
export class PopupSearchPostComponent implements OnInit {

  @Input() formModel:FormModel = null;
  dialogRef:DialogRef = null;
  lstData:any[] = null;
  // portal
  lstUserTag:any[] = [];
  lstUserShare:any[] = [];
  CATEGORY = {
    POST: "1",
    COMMENTS: "2",
    FEEDBACK: "3",
    SHARE: "4",
  }
  constructor(
    private api:ApiHttpService,
    private dt:ChangeDetectorRef,
    @Optional() dialogData:DialogData,
    @Optional() dialogRef:DialogRef  
  )
  {
    this.dialogRef = dialogRef;
  }
  ngOnInit(): void {
  }

  searchAsync(searchValue:string){
    // this.api.execSv("WP","ERM.Business.WP","CommentsBusiness","GetListPostAsync",)
    // .subscribe((res:any) => {
    //   if(res)
    //   {
    //     this.lstData = res[0];
    //   }
    // })
  }

  valueChange(event:any){
    
  }
  clickClosePopup(){
    this.dialogRef.close();
  }

  showListTag(data:any)
  {

  }

  closeListTag(data:any)
  {

  }

  showListShare(data:any)
  {    
  
  }

  closeListShare(data:any)
  {

  }
  openEditModal(data:any)
  {

  }
  removePost(data:any)
  {

  }
  openModalShare(data:any)
  {

  }
  openModalDownload(data:any)
  {

  }
  clickViewDetail(event:any)
  {

  }
  naviagteWPNew(data:any){

  }
  getFiles(files:any, data:any)
  {

  }
}
