import { ChangeDetectorRef, Component, OnInit, Input, ElementRef, ViewChild, Optional } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { DataItem } from '@shared/models/folder.model';
import { FileService } from '@shared/services/file.service';
import { Dialog } from '@syncfusion/ej2-angular-popups';
import { AuthService, CallFuncService, DialogData, DialogRef, NotificationsService, ViewsComponent } from 'codx-core';
import { environment } from 'src/environments/environment';
import { AttachmentService } from '../attachment/attachment.service';
import { SystemDialogService } from './systemDialog.service';

@Component({
  selector: 'app-viewfiledialog',
  templateUrl: './viewFileDialog.component.html',
  styleUrls: ['./viewFileDialog.component.scss'],

})
export class ViewFileDialogComponent implements OnInit {
  @ViewChild('contentViewFileDialog') contentViewFileDialog;

  src: string = "about:blank";
  isVideo: boolean = false;
  linkViewImage: string = "";
  access_token: string = "";
  tenant: string = "";
  srcVideo: string = "";
  fMoreAction: any;
  fullName: string;
  data: any;
  user: any;
  titleDialog = "";
  @Input() id: string;
  @Input() ext: string;
  @Input('viewBase') viewBase: ViewsComponent;
  dialog: any;
  constructor(private router: Router,
    private readonly auth: AuthService,
    private dmSV: AttachmentService,
    private fileService: FileService,
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    private notificationsService: NotificationsService,
    private callfc: CallFuncService,
    private elementRef: ElementRef,
    //private modalService: NgbModal,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
    ) {
      if (data.data != null)
        this.data = data.data;
      else
        this.data = data;

      this.id = this.data.recID;
      this.dialog = dialog;
  //  var data: any = this.auth.user$;
   // this.user = data.source.value;
  }


  setShare() {
    if (this.checkShareRight()) {
      var data = new DataItem();
      //  $('.my-dialog').addClass("zIndex");
      // $('.my-dialog').css('z-index', '99999');;
      // $('app-customdialog').css('position', 'fixed');
      // $('app-customdialog').css('z-index', '9999');
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
    // $('app-customdialog').css('position', 'fixed');
    // $('app-customdialog').css('z-index', '9999');
    var data = new DataItem();
    // $('.viewfile').css('z-index', '1000');
    // $('.my-dialog').css('z-index', '99992');
    data.recID = this.id;
    data.type = 'file';
    data.fullName = this.fullName;
    data.copy = false;
    data.dialog = "properties";
    data.id_to = "";
    data.view = "1";
    // this.dmSV.setOpenDialog.next(data);
  }

  activeDialog() {
    // $('app-customdialog').css('z-index', '9999');
  }

  async setBookmark(): Promise<void> {
    var id = this.id;
    this.fileService.bookmarkFile(id).subscribe(async res => {
      this.data = res;
      // let list = this.dmSV.listFiles.getValue();
      // let index = list.findIndex(d => d.recID.toString() === id.toString()); //find index in your array
      // if (this.dmSV.idMenuActive == "5") {
      //   if (index > -1) {
      //     list.splice(index, 1);//remove element from array
      //   }
      // }
      // else {
      //   list[index] = res;
      // }

      // this.dmSV.listFiles.next(list);
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
    console.log(window);
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
        if (res && res.content != null) {
          let json = JSON.parse(res.content);
          var bytes = that.base64ToArrayBuffer(json);
          let blob = new Blob([bytes], { type: res.mimeType });
          let url = window.URL.createObjectURL(blob);
          var link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", res.fileName);
          link.style.display = "none";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
    }
    else {
      this.notificationsService.notify("Bạn không có quyền download file này");
    }
  }

  viewFile(id) {
    // if ($("#viewfiledalog").find('iframe').length == 0) return;
    // $("#viewfiledalog").find('iframe')[0].style.display = "none";
    this.tenant = this.auth.userValue.tenant;
    this.access_token = this.auth.userValue.token;
    //alert(1);
    this.src = `${environment.librOfficeUrl}?WOPISrc=${environment.apiUrl}/api/dm/files/${id}`;
    setTimeout(() => {
      (document.getElementById("frmFile") as HTMLFormElement).submit();
      //$("#viewfiledalog").find("form")[0]["submit"]();
    }, 100);

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
    //if (this.systemDialogService.onOpenViewFileDialog.observers.length == 0) {
    var o = this.data;  
    //this.systemDialogService.onOpenViewFileDialog.subscribe((o) => {
   //   if (o == null) return;
    this.id = o.recID;
    this.ext = (o.extension || "").toLocaleLowerCase();
    this.fullName = o.fileName;
    this.fMoreAction = o.moreAction;
    if (o.data != null) {
      this.data = o.data;
      this.getBookmark();
    }
    this.isVideo = false;
    this.srcVideo = "";
    this.linkViewImage = "";
    this.changeDetectorRef.detectChanges();
    if (this.ext == ".mp4") {
      this.isVideo = true;
      this.srcVideo = `${environment.apiUrl}/api/dm/filevideo/${this.id}?access_token=${this.auth.userValue.token}`;
    } else if (this.ext == ".png"
      || this.ext == ".jpeg"
      || this.ext == ".jpg"
      || this.ext == ".bmp"
    ) {
      this.linkViewImage = `${environment.apiUrl}/api/dm/files/GetImage?id=${this.id}&access_token=${this.auth.userValue.token}`;
    }

    this.viewFile(this.id);
    // let diaglog = this.callfc.openForm(this.contentViewFileDialog, o.fileName, 1000, 800, null, "");
    // diaglog.close(res => {
    //   this.viewFile(this.iD);
    //   return this.closeOpenForm(res);
    // });
  //  })
    // }
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
