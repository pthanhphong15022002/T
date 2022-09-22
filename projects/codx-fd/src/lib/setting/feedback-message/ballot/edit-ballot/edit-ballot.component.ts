import { Component, OnInit, ChangeDetectorRef, ViewChild, Optional } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiHttpService, CacheService, DialogData, DialogRef, ImageViewerComponent, NotificationsService } from 'codx-core';
import { BallotService } from '../ballot.service';
import { Ballot } from '../model/ballot.model';

@Component({
  selector: 'lib-edit-ballot',
  templateUrl: './edit-ballot.component.html',
  styleUrls: ['./edit-ballot.component.scss']
})
export class EditBallotComponent implements OnInit {
  ballot = new Ballot();
  isEdit = false;
  reload = false;
  colorimg = "";
  vll: any;
  dialog!: DialogRef;
  header = '';
  formModel: any;

  @ViewChild('uploadImage') uploadImage: ImageViewerComponent;
  // @Input() cardType: string;
  cardType: string;
  constructor(
    private ballotSV: BallotService,
    private changedr: ChangeDetectorRef,
    private at: ActivatedRoute,
    private notificationsService: NotificationsService,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() dt: DialogRef,
    @Optional() data: DialogData,
  ) {
    this.dialog = dt;
    this.formModel = this.dialog?.formModel;
    data
    debugger
    this.ballot.cardType = this.cardType;
    this.ballot.headerColor = "#918e8e";
    this.ballot.textColor = "#918e8e";


    this.cache.valueList("L1447").subscribe((res) => {
      if (res) {
        this.vll = res.datas;
        this.changedr.detectChanges();
      }
    });
  }

  ngOnInit(): void {
    // this.ballotSV.recID.subscribe((recID) => {
    //   this.colorimg = this.ballotSV.colorimg;
    //   if (recID) {
    //     this.isEdit = true;
    //     this.api.execSv<any>("FED", "FED", "ballotsBusiness", "GetAsync", [recID]).subscribe(res => {
    //       if (res)
    //         Object.assign(this.ballot, res);
    //       this.changedr.detectChanges();
    //       this.checkActive();
    //     });
    //   } else if (!this.ballotSV.load) {
    //     this.isEdit = false;
    //     this.ballot.cardType = this.cardType;
    //     this.changedr.detectChanges();
    //     this.checkActive();
    //   }
    // })

    // this.at.queryParams.subscribe(params => {
    //   if (params.funcID) {
    //     let functionID = params.funcID;
    //     this.cardType = functionID.substr(-1);
    //   }
    // })
  }

  closeCreate(): void {
    // this.ballot = new Ballot();
    // this.ballot.cardType = this.cardType;
    // this.ballot.headerColor = "#918e8e";
    // this.ballot.textColor = "#918e8e";
    // $('#create_card').removeClass('offcanvas-on');
    // $('#cardImageInput').val('');
  }

  valueChange(e, element) {
    // if (e.field === "backgroundColor") {
    //   this.ballot.backgroundColor = e.data;
    //   this.ballot.fileName = "";
    //   var $elm = $('.symbol-label[data-color]', $('.patternt'));
    //   $elm.removeClass('color-check');
    //   $('kendo-colorpicker.symbol-label', $(element)).addClass('color-check');
    //   this.changedr.detectChanges();
    // } else {
    //   if (element) {
    //     var $parent = $(element.ele);
    //     if ($parent && $parent.length > 0) {
    //       var text = $('.k-selected-color', $parent);
    //       text.text(e.data);
    //       text.css("background-color", e);
    //       if (e.field == "headerColor")
    //         $('.header-ballot').css('color', e);
    //       else if (e.field == "textColor")
    //         $('.content-ballot').css('color', e);
    //     }
    //   }
    //   if (e.field === "cardType")
    //     this.ballot[e.field] = e.data.value;
    //   else
    //     this.ballot[e.field] = e.data;
    // }
  }

  async handleFileInput(event) {
    // var $elm = $('.symbol-label[data-color]', $('.patternt'));
    // $elm.removeClass('color-check');
    // $('label.symbol-label').addClass('color-check');
    // //if (!this.ballot.patternID) return;
    // this.ballot.backgroundColor = "";
    // this.ballot.fileName = event.currentTarget.files[0].name;
    // this.changedr.detectChanges();
    // this.uploadImage.handleFileInput(event);
  }


  saveBallot() {
    // if (this.uploadImage?.imageUpload?.fileName) { this.ballot.fileName = ""; this.ballot.backgroundColor = ""; }
    // // this.ballot.updateColumn = this.inputsv.updateColumn;
    // if (!this.ballot.patternName) { this.notificationsService.notify("Vui lòng nhập mô tả"); return }
    // this.api.execSv<any>("FED", "FED", "ballotsBusiness", "SaveAsync", [this.ballot, this.isEdit]).subscribe(res => {
    //   //console.log(res);
    //   if (res) {
    //     if (this.uploadImage) {
    //       this.uploadImage.updateFileDirectReload(res.patternID).subscribe((result) => {
    //         this.ballotSV.component.reLoadData(res);
    //         this.closeCreate();
    //         this.notificationsService.notify("Hệ thống thực thi thành công");
    //         return;
    //       });
    //     }
    //     else {
    //       this.ballotSV.component.reLoadData(res);
    //       this.notificationsService.notify("Hệ thống thực thi thành công");
    //       this.closeCreate();
    //     }
    //   }
    // });
  }

  checkDisable(ballot) {
    // if (ballot.isDefault)
    //   return true;
    // return false;
  }

  checkActive() {
    // var $elm = $('.symbol-label', $('.patternt'));
    // $elm.removeClass('color-check');
    // var elecolor = null;
    // var color = "";
    // if (!this.ballot.backgroundColor && this.isEdit) {
    //   elecolor = $('span[data-color="image"]').closest(".symbol-label");
    //   this.ballot.backgroundColor = "";
    // }
    // else {
    //   if (this.ballot.backgroundColor) {
    //     elecolor = $('.symbol-label[data-color="' + this.ballot.backgroundColor + '"]', $('.patternt'));
    //     if (elecolor.length === 0)
    //       elecolor = $('kendo-colorpicker.symbol-label');
    //   } else {
    //     elecolor = $('.symbol-label[data-color]', $('.patternt')).first();
    //     color = elecolor.data('color');
    //     this.ballot.backgroundColor = color;
    //     this.ballot.fileName = "";
    //   }
    // }
    // if (elecolor != null && elecolor.length > 0)
    //   elecolor.addClass('color-check');
    // this.changedr.detectChanges();
  }

  colorClick(e, ele) {
    // var $label = $('.symbol-label[data-color]', $('.patternt'));
    // $label.removeClass('color-check');
    // $(ele).addClass('color-check');
    // var color = $(ele).data('color');
    // this.ballot.backgroundColor = color;
    // this.ballot.fileName = "";
    // this.changedr.detectChanges();
  }

}
