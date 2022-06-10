import { Component, Input, OnInit } from '@angular/core';
import { AuthStore, ViewsComponent } from 'codx-core';

@Component({
  selector: 'app-assign-info',
  templateUrl: './assign-info.component.html',
  styleUrls: ['./assign-info.component.scss']
})
export class AssignInfoComponent implements OnInit {
  user : any ;
  @Input('viewBase') viewBase: ViewsComponent;
  
  constructor(  private authStore: AuthStore,) {
    this.user = this.authStore.get();
   }

  ngOnInit(): void {
  }

  changeValueDescription(e){

  }

  showPanel() {
    this.viewBase.currentView.openSidebarRight();
  }
  closePanel() {
    this.viewBase.currentView.closeSidebarRight();
  }

  openInfo(taskAction){
    this.viewBase.currentView.openSidebarRight();
  }
}
