import { ChangeDetectorRef, Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { ApiHttpService, AuthStore, CodxListviewComponent, ImageviewersComponent } from 'codx-core';
import * as moment from "moment";
import { TmService } from '../tm.service';

@Component({
  selector: 'app-view-list-details',
  templateUrl: './view-list-details.component.html',
  styleUrls: ['./view-list-details.component.scss']
})
export class ViewListDetailsComponent implements OnInit {
  @Input() data = [];
  user: any;
  objectAssign: any;
  objectState: any;
  itemSelected = null;
  moment = moment().locale("en");
  today: Date = new Date();
  fromDate: Date = moment(this.today).startOf("day").toDate();
  toDate: Date = moment(this.today).endOf("day").toDate();
  configParam = null;
  dateNow: string = '';
  yesterday = '';
  lstItems = [];
  dataObj = { view: "listDetails", viewBoardID: "" };
  
  @ViewChild("listview") listview!: CodxListviewComponent;
  @ViewChild("imageviewers") imageviewers!: ImageviewersComponent;


  constructor(
    private tmSv: TmService,
    // private mainService: MainService,
    // private changeDetectorRef: ChangeDetectorRef,
    // private confirmationDialogService: ConfirmationDialogService,
    // private api: ApiHttpService,
    private authStore: AuthStore,
    private dt: ChangeDetectorRef,
    injector: Injector
  ) {
    // super(
    //   {

    //   } as ModelPage,
    //   injector
    // )
    this.user = this.authStore.get();
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    
  }
  loadData(){
    const t = this;
    t.tmSv.isChangeData.subscribe((res) => {
      if (res) {
        if (res.data.length) {
          //  if (this.modelPage.functionID == 'TM001') {
          //   this.data = res.data.filter((x) => x.userID == t.user.userID);
          //   if (this.data.length) {
          //     t.data = this.data;
          //     t.dt.detectChanges();
          //   }
          // }
          // else 
          t.data = res.data;
        }
        else t.data = [];
      }
      this.lstItems = [];
      this.data.forEach(dt => {
        dt.mytasks.forEach(e => {
          this.lstItems.push(e)
        })
      });
      this.itemSelected = this.lstItems[0];
      t.dt.detectChanges();
    });
  }
}
