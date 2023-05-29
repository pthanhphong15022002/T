import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ApiHttpService, AuthStore, CallFuncService, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { FolderService } from '@shared/services/folder.service';
import { FileService } from '@shared/services/file.service';
import { CodxDMService } from '../../codx-dm.service';


@Component({
  selector: 'card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent implements OnInit , OnChanges {  

  @Input() formModel: any;
  user: any;
  totalRating: number;
  totalViews: number;
  favoriteID: any;
  viewc:number = 0;
  downc:number = 0;
  @Input() data: any;
  @Input() view: any;
  @Output() viewFile = new EventEmitter<any>();
  constructor(
    public dmSV: CodxDMService,
    private auth: AuthStore,
    private fileService: FileService,
    private folderService: FolderService,
    private notificationsService: NotificationsService
  ) {
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes["data"] && changes["data"].currentValue != changes["data"].previousValue )
    {
      this.data = changes["data"].currentValue ;
      if(this.data.fileName)
      {
        var arrName = this.data.fileName.split(".");
        if(arrName.length >1)
          arrName.splice((arrName.length - 1), 1);
        this.data.fileName = arrName.join('.')  + this.data.extension;
      }
    }
    this.viewc = this.dmSV.getViews(this.data.history); 
    this.downc = this.dmSV.showDownloadCount(this.data.countDownload)
  }

  ngOnInit(): void {
    this.user = this.auth.get();
    this.favoriteID = this.fileService.options.favoriteID;
    if(this.data.folderName)
      this.favoriteID = this.folderService.options.favoriteID;
  }
  
  classRating(rating) {    
    var ret = "icon-star text-warning icon-16";
    if (rating == 0)
      ret = ret + " text-muted";
    return ret;
  }

  print() {
    //this.view.print();
    window.frames[0].postMessage(JSON.stringify({ 'MessageId': 'Action_Print' }), '*');
  }
  clickMoreFunction(e,data:any)
  {
    if(e?.functionID == "DMT0210")
    {
      this.fileService.getFile(data.recID).subscribe(data => {
        if(data)
        {
          this.viewFile.emit(data);
          this.viewc += 1;
        }
      })
    }
    else this.dmSV.clickMF(e, data ,this.view)
    if(e?.functionID == "DMT0211") this.downc += 1;
  }
  dbView()
  {
    if(this.data?.recID && this.data?.fileName != null)
    {
      if (!this.data.read) {
        this.notificationsService.notifyCode("DM059");
        return;
      }
      this.fileService.getFile(this.data?.recID).subscribe((data) => {
        this.viewFile.emit(data);
      });
    }
    this.dmSV.openItem(this.data);
    this.viewc += 1;
  }
}