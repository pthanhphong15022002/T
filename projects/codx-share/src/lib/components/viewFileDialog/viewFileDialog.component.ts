import { ChangeDetectorRef, Component, OnInit, Input, ElementRef, ViewChild, Optional, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DataItem } from '@shared/models/folder.model';
import { FileService } from '@shared/services/file.service';
import { DocumentEditorContainerComponent , ToolbarService , PrintService } from '@syncfusion/ej2-angular-documenteditor';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { SpreadsheetComponent } from '@syncfusion/ej2-angular-spreadsheet';
import { Sorting } from '@syncfusion/ej2-pivotview';
import { AuthService, CallFuncService, DialogData, DialogRef, NotificationsService, SidebarModel, ViewsComponent } from 'codx-core';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { PropertiesComponent } from 'projects/codx-dm/src/lib/properties/properties.component';
import { environment } from 'src/environments/environment';
import { threadId } from 'worker_threads';
import { SystemDialogService } from './systemDialog.service';
@Component({
  selector: 'codx-viewfiledialog',
  templateUrl: './viewFileDialog.component.html',
  styleUrls: ['./viewFileDialog.component.scss'],
  providers:[ToolbarService , PrintService]

})

export class ViewFileDialogComponent implements OnInit , OnChanges {
  @ViewChild('contentViewFileDialog') contentViewFileDialog;  
  @ViewChild('documenteditor_default') public container: DocumentEditorContainerComponent;
  // @ViewChild('pdfviewer') pdfviewer: PdfViewerComponent;
  @ViewChild('spreadsheet') public spreadsheetObj: SpreadsheetComponent;
  src: string = null;
  isVideo: boolean = false;
  isPdf: boolean = false;
  isImg: boolean = false;
  access_token: string = "";
  tenant: string = "";
  srcVideo: string = "";
  fMoreAction: any;
  fullName: string;
  data: any;
  user: any;
  titleDialog = "";
  formModel: any;
  pathVideo: string;
  openUrl: string;
  serviceUrl : string;
  urlTxt:any;
  linkFile:any;
  isShow = false;
  isOffice=false;
  public urlSafe: any;
  @Input() id: string;
  @Input() ext: string;
  @Input() dataFile: any;
  @Input('viewBase') viewBase: ViewsComponent;
  dialog: any;
  public service: string = environment.pdfUrl;//'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer';
  public document: string = 'PDF_Succinctly.pdf';
  constructor(private router: Router,
    private readonly auth: AuthService,
    public dmSV: CodxDMService,
    private fileService: FileService,
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    private notificationsService: NotificationsService,
    private callfc: CallFuncService,    
    private elementRef: ElementRef,
    private sanitizer: DomSanitizer,
    //private modalService: NgbModal,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    if(data?.data)
    {
      this.dataFile = data.data
    }
    // this.fileService.getFile(this.id).subscribe(item => {
    //   if (item != null) {
    //     this.data = item;
    //   }
    // });
    this.dialog = dialog;
    //  var data: any = this.auth.user$;
    // this.user = data.source.value;
  }
  ngOnChanges(changes: SimpleChanges): void {
    this.isImg = false;
    this.isVideo = false;
    this.isPdf = false;
    this.isShow = false;
    if ((changes['dataFile'] && (changes['dataFile']?.currentValue != changes['dataFile']?.previousValue))) {
      this.dataFile = changes['dataFile']?.currentValue;
      this.data = changes['dataFile']?.currentValue;
      this.getData();
      // this.changeDetectorRef.detectChanges();
    }
  }


  setShare() {
    if (this.checkShareRight()) {
      var data = new DataItem();
      data.recID = this.id;
      data.type = 'file';
      data.fullName = this.fullName;
      data.copy = false;
      data.dialog = "share";
      data.id_to = "";
      data.view = "1";
      // this.dmSV.setOpenDialog.next(data);
    }
  }

  properties() {
    let option = new SidebarModel();
    option.Width = '550px';
    this.callfc.openSide(PropertiesComponent, this.data, option);      
 
  }

  activeDialog() {
    // $('app-customdialog').css('z-index', '9999');
  }

  async setBookmark(): Promise<void> {
    var id = this.id;
    this.fileService.bookmarkFile(id).subscribe(async res => {
      this.data = res;
      this.getBookmark();
      this.changeDetectorRef.detectChanges();
    });
  }

  getBookmark() {
    var ret = false;
    var listBookmarks = this.data.bookmarks;
    if (listBookmarks != null) {
      listBookmarks.forEach(item => {
        if (item.objectID == this.user.userID) {
          ret = true;
        }
      });
    }
    this.data.isBookmark = ret;
  }

  checkCreateRight() {
    return this.data.create;
  }

  checkBookmark() {
    return this.data.isBookmark;
  }

  move() {
    if (this.checkCreateRight()) {
      // $('app-customdialog').css('position', 'fixed');
      // $('app-customdialog').css('z-index', '9999');
      var data = new DataItem();
      // $('.viewfile').css('z-index', '1000');
      data.recID = this.id;
      data.type = 'file';
      data.fullName = this.fullName;
      data.copy = false;
      data.dialog = "move";
      data.id_to = "";
      data.view = "1";
      // this.dmSV.setOpenDialog.next(data);
    }
  }

  checkMoveRight() {
    return this.data.moveable;
  }

  more() {
    if (this.fMoreAction) this.fMoreAction();
  }

  print() {
   // console.log(window);
   if (this.linkFile) 
   {
    const output = document.getElementById("output");
    const img = document.createElement("img");
    img.src = this.linkFile;
    output.appendChild(img);        
    const br = document.createElement("br");
    output.appendChild(br);
    window.print();
   }
   else 
     window.frames[0].postMessage(JSON.stringify({ 'MessageId': 'Action_Print' }), '*');
  }

  base64ToArrayBuffer(base64) {
    var binaryString = window.atob(base64);
    var binaryLen = binaryString.length;
    var bytes = new Uint8Array(binaryLen);
    for (var i = 0; i < binaryLen; i++) {
      var ascii = binaryString.charCodeAt(i);
      bytes[i] = ascii;
    }
    return bytes;
  }

  async download(): Promise<void> {
    var id = this.id;
    var that = this;
    
    if (this.checkDownloadRight()) {   
      this.fileService.downloadFile(id).subscribe(async res => {
        if (res) {                   
          let blob = await fetch(res).then(r => r.blob());                
          let url = window.URL.createObjectURL(blob);
          var link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", this.fullName);
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        // if (res) {
        //   let json = JSON.parse(res.content);
        //   var bytes = that.base64ToArrayBuffer(json);
        //   let blob = new Blob([bytes], { type: res.mimeType });
        //   let url = window.URL.createObjectURL(blob);
        //   var link = document.createElement("a");
        //   link.setAttribute("href", url);
        //   link.setAttribute("download", res.fileName);
        //   link.style.display = "none";
        //   document.body.appendChild(link);
        //   link.click();
        //   document.body.removeChild(link);
        // }
      });
    }
    else {
      this.notificationsService.notifyCode("SYS018");
    }
  }

  viewFile(id) {
    this.tenant = this.auth.userValue.tenant;
    this.access_token = this.auth.userValue.token;

    if(this.data?.extension.includes("doc"))
    {
      this.isShow = true;
      let http: XMLHttpRequest = new XMLHttpRequest();
      let content = { fileUrl:  this.linkFile};
      http.withCredentials = true;
      http.open('Post', this.serviceUrl, true);
      http.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      http.onreadystatechange = () => {
        if (http.readyState === 4) {
          if (http.status === 200 || http.status === 304) {
            //open the SFDT text in Document Editor
            this.container.documentEditor.open(http.responseText);
            this.isShow = false;
            this.changeDetectorRef.detectChanges();
          }
        }
      };
      //this.container.documentEditor.documentName = this.data?.fileName; 
      http.send(JSON.stringify(content));
    }
    else if(this.data?.extension.includes("xls"))
    {
      let that = this;
      fetch(this.linkFile) // fetch the remote url
      .then((response) => {
        response.blob().then((fileBlob) => {
       // convert the excel file to blob
        let files = new File([fileBlob], this.data?.fileName); //convert the blob into file
        that.spreadsheetObj.open({ file: files }); // open the file into Spreadsheet
        })
      })
    }
    else if(this.data?.extension.includes("txt"))
    {
      this.urlTxt = this.sanitizer.bypassSecurityTrustResourceUrl(this.linkFile);
    }
  }

  _animalOpen(name, num, callback?) {
    console.log(this.contentViewFileDialog.elementRef.nativeElement);
    if (num > 100) return;

    if (document.getElementById(name)) {
      setTimeout(() => { if (callback) callback(); }, 100);
      return;
    }

    setTimeout(() => { this._animalOpen(name, (num ?? 0) + 1) }, 100);
  }

  checkReadRight() {
    return this.data.read;
  }

  checkShareRight() {
    return this.data.share;
  }

  checkDownloadRight() {
    return this.data.download;;
  }

  checkUploadRight() {
    return this.data.upload;
  }

  closeOpenForm(e: any) {
  }

  ngOnInit(): void {
    this.data = this.dataFile;
    if(this.data)this.getData(); 
  }
  getData()
  {
    this.id = this.dataFile?.recID;
    let baseurlExcel: string = environment.apiUrl+'/api/documenteditor/openexcel';
    baseurlExcel += "?sk="+ btoa(this.auth.userValue.userID+"|"+this.auth.userValue.securityKey);
    this.openUrl = baseurlExcel;
    let baseurl: string = environment.apiUrl+'/api/documenteditor/import';
    baseurl += "?sk="+ btoa(this.auth.userValue.userID+"|"+this.auth.userValue.securityKey);
    this.serviceUrl = baseurl;
    this.dmSV.isChangeDataViewFile.subscribe(item => {
      if (item) {
        this.data = item;
        this.getBookmark();
        this.changeDetectorRef.detectChanges();
      }
    })
    this.ext = (this.data.extension || "").toLocaleLowerCase();
    this.fullName = this.data.fileName;
    this.fMoreAction = this.data.moreAction;
    if (this.data.data != null) {
      this.data = this.data.data;
      this.getBookmark();
    }
    this.isVideo = false;
    this.srcVideo = "";
    this.linkFile = environment.urlUpload+"/"+this.data?.pathDisk;
    if (this.ext == ".mp4") {
      this.isVideo = true;
      this.srcVideo = `${environment.urlUpload}/${this.data.pathDisk}`;
    } else if (this.ext == ".png"
      || this.ext == ".jpeg"
      || this.ext == ".jpg"
      || this.ext == ".bmp"
    ) {
      this.isImg = true;     
    }
    else if (this.ext == ".pdf") {
      this.isPdf = true;
    }
    else if(environment.office365) 
      this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(`${environment.office365}`+`${environment.urlUpload}`+"/"+this.data?.pathDisk);
    else
      this.viewFile(this.id);
    if (!window["librOfficeMessage"]) {
      window.removeEventListener("message", window["librOfficeMessage"], false);
    }

    window["librOfficeMessage"] = (event) => {
      console.log(event.data);
      try {
        var msg = JSON.parse(event.data);
        if (!msg) {
          return;
        }
        if (msg.MessageId == 'App_LoadingStatus') {
          if (msg.Values) {
            if (msg.Values.Status == 'Document_Loaded') {
              console.log('==== inform the wopi client that we are ready to receife messages');
              window.frames[0].postMessage(JSON.stringify({ 'MessageId': 'Host_PostmessageReady' }), '*');
              window.frames[0].postMessage(JSON.stringify({ 'MessageId': 'Hide_Menubar' }), '*');
              //$("#viewfiledalog").find('iframe')[0].style.display = "block";
              // $("#viewfiledalog").css("z-index", 1001);
            }
          }
        }
      } catch (error) {

      }

      // are we ready?

    };
    window.addEventListener("message", window["librOfficeMessage"], false);
  }
}
