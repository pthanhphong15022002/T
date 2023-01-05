import {
  BP_Processes,
  BP_ProcessesRating,
} from './../models/BP_Processes.model';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FileUpload, View } from '@shared/models/file.model';
import { FileService } from '@shared/services/file.service';
import {
  ApiHttpService,
  CacheService,
  DialogData,
  DialogRef,
  NotificationsService,
  Util,
} from 'codx-core';
import { CodxBpService } from '../codx-bp.service';
import { CodxTreeHistoryComponent } from 'projects/codx-share/src/lib/components/codx-tree-history/codx-tree-history.component';
import { environment } from 'src/environments/environment';
import { CodxHistoryComponent } from 'projects/codx-share/src/lib/components/codx-history/codx-history.component';

@Component({
  selector: 'lib-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css'],
})
export class PropertiesComponent implements OnInit {
  @ViewChild('history') history: CodxHistoryComponent;

  process = new BP_Processes();
  rattings: BP_ProcessesRating[] = [];
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
  flowChart= '';
  objectID: any;
  firstNameVersion:string = '';
  listUserName:any;
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private notificationsService: NotificationsService,
    private bpSV: CodxBpService,
    private cache: CacheService,
    private api: ApiHttpService,
    @Optional() data?: DialogData,
    @Optional() dialog?: DialogRef
  ) {
    this.dialog = dialog;
    this.data = JSON.parse(JSON.stringify(data.data));
    this.objectID = this.data.recID;
    this.process = this.data;
    this.funcID = this.dialog.formModel.funcID;
    this.entityName = this.dialog.formModel.entityName;
    this.getAvatar(this.process);

    if (this.process.rattings.length > 0)
      this.rattings = this.process.rattings.sort(
        (a, b) =>
          new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
      );
    this.totalRating = 0;
  }

  ngOnInit(): void {
    this.cache.message('BP001').subscribe((res) => {
      if (res) {
        this.firstNameVersion = Util.stringFormat(
          res.defaultName,''
        ).trim()+': '+'V0.0';
      }
    });
    this.openProperties(this.data.recID);
    var listnew= this.process.versions.map(x => x.createdBy)
    this.bpSV.getUserNameByListId(listnew).subscribe((res)=> {
      this.listUserName= res;
    });

    this.changeDetectorRef.detectChanges();
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   this.eventEnter();
  // }

  loadUserName(id) {
    // this.api.callSv('SYS','AD','UsersBusiness','GetAsync', id).subscribe(res=>{
    //   if(res.msgBodyData[0]){
    //     this.userName = res.msgBodyData[0].userName;
    //   }
    // });
  }

  openProperties(id): void {
    this.id = id;
    this.totalViews = 0;
    this.readonly = false;
    this.commenttext = '';
    this.requestTitle = '';
    this.currentRate = 1;
    this.getRating(this.rattings);
    this.changeDetectorRef.detectChanges();
  }

  //#region event enter comment
  eventEnter() {
    var input = document.getElementById('myInput');
    input.addEventListener('keypress', function (event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('myBtn').click();
      }
    });
  }
  //#endregion

  //#region mo rong
  extendShow(): void {
    this.hideExtend = !this.hideExtend;
    var doc = document.getElementsByClassName('extend-more')[0];
    var ext = document.getElementsByClassName('ext_button')[0];
    if (doc != null) {
      if (this.hideExtend) {
        document
          .getElementsByClassName('codx-dialog-container')[0]
          .setAttribute('style', 'width: 550px; z-index: 1000;');
        doc.setAttribute('style', 'display: none');
        ext.classList.remove('rotate-back');
      } else {
        document
          .getElementsByClassName('codx-dialog-container')[0]
          .setAttribute('style', 'width: 900px; z-index: 1000;');
        doc.setAttribute('style', 'display: block');
        ext.classList.add('rotate-back');
      }
    }

    this.changeDetectorRef.detectChanges();
  }
  //#endregion

  //region rating
  getRating(data: BP_ProcessesRating[]) {
    let _rating1 = 0;
    let _rating2 = 0;
    let _rating3 = 0;
    let _rating4 = 0;
    let _rating5 = 0;
    let _sum = 0;
    this.totalViews = 0;

    if (data != null) {
      var list = data.filter((x) => x.ratting > 0);
      this.totalViews = list.length;
      //res.views.forEach(item => {
      for (var i = 0; i < list.length; i++) {
        _sum = _sum + list[i].ratting;
        switch (list[i].ratting) {
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
    this.bpSV
      .setViewRattings(
        this.id,
        this.currentRate.toString(),
        this.commenttext,
        this.funcID,
        this.entityName
      )
      .subscribe((res) => {
        if (res.rattings.length > 0) {
          this.currentRate = 1;
          this.readonly = false;
          this.commenttext = '';
          this.process = res;
          this.objectID = this.process.recID;
          this.rattings = this.process.rattings.sort(
            (a, b) =>
              new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
          );
          this.getRating(res.rattings);
          this.notificationsService.notifyCode('DM010');
          this.dialog.dataService.update(this.process).subscribe();
          this.history.getDataAsync(this.objectID);
          this.changeDetectorRef.detectChanges();
        }
      });
  }

  setClassRating(i, rating) {
    if (i <= rating) return 'icon-star text-warning icon-16 mr-1';
    else return 'icon-star text-muted icon-16 mr-1';
  }

  // viewFlowChart() {
  //   let paras = [
  //     '',
  //     this.funcID,
  //     this.process?.recID,
  //     'BP_Processes',
  //     'inline',
  //     1000,
  //     this.process?.processName,
  //     'Flowchart',
  //     false,
  //   ];
  //   this.api
  //     .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', paras)
  //     .subscribe((res) => {
  //       if (res && res?.url) {
  //         let obj = {
  //           pathDisk: environment.urlUpload + '/' + res?.url,
  //           fileName: this.process?.processName,
  //         };
  //         this.flowChart = obj;
  //       }
  //     });
  // }

  getAvatar(process) {
    let avatar = [
      '',
      this.funcID,
      process?.recID,
      'BP_Processes',
      'inline',
      1000,
      process?.processName,
      'avt',
      false,
    ];
    let flowChart = [
      '',
      this.funcID,
      process?.recID,
      'BP_Processes',
      'inline',
      1000,
      process?.processName,
      'Flowchart',
      false,
    ];
    this.api
      .execSv<any>('DM', 'DM', 'FileBussiness', 'GetAvatarAsync', avatar)
      .subscribe((res) => {
        if (res && res?.url) {
          this.flowChart = environment.urlUpload + '/' + res?.url;
          this.changeDetectorRef.detectChanges();
        } else {
          this.api
            .execSv<any>(
              'DM',
              'DM',
              'FileBussiness',
              'GetAvatarAsync',
              flowChart
            )
            .subscribe((res) => {
              if (res && res?.url) {
                this.flowChart = environment.urlUpload + '/' + res?.url;
                this.changeDetectorRef.detectChanges();
              }
            });
        }
      });
  }
}
