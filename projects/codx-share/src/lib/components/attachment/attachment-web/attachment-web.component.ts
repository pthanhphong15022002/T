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
 
  loaded = false;
  isScroll = true;
  countItems = 0;
  idParent:any;

  listData = [];
  listSelected = [];
  listBreadCum = [];

  constructor(
    private shareService : CodxShareService,
    private folderService : FolderService,
    private fileService: FileService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) 
  { 
    this.dialog = dialog;
    this.folderService.options.funcID = "DMT00";
    this.fileService.options.funcID = "DMT00";
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
    this.listSelected = [];
    this.listData = [];
    this.listBreadCum = [];
    this.countItems = 0;
    this.isScroll = true;
    //Tài liệu của tôi
    if(index == 1)
    {
      this.folderService.options.funcID = "DMT03";
      this.fileService.options.funcID = "DMT03";
      this.getDataMe("");
      this.getDataFiles("");
    }
    //Kho tài liệu
    else if(index == 0)
    {
      this.folderService.options.funcID = "DMT00";
      this.fileService.options.funcID = "DMT00";
      this.getDataMe(this.idParent);
    }
  }

  getData()
  {
    this.folderService.getFolders("").subscribe((res) => {
      if(res && res[0])
      {
        this.idParent = res[0][0].recID;
        this.folderService.options.pageLoading = true;
        this.getDataMe(this.idParent);
      }
      else this.loaded = true;
    });
  }

  getDataMe(id:any)
  {
    this.loaded = false;
    this.folderService.getFolders(id).subscribe((res) => {
      if(res && res[0])
      {
        this.data = res[0];
        this.setDataService();
        this.loaded = true;
        if(this.folderService.options.funcID == "DMT03")
        {
          this.listData = this.listData.concat(res[0]);
        }
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
      this.listData = e?.data?.items;
      this.getDataFiles(e?.data?.recID)
      var breadCumb = this.treeview.getBreadCumb(e?.data?.recID);
      this.listBreadCum = breadCumb.reverse();
    }
  }

  changeBreadCum(data:any)
  {
    this.treeview.getCurrentNode(data.id);
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

  selectedFolder(data:any)
  {
    if(!data.folderName) return;
    this.treeview.getCurrentNode(data.recID);
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
