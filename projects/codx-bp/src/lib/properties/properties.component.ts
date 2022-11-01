import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FileUpload, View } from '@shared/models/file.model';
import { FileService } from '@shared/services/file.service';
import { CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';
import { CodxBpService } from '../codx-bp.service';

@Component({
  selector: 'lib-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css']
})
export class PropertiesComponent implements OnInit {

  dialog: any;
  data: any;
  hideExtend = true;
  fileEditing: FileUpload;
  styleRating: string;
  totalViews: number;
  totalRating: number;
  rating1: string;
  rating2: string;
  rating3: string;
  rating4: string;
  rating5: string;
  currentRate = 1;
  readonly = false;
  hovered = 0;
  commenttext: string = "";
  id: string;
  vlL1473: any;
  requestTitle: string;


  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService,
    private notificationsService: NotificationsService,
    private bpSV: CodxBpService,
    private cache: CacheService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = data.data;
    this.totalRating = 0;
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

  openProperties(id): void {
    this.id = id;
    this.totalViews = 0;
    this.readonly = false;
    this.commenttext = '';
    this.requestTitle = "";
    this.changeDetectorRef.detectChanges();
    // this.fileService.getFile(id, false).subscribe(async res => {
    //   if (res != null) {
    //     this.fileEditing = res;

    //     if (this.fileEditing.version != null) {
    //       this.fileEditing.version = this.fileEditing.version.replace('Ver ', 'V');
    //     }
    //     if (this.fileEditing.language) {
    //       if (this.vlL1473 && this.vlL1473 && this.vlL1473.length) {
    //         var lang = this.vlL1473.filter(x => x.value === this.fileEditing.language);
    //         if (lang && lang[0]) {
    //           this.fileEditing.language /* this.namelanguage */ = lang[0].text;
    //         }
    //       }
    //     }

    //     this.onUpdateTags();
    //     this.currentRate = 1;
    //     this.getRating(res.views);
    //     // var files = this.dmSV.listFiles;
    //     // if (files != null) {
    //     //   this.dmSV.listFiles = files;
    //       this.bpSV.ChangeData.next(true);
    //     // }

    //     this.changeDetectorRef.detectChanges();
    //   }
    // });
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
      this.rating1 = ((_rating1 / this.totalViews) * 100).toFixed(0).toString() + "%";
      this.rating2 = ((_rating2 / this.totalViews) * 100).toFixed(0).toString() + "%";
      this.rating3 = ((_rating3 / this.totalViews) * 100).toFixed(0).toString() + "%";
      this.rating4 = ((_rating4 / this.totalViews) * 100).toFixed(0).toString() + "%";
      this.rating5 = ((_rating5 / this.totalViews) * 100).toFixed(0).toString() + "%";
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

  onUpdateTags() {
    if (this.fileEditing.tags != null) {
      var list = this.fileEditing.tags.split(";");
      this.bpSV.listTags.next(list);
    }
  }

  txtValue($event, type) {
    switch (type) {
      case "commenttext":
        this.commenttext = $event.data;
        break;
    }
  }

  setComment() {
    this.fileService.setViewFile(this.id, this.currentRate.toString(), this.commenttext).subscribe(async res => {
      if (res.status == 0) {
        this.currentRate = 1;
        this.readonly = false;
        this.commenttext = '';
        this.fileEditing = res.data;
        this.getRating(res.data.views);
        // var files = this.dmSV.listFiles;
        // if (files != null) {
        //   let index = files.findIndex(d => d.recID.toString() === this.id);
        //   if (index != -1) {
        //     var thumbnail = files[index].thumbnail;
        //     files[index] = res.data;
        //     files[index].thumbnail = thumbnail;
        //   }
        //   this.dmSV.listFiles = files;
        //   this.dmSV.ChangeData.next(true);
        // }

        this.changeDetectorRef.detectChanges();          //alert(res.message);
        this.notificationsService.notify(res.message);
      }
    });
  }

  setClassRating(i, rating) {
    if (i <= rating)
      return "icon-star text-warning icon-16 mr-1";
    else
      return "icon-star text-muted icon-16 mr-1";
  }
}
