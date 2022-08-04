import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { LayoutComponent } from './_layout/layout.component';
import { IncommingComponent } from './incomming/incomming.component';
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartsComponent } from './charts/charts.component';
import { AccumulationChartAllModule, ChartAllModule } from '@syncfusion/ej2-angular-charts';
import { SharedModule } from '@shared/shared.module';
import { DepartmentComponent } from './incomming/department/department.component';
import { ForwardComponent } from './incomming/forward/forward.component';
//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CodxOdComponent } from './codx-od.component';
import { UpdateExtendComponent } from './incomming/update/update.component';
import { AgencyComponent } from './incomming/agency/agency.component';
import { ExtendDeadlineComponent } from './incomming/deadline/deadline.component';
import { SharingComponent } from './incomming/sharing/sharing.component';
import { AssignTaskComponent } from './incomming/assigntask/assigntask.component';
import { AssignSubMenuComponent } from './assignsubmenu/assignsubmenu.component';
import { AddLinkComponent } from './incomming/addlink/addlink.component';
import { SendEmailComponent } from './incomming/sendemail/sendemail.component';
import { ViewDetailComponent } from './incomming/view-detail/view-detail.component';
import { IncommingAddComponent } from './incomming/incomming-add/incomming-add.component';
import { FolderComponent } from './incomming/folder/folder.component';
import { ThumbnailComponent } from 'projects/codx-share/src/lib/components/thumbnail/thumbnail.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { CodxFullTextSearch } from 'projects/codx-share/src/lib/components/codx-fulltextsearch/codx-fulltextsearch.component';
import { SearchingComponent } from './incomming/searching/searching.component';
import { TabsComponent } from './incomming/tab/tabs.component';
import { ApprovalComponent } from './approval/approval.component';
import { ApprovalViewDetailComponent } from './approval/view-detail/view-detail.component';

const routes: Routes = [
  {
    path: '', 
    component: LayoutComponent,
    children: [
      {
        path: 'home/:funcID',
        component: HomeComponent,
      },
      {
        path: 'dispatches/:funcID',
        component: IncommingComponent
      },  
      {
        path: 'searching/:funcID',
        component: SearchingComponent
      },   
      {
        path: 'approvalfiles/:funcID',
        component: ApprovalComponent
      }, 
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

@NgModule({
  declarations: [
    LayoutComponent,
    HomeComponent,
    IncommingComponent, 
    CodxOdComponent,
    UpdateExtendComponent, 
    ChartsComponent,     
    AgencyComponent,
    DepartmentComponent, 
    ForwardComponent,
    ExtendDeadlineComponent,
    SharingComponent,
    AssignTaskComponent,    
    AssignSubMenuComponent,
    AddLinkComponent,
    SendEmailComponent,
    ViewDetailComponent,
    IncommingAddComponent,
    FolderComponent,
    SearchingComponent,
    TabsComponent,
    ApprovalComponent,
    ApprovalViewDetailComponent
  ],
  imports: [RouterModule.forChild(routes),
  CodxCoreModule.forRoot({ environment }),
  CommonModule , 
  FormsModule , 
  ReactiveFormsModule, 
  ChartAllModule, 
  AccumulationChartAllModule , 
  SharedModule,
  CodxShareModule
  // NgbModule
  
  ],
  exports: [RouterModule],
})
export class CodxODModule { }  
 