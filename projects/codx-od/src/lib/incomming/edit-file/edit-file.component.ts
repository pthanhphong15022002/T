import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { FileUpload } from '@shared/models/file.model';
import { FileService } from '@shared/services/file.service';
import { lvFileClientAPI } from '@shared/services/lv.component';
import { DocumentEditorContainerComponent } from '@syncfusion/ej2-angular-documenteditor';
import { ClickEventArgs } from '@syncfusion/ej2-angular-navigations';
import { ApiHttpService, AuthService, AuthStore, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { AttachmentComponent } from 'projects/codx-common/src/lib/component/attachment/attachment.component';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { Observable, from, mergeMap } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-edit-file',
  templateUrl: './edit-file.component.html',
  styleUrls: ['./edit-file.component.scss']
})
export class EditFileComponent implements OnInit{
  headerText:any;
  dialog:any;
  serviceUrl: any;
  isContentChange = false;
  showInsert = false;
  formModel:any;
  data:any;
  dataFile:any;
  user:any;
  fileItem:any = {};
  isWord=false;
  @ViewChild('documenteditor_default')
  public container: DocumentEditorContainerComponent;
  @ViewChild('attachment1') attachment1: AttachmentComponent;
  constructor(
    private api: ApiHttpService,
    private auth: AuthService,
    private authStore: AuthStore,
    private dmSV: CodxDMService,
    private fileService: FileService,
    private notiSer: NotificationsService,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.headerText = dt?.data?.headerText;
    this.formModel = dt?.data?.formModel;
    this.data = dt?.data?.data
  }

  ngOnInit(): void {
    this.user = this.authStore.get();    
    let baseurl: string = environment.apiUrl + '/api/documenteditor/import';
      baseurl +=
        '?sk=' +
        btoa(
          this.auth.userValue.userID + '|' + this.auth.userValue.securityKey
        );
      this.serviceUrl = baseurl;
    this.getData();
  }

  getData()
  {
    this.api.execSv("DM","DM","FileBussiness","GetFileByOORAsync",[this.data.recID , this.formModel.entityName, "source"]).subscribe((item:any)=>{
      if(item && item.extension.includes('doc'))
      {
        this.isWord = true;
        this.dataFile = item;
        this.loadContentWord(item?.pathDisk)
      }
    })
  }

  onCreate() {
    this.container.toolbarItems = this.container.toolbarItems.filter(
      (x) => x != 'New' && x != 'Open'
    );
    // document.getElementById("listview").addEventListener("dragstart", function (event) {
    //   event.dataTransfer.setData("Text", (event.target as any).innerText);
    //   (event.target as any).classList.add('de-drag-target');
    // });
    this.container.documentEditor.element.addEventListener(
      'dragover',
      function (event) {
        event.preventDefault();
      }
    );


    document.addEventListener('dragend', (event) => {
      if ((event.target as any).classList.contains('de-drag-target')) {
        (event.target as any).classList.remove('de-drag-target');
      }
    });
  }

  onDocumentChange() {
    this.isContentChange = true;
    this.container.documentEditor.resize();
  }

  toolbarClick = (args: ClickEventArgs): void => {
    switch (args.item.id) {
      case 'InsertField':
        this.showInsertFielddialog();
        break;
    }
  };

  onWrapText(text: string): string {
    let content: string = '';
    let index: number = text.lastIndexOf(' ');
    content = text.slice(0, index);
    text.slice(index);
    content += '<div class="e-de-text-wrap">' + text.slice(index) + '</div>';
    return content;
  }

  showInsertFielddialog() {
    this.showInsert = !this.showInsert;
    this.container.documentEditor.focusIn();
  }

  loadContentWord(url: any, uploadId: any = null) {
    let http: XMLHttpRequest = new XMLHttpRequest();
    let content = { fileUrl: url };
    http.withCredentials = true;
    http.open('Post', this.serviceUrl, true);
    http.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    http.onreadystatechange = () => {
      if (http.readyState === 4) {
        if (http.status === 200 || http.status === 304) {
          //open the SFDT text in Document Editor
          this.container.documentEditor.open(http.responseText);
        } else {
          //this.notificationsService.notifyCode("DM065");
        }
      }
    };
    //this.container.documentEditor.documentName = this.data?.fileName;
    http.send(JSON.stringify(content));
  }

  async onSave()
  {
    if(!this.isContentChange) 
    {
      this.notiSer.notifyCode("SYS007");
      this.dialog.close();
      return;
    }
    
    this.onSaveWord().subscribe(async (saveW) => {
     if(saveW.status == 0)
     {
      var uploadFile = this.fileItem.item.rawFile;
      var sizeInBytes = this.fileItem.fileSize; // uploadFile.size;
      var chunSizeInfBytes = this.dmSV.ChunkSizeInKB * 1024;
      var numOfChunks = Math.floor(this.fileItem.fileSize / chunSizeInfBytes);
      if (this.fileItem.fileSize % chunSizeInfBytes > 0) {
        numOfChunks++;
      }

      //api/lv-docs/files/upload
      for (var i = 0; i < numOfChunks; i++) {
        var start = i * chunSizeInfBytes; //Vị trí bắt đầu băm file
        var end = start + chunSizeInfBytes; //Vị trí cuối
        if (end > sizeInBytes) end = sizeInBytes; //Nếu điểm cắt cuối vượt quá kích thước file chặn lại
        var blogPart = uploadFile.slice(start, end); //Lấy dữ liệu của chunck dựa vào đầu cuối
        var fileChunk = new File([blogPart], uploadFile.name, {
          type: uploadFile.type,
        }); //Gói lại thành 1 file chunk để upload
        await lvFileClientAPI.formPostWithToken(
          `api/${this.user.tenant}/files/upload`,
          {
            FilePart: fileChunk,
            UploadId: this.fileItem.uploadId,
            Index: i,
          }
        );
      }  
     }
     this.notiSer.notify(saveW.message);
     this.dialog.close();
    });
  }

  onSaveWord(): Observable<any[] | any>{
    var saveAsBlob = this.container.documentEditor.saveAsBlob('Docx');
    var fSaveAsBlob = from(saveAsBlob);
    return fSaveAsBlob.pipe(
      mergeMap((blob: Blob) => {
        var file = new File([blob], this.dataFile.fileName || this.formModel.entityName);
        this.fileItem.fileName = this.dataFile.fileName || this.formModel.entityName;
        this.fileItem.recID = this.dataFile.recID;
        this.fileItem.objectID = this.dataFile.objectID;
        this.fileItem.extension = ".docx";
        this.fileItem.item =
        {
          name: this.dataFile.fileName || this.formModel.entityName,
          rawFile: file,
          type: 'docx',
          size: file.size,
        };
        var service = from(this.serviceAddFile(this.fileItem))
        return service.pipe(mergeMap((res:any)=>{
          this.fileItem = res;
          this.fileItem.folderId = this.data.recID;
          this.fileItem.createdOn = new Date();
          return this.fileService.updateVersionFile(this.fileItem);
        }));

      })
    );
    //return of(null);
  }

  async serviceAddFile(fileItem: FileUpload): Promise<FileUpload> {
    try {
      fileItem.uploadId = '';      
      //var appName = environment.appName; // Tam thoi de hard
      var ChunkSizeInKB = this.dmSV.ChunkSizeInKB;
      var uploadFile = fileItem.item.rawFile;
      await this.dmSV.getToken();
      var retUpload = await lvFileClientAPI.postAsync(
        `api/${this.user.tenant}/files/register`,
        {
          Data: {
            FileName: uploadFile.name,
            ChunkSizeInKB: ChunkSizeInKB,
            FileSize: uploadFile.size,
            thumbSize: {
              width: 200, //Kích thước của file ảnh Thum bề ngang
              height: 200, //Kích thước của file ảnh Thum bề dọc
            },
            IsPublic: true,
            ThumbConstraints:"30,60,120,300,500,600"
          },
        }
      );
      fileItem.fileSize = uploadFile.size;
      fileItem.thumbnail = retUpload.Data?.RelUrlThumb; //"";
      fileItem.uploadId = retUpload.Data?.UploadId; //"";
      fileItem.urlPath = retUpload.Data?.RelUrlOfServerPath; //"";
    } catch (ex) {
      console.log(ex);
    }
    return fileItem;
  }
}
