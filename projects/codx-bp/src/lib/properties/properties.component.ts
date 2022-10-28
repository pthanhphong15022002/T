import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import { FileUpload, View } from '@shared/models/file.model';
import { FileService } from '@shared/services/file.service';
import { CacheService, DialogData, DialogRef, NotificationsService } from 'codx-core';

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


  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private fileService: FileService,
    private notificationsService: NotificationsService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = data.data;
  }

  ngOnInit(): void {
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
