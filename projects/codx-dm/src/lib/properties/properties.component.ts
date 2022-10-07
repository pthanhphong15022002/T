import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Host, Input, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { Subject } from "rxjs";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { AlertConfirmInputConfig, ApiHttpService, AuthStore, CacheService, CallFuncService, DataRequest, DialogData, DialogRef, NotificationsService, TenantService, ViewsComponent } from 'codx-core';
import { FolderService } from '@shared/services/folder.service';
import { CodxDMService } from '../codx-dm.service';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
imports: [NgbRatingModule];
import { SystemDialogService } from 'projects/codx-share/src/lib/components/viewFileDialog/systemDialog.service';
import { FileInfo, FileUpload, HistoryFile, ItemInterval, Permission, SubFolder, View } from '@shared/models/file.model';
import { FolderInfo } from '@shared/models/folder.model';
import { FileService } from '@shared/services/file.service';
import { Thickness } from '@syncfusion/ej2-angular-charts';
import { RolesComponent } from '../roles/roles.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PropertiesComponent implements OnInit {
  @Input() formModel: any;
  @Input('viewBase') viewBase: ViewsComponent;
  @Output() eventShow = new EventEmitter<boolean>();
  dialog: any;
  titleDialog = 'Thông tin tài liệu';
  titleExpand = 'Mở rộng';
  titleShare = 'Chia sẻ';
  titleFiletype = 'Loại tập tin';
  titleFilesize = 'Kích cỡ file'
  titleCreator = 'Người tạo';
  titleVersion = 'Phiên bản';
  titleLanguage = 'Ngôn ngữ';
  titleAuthor = 'Tác giả';
  titlePublisher = 'Nhà xuất bản';
  titleCopyrights = 'Bản quyền';
  titleRating = 'Đánh giá';
  titleRatingDesc = 'Đánh giá tài liệu này ?';
  titleRatingDesc2 = 'Cho người khác biết suy nghĩ của bạn!';
  titleSend = 'Gửi';
  titleHistory = 'Lịch sử';
  namelanguage = '';
  readonly = false;
  currentRate = 1;
  selected = 0;
  hovered = 0;
  hideExtend = true;
  id: string;
  // currentRate = 0;
  // selected = 0;
  // hovered = 0;
  // readonly = false;

  totalRating: number;
  totalViews: number;
  rating1: string;
  rating2: string;
  rating3: string;
  rating4: string;
  rating5: string;
  styleRating: string;
  historyFileName: string;
  fileEditing: FileUpload;
  commenttext: string = "";
  shareContent: string;
  requestContent: string;
  requestTitle: string;
  data: any;
  vlL1473: any;
  vlL14733: any;
  constructor(
    private domSanitizer: DomSanitizer,
    private tenantService: TenantService,
    private fileService: FileService,
    private api: ApiHttpService,
    public dmSV: CodxDMService,
    private callfc: CallFuncService,
    private modalService: NgbModal,
    private auth: AuthStore,
    private notificationsService: NotificationsService,
    // private confirmationDialogService: ConfirmationDialogService,
    private changeDetectorRef: ChangeDetectorRef,
    private systemDialogService: SystemDialogService,
    private cache: CacheService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = data.data;
    this.totalRating = 0;
    //this.fileEditing = this.data[1];   

    //this.fileEditing =  JSON.parse(JSON.stringify(this.data));  
    // this.data = data.data;
    // //this.fileEditing = this.data[1];   
    // this.fileEditing =  JSON.parse(JSON.stringify( this.data[1]));   
    // this.user = this.auth.get();
    // this.dialog = dialog;     
    // this.id = this.fileEditing.recID;
    // this.dmSV.isFileEditing.subscribe(item => {
    //   if (item != undefined) {
    //     this.fileEditing = item;
    //     this.changeDetectorRef.detectChanges();
    //   }          
    // });
    //  this.changeDetectorRef.detectChanges();
    // this.dmSV.confirmationDialogService = confirmationDialogService;
    //  this._ngFor.ngForTrackBy = (_: number, item: any) => this._propertyName ? item[this._propertyName] : item;
  }

  ngOnInit(): void {
    this.cache.valueList("L1473").subscribe(item => {
      if (item && item.datas) {
        this.vlL1473 = item.datas;
      }
      this.openProperties(this.data.recID);
    });

    //  document.getElementsByClassName("codx-dialog-container")[0].setAttribute("style", "width: 460px; z-index: 1000;");
    this.changeDetectorRef.detectChanges();
  }


  extendShow(): void {
    this.hideExtend = !this.hideExtend;
    var doc = document.getElementsByClassName('extend-more')[0];
    var ext = document.getElementsByClassName('ext_button')[0];
    if (doc != null) {
      if (this.hideExtend) {
        document.getElementsByClassName("codx-dialog-container")[0].setAttribute("style", "width: 550px; z-index: 1000;");
        doc.setAttribute("style", "display: none");
        ext.classList.remove("rotate-back");
      }
      else {
        document.getElementsByClassName("codx-dialog-container")[0].setAttribute("style", "width: 900px; z-index: 1000;");
        doc.setAttribute("style", "display: block");
        ext.classList.add("rotate-back");
      }
    }

    this.changeDetectorRef.detectChanges();
  }

  setComment() {
    this.fileService.setViewFile(this.id, this.currentRate.toString(), this.commenttext).subscribe(async res => {
      if (res.status == 0) {
        this.currentRate = 1;
        this.readonly = false;
        this.commenttext = '';
        this.fileEditing = res.data;
        this.getRating(res.data.views);
        var files = this.dmSV.listFiles;
        if (files != null) {
          let index = files.findIndex(d => d.recID.toString() === this.id);
          if (index != -1) {
            var thumbnail = files[index].thumbnail;
            files[index] = res.data;
            files[index].thumbnail = thumbnail;
          }
          this.dmSV.listFiles = files;
          this.dmSV.ChangeData.next(true);
        }

        this.changeDetectorRef.detectChanges();          //alert(res.message);
        this.notificationsService.notify(res.message);
      }
    });
  }

  getThumbnail(data) {
    if (data.hasThumbnail)
      return environment.urlUpload + "/" + data.thumbnail;
    else
      return `../../../assets/codx/dms/` + this.getAvatar(data.extension);
  }

  getAvatar(filename: string) {
    if (filename == "" || filename == null)
      return "";
    var ext = filename.substring(filename.lastIndexOf('.'), filename.length) || filename;

    if (ext == null) {
      // alert(1);
      return "file.svg";
    }
    else {
      switch (ext) {
        case ".txt":
          return "txt.svg";
        case ".doc":
        case ".docx":
          return "doc.svg";
        case ".7z":
        case ".rar":
        case ".zip":
          return "zip.svg";
        case ".jpg":
          return "jpg.svg";
        case ".mp4":
          return "mp4.svg";
        case ".xls":
        case ".xlsx":
          return "xls.svg";
        case ".pdf":
          return "pdf.svg";
        case ".png":
          return "png.svg";
        case ".js":
          return "javascript.svg";
        default:
          return "file.svg";
      }
    }
  }

  onUpdateTags() {
    if (this.fileEditing.tags != null) {
      var list = this.fileEditing.tags.split(";");
      this.dmSV.listTags.next(list);
    }
  }

  txtValue($event, type) {
    debugger;
    switch (type) {
      case "commenttext":
        this.commenttext = $event.data;
        break;
    }
  }

  openProperties(id): void {
    this.id = id;
    this.totalViews = 0;
    this.readonly = false;
    this.commenttext = '';
    this.requestTitle = "";
    // this.changeDetectorRef.detectChanges();
    this.fileService.getFile(id, false).subscribe(async res => {
      if (res != null) {
        this.fileEditing = res;

        if (this.fileEditing.version != null) {
          this.fileEditing.version = this.fileEditing.version.replace('Ver ', 'V');
        }
        if (this.fileEditing.language) {
          if (this.vlL1473 && this.vlL1473 && this.vlL1473.length) {
            var lang = this.vlL1473.filter(x => x.value === this.fileEditing.language);
            if (lang && lang[0]) {
              this.fileEditing.language /* this.namelanguage */ = lang[0].text;
            }
          }
        }
        debugger;
        /*  if(this.fileEditing.publisher)
         {
           this.cache.valueList("L1473").subscribe(item=>{
             if(item && item.datas) 
             {
               this.vlL14733 = item.datas;
               var langk = item.datas.filter(x=>x.value == this.fileEditing.publisher);
               if(langk && langk[0])
               {
                 this.fileEditing.publisher = langk[0].text;
               }
               
             }
           
           })
         } */
        debugger;

        this.onUpdateTags();
        this.currentRate = 1;
        this.getRating(res.views);
        var files = this.dmSV.listFiles;
        if (files != null) {
          let index = files.findIndex(d => d.recID.toString() === id);
          if (index != -1) {
            var thumbnail = files[index].thumbnail;
            files[index] = res;
            files[index].thumbnail = thumbnail;
          }
          this.dmSV.listFiles = files;
          this.dmSV.ChangeData.next(true);
        }

        this.changeDetectorRef.detectChanges();
      }
    });
  }

  getRating(data: View[]) {
    let _rating1 = 0;
    let _rating2 = 0;
    let _rating3 = 0;
    let _rating4 = 0;
    let _rating5 = 0;
    let _sum = 0;
    this.totalViews = 0;

    if (data != null) {
      var list = data.filter(x => x.rating > 0);
      this.totalViews = list.length;
      //res.views.forEach(item => {
      for (var i = 0; i < list.length; i++) {
        _sum = _sum + list[i].rating;
        switch (list[i].rating) {
          case 1:
            _rating1++;
            break;
          case 2:
            _rating2++;
            break;
          case 3:
            _rating3++;
            break;
          case 4:
            _rating4++;
            break;
          case 5:
            _rating5++;
            break;
        }
      }
    }

    if (this.totalViews != 0) {
      this.rating1 = ((_rating1 / this.totalViews) * 100).toFixed(2).toString() + "%";
      this.rating2 = ((_rating2 / this.totalViews) * 100).toFixed(2).toString() + "%";
      this.rating3 = ((_rating3 / this.totalViews) * 100).toFixed(2).toString() + "%";
      this.rating4 = ((_rating4 / this.totalViews) * 100).toFixed(2).toString() + "%";
      this.rating5 = ((_rating5 / this.totalViews) * 100).toFixed(2).toString() + "%";
      this.totalRating = _sum / this.totalViews;
    }
    else {
      this.rating1 = "0%";
      this.rating2 = "0%";
      this.rating3 = "0%";
      this.rating4 = "0%";
      this.rating5 = "0%";
      this.totalRating = 0;
    }
    this.totalRating = parseFloat(this.totalRating.toFixed(2));
    this.styleRating = (this.totalRating * 2 * 10).toFixed(2).toString() + "%";
  }

  openRight(mode = 1, type = true) {
    debugger;
    this.dmSV.dataFileEditing = this.fileEditing;
    this.callfc.openForm(RolesComponent, "", 950, 650, "", [], "");
  }

  getSizeByte(size: any) {
    if (size != null)
      return size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    else return "";
  }

  getSizeKB(size: any) {
    if (size != null) {
      var kb = size / 1024;
      return kb.toFixed(2);
    }
    else {
      return "";
    }
  }

  setClassRating(i, rating) {
    if (i <= rating)
      return "icon-star text-warning icon-16 mr-1";
    else
      return "icon-star text-muted icon-16 mr-1";
  }
  getInformation(id: any) {
    // this.api.execSv("HR","HR","EmployeesBusiness","GetEmpUsers",id).subscribe(item=>{

    // })
  }
}