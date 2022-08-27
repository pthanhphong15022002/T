import {
  ChangeDetectorRef,
  Component,
  Injector,
  Input,
  OnInit,
} from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { TabModel } from './model/tabControl.model';

@Component({
  selector: 'codx-tabs',
  templateUrl: './codx-tabs.component.html',
  styleUrls: ['./codx-tabs.component.css'],
})
export class CodxTabsComponent implements OnInit {
  @Input() active = 1;
  @Input() funcID!: string;
  @Input() entityName!: string;
  @Input() objectID!: any;
  @Input() formModel!: any;
  @Input() TabControl: TabModel[] = [];
  //tree task
  @Input() dataTree: any[];
  @Input() vllStatus: any;
  //Attachment
  @Input() hideFolder: string = '1';
  @Input() type: string = 'inline';
  @Input() allowExtensions: string = '.jpg,.png';
  @Input() allowMultiFile: string = '1';
  @Input() displayThumb: string = 'full';

  private all: TabModel[] = [
    { name: 'Attachment', textDefault: 'Đính Kèm', isActive: true },
    { name: 'History', textDefault: 'Lịch sử', isActive: false },
    { name: 'Comment', textDefault: 'Bình luận', isActive: false },
    { name: 'Reference', textDefault: 'Tham chiếu', isActive: false },
    { name: 'Approve', textDefault: 'Xét duyệt', isActive: false },
  ];
  constructor(
    injector: Injector,
    private api:ApiHttpService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (this.TabControl.length == 0) {
      this.TabControl = this.all;
      // this.all.forEach((res, index) => {
      //   var tabModel = new TabModel();
      //   tabModel.name = tabModel.textDefault = res;
      //   if (index == 0) tabModel.isActive = true;
      //   else tabModel.isActive = false;
      //   this.TabControl.push(tabModel);
      // });
    } else {
      this.active = this.TabControl.findIndex(
        (x: TabModel) => x.isActive == true
      );
    }
    this.getHistoryAsync();
    this.changeDetectorRef.detectChanges();
  }

  fileAdded(e: any) {
    console.log(e);
  }

  getfileCount(e: any) {
    console.log(e);
  }
  lstComment:any = [];
  // getListComment(){
  //   this.api.execSv("BG","ERM.Business.BG","TrackLogsBusiness","GetListAsync")
  //   .subscribe((res:any[]) => {
  //     console.log(res);
  //     this.lstComment = res;
  //   })
  // }

  getHistoryAsync(){
    let objectID = "00cfeb10-a433-43e3-b6b3-876e25bf20a3";
    this.api.execSv("BG","ERM.Business.BG","TrackLogsBusiness","GetTrackLogsByObjectIDAsync" , objectID)
    .subscribe((res:any[]) => {
      console.log(res);
    });
  }
  
}
