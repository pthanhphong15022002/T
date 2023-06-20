import { CodxDpService } from './../../codx-dp.service';
import { DP_Processes, DP_Processes_Ratings } from './../../models/models';
import { ChangeDetectorRef, Component, OnInit, Optional } from '@angular/core';
import {
  ApiHttpService,
  AuthStore,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
} from 'codx-core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'lib-popup-properties',
  templateUrl: './popup-properties.component.html',
  styleUrls: ['./popup-properties.component.css'],
})
export class PopupPropertiesComponent implements OnInit {
  process = new DP_Processes();
  ratings: DP_Processes_Ratings[] = [];
  dialog: any;
  data: any;
  hideExtend = true;
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
  commenttext: string = '';
  id: string;
  vlL1473: any;
  requestTitle: string;
  userName = '';
  funcID: any;
  entityName: any;
  linkAvt = '';
  objectID: any;
  firstNameVersion: string = '';
  listUserName: any;
  userNameLogin: any;
  isCheckNotUserNameLogin: boolean = false;
  index: number = 0;
  user: any;
  lstO = [];
  lstP = [];
  lstF = [];

  userIdLogin: any;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private dpSv: CodxDpService,
    private cache: CacheService,
    private api: ApiHttpService,
    private authStore: AuthStore,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(data.data));
    this.process = this.data;
    if (this.process.ratings != null && this.process.ratings.length > 0)
      this.ratings = this.process.ratings.sort(
        (a, b) =>
          new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
      );
    this.totalRating = 0;
    this.lstO = this.process.permissions.filter(x=>x.roleType == 'O');
    this.lstP = this.process.permissions.filter(x=>x.roleType == 'P');
    this.lstF = this.process.permissions.filter(x=>x.roleType == 'F');
    this.user = this.authStore.get();
    this.funcID = this.dialog.formModel.funcID;
    this.entityName = this.dialog.formModel.entityName;
    this.getAvatar(this.process);
    this.getUserName(this.process?.createdBy);
  }

  ngOnInit(): void {
    this.openProperties(this.process.recID);
  }

  getUserName(id){
    this.dpSv.getUserByID(id).subscribe(res=>{
      this.userName = res?.userName;
    })
  }

  extendShow() {}

  openProperties(id): void {
    this.id = id;
    this.totalViews = 0;
    this.readonly = false;
    this.commenttext = '';
    this.requestTitle = '';
    this.currentRate = 1;
    this.getRating(this.ratings);
    this.changeDetectorRef.detectChanges();
  }

  //region rating
  getRating(data: DP_Processes_Ratings[]) {
    let _rating1 = 0;
    let _rating2 = 0;
    let _rating3 = 0;
    let _rating4 = 0;
    let _rating5 = 0;
    let _sum = 0;
    this.totalViews = 0;

    if (data != null) {
      var list = data.filter((x) => x.rating > 0);
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
      this.rating1 =
        ((_rating1 / this.totalViews) * 100).toFixed(0).toString() + '%';
      this.rating2 =
        ((_rating2 / this.totalViews) * 100).toFixed(0).toString() + '%';
      this.rating3 =
        ((_rating3 / this.totalViews) * 100).toFixed(0).toString() + '%';
      this.rating4 =
        ((_rating4 / this.totalViews) * 100).toFixed(0).toString() + '%';
      this.rating5 =
        ((_rating5 / this.totalViews) * 100).toFixed(0).toString() + '%';
      this.totalRating = _sum / this.totalViews;
    } else {
      this.rating1 = '0%';
      this.rating2 = '0%';
      this.rating3 = '0%';
      this.rating4 = '0%';
      this.rating5 = '0%';
      this.totalRating = 0;
    }
    this.totalRating = parseFloat(this.totalRating.toFixed(2));
    this.styleRating = (this.totalRating * 2 * 10).toFixed(2).toString() + '%';
  }
  //#endregion

  //#region event
  txtValue($event, type) {
    switch (type) {
      case 'commenttext':
        this.commenttext = $event.data;
        break;
    }
  }
  //#endregion

  setComment(event = null) {
    console.log(event);
    this.dpSv
      .setViewRatings(
        this.process.recID,
        this.currentRate.toString(),
        this.commenttext,
        this.funcID,
        this.entityName
      )
      .subscribe((res) => {
        if (res.ratings.length > 0) {
          this.currentRate = 1;
          this.readonly = false;
          this.commenttext = '';
          this.process = res;
          this.ratings = this.process.ratings.sort(
            (a, b) =>
              new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
          );
          this.getRating(res.ratings);
          this.notificationsService.notifyCode('DM010');
          this.dialog.dataService.update(this.process).subscribe();
          // this.history.getDataAsync(this.objectID);
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  setClassRating(i, rating) {
    if (i <= rating) return 'icon-star text-warning icon-16 mr-1';
    else return 'icon-star text-muted icon-16 mr-1';
  }

  async getAvatar(process) {
    var link = '';
    let avatar = [
      '',
      this.funcID,
      process?.recID,
      'DP_Processes',
      'inline',
      1000,
      process?.processName,
      'avt',
      false,
    ];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .subscribe((res) => {
        if (res && res?.url) {
          this.linkAvt = environment.urlUpload + '/' + res?.url;
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  valueUser(data){
    var id = '';
    return id = id + ';' + data;
  }
}
