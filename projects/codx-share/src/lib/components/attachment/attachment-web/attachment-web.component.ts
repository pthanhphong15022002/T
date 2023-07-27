import { E } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { FileService } from '@shared/services/file.service';
import { FolderService } from '@shared/services/folder.service';
import { CodxTreeviewComponent, DialogData, DialogRef } from 'codx-core';
import { CodxShareService } from '../../../codx-share.service';

@Component({
  selector: 'lib-attachment-web',
  templateUrl: './attachment-web.component.html',
  styleUrls: ['./attachment-web.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AttachmentWebComponent implements AfterViewInit{
  @ViewChild('treeview') treeview: CodxTreeviewComponent;
  dialog : any;
  tab = 0;
  data:any;
  listData = [];
  listSelected = [];
  loaded = false;
  isScroll = true;
  countItems = 0;
  constructor(
    private shareService : CodxShareService,
    private folderService : FolderService,
    private fileService: FileService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.dialog = dialog;
    this.getData();
  }
  
  ngAfterViewInit(): void {
 
  }

  ngOnInit(): void {
    
  }

  close()
  {
    this.dialog.close();
  }

  activeTab(index:any)
  {
    this.tab = index;
  }

  getData()
  {
    this.folderService.getFolders("").subscribe((res) => {
      if(res && res[0])
      {
        this.folderService.options.pageLoading = true;
        this.folderService.getFolders(res[0][0].recID).subscribe(item=>{
          this.data = item[0];
          this.setDataService();
          this.loaded = true;
        });
      }
      else this.loaded = true;
    });
  }

  setDataService()
  {
    // this.treeview.dataService.service = "DM";
    // this.treeview.dataService.assemblyName = "DM";
    // this.treeview.dataService.className = "FolderBussiness";
    // this.treeview.dataService.method = "GetFoldersAsync";
    this.treeview.dataService.request.entityName = "DM_FolderInfo";
  }

  selectionChange(e:any)
  {
    if(e && e?.data)
    {
      this.countItems = 0;
      this.listSelected = [];
      this.listData = e?.data?.items
      this.getDataFiles(e?.data?.recID)
    }
    
  }

  selectedFiles(e:any , data:any)
  {
    if(e.data) {
      this.countItems ++;
      this.listSelected.push(data);
    }
    else {
      this.countItems --;
      this.listSelected = this.listSelected.filter(x=>x.recID != data.recID);
    }
  }

  getDataFiles(id:any)
  {
    if(!this.isScroll) return;
    this.fileService.GetFiles(id).subscribe((res) => {
      if (res && res[0])
      {
        this.listData = this.listData.concat(res[0]);
      }
    });
  }

  getSizeKB(item: any) {
    if (item.fileSize) {
      var kb = item.fileSize / 1024;
      return kb.toFixed(2).toString() + ' Kb';
    } else return '';
  }

  getThumbnail(data:any) {
    return `../../../assets/codx/dms/${this.shareService.getIconFile(data.extension)}`; //this.getAvatar(ext);
  }

  onSave()
  {
    this.dialog.close(this.listSelected);
  }
}
