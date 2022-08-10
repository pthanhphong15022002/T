import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthStore, NotificationsService } from 'codx-core';
import { CodxTMService } from '../../codx-tm.service';
import { TabModelSprints } from '../../models/TM_Sprints.model';

@Component({
  selector: 'lib-sprintdetails',
  templateUrl: './sprintdetails.component.html',
  styleUrls: ['./sprintdetails.component.css'],
})
export class SprintDetailsComponent implements OnInit {
  active = 1 ;
  sprints: any;
  iterationID:any;
  user: any ;
  funcID: any;
  tabControl : TabModelSprints[] = []
  private all = ['Dashboard','Công việc' ,'Lịch sử', 'Bình luận', 'Họp định kì'];


  constructor(
    private changeDetectorRef: ChangeDetectorRef ,
    private authStore: AuthStore,
    private activedRouter: ActivatedRoute,
    private notiService: NotificationsService,
    private tmSv: CodxTMService
  ) {
    this.user = this.authStore.get();
    this.funcID = this.activedRouter.snapshot.params['funcID'];
    this.activedRouter.firstChild?.params.subscribe(
      (data) => (this.iterationID = data.id)
    );
    if (this.iterationID != '') {
      this.tmSv.getSprintsDetails(this.iterationID).subscribe((res) => {
        if (res) {
          this.sprints = res;
        }
      });
    }
  }

  ngOnInit(): void {
    // if (this.tabControl.length == 0) {
    //   this.all.forEach((res, index) => {
    //     var tabModel = new TabModelSprints();
    //     tabModel.name = tabModel.textDefault = res;
    //     if (index == 1) tabModel.isActive = true;
    //     else tabModel.isActive = false;
    //     this.tabControl.push(tabModel);
    //   });
    // } else {
    //   this.active = this.tabControl.findIndex(
    //     (x: TabModelSprints) => x.isActive == true
    //   );
    // }
    // this.changeDetectorRef.detectChanges();
  }
}
