import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PagesRoutingModule } from '../pages-routing.module';
import { SharedModule } from 'src/shared';
import { LayoutComponent } from './layout.component';
import { HomeComponent } from '@pages/home/home.component';
import { ListPostComponent } from '@pages/home/list-post/list-post.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { AddPostComponent } from '@pages/home/list-post/popup-add/addpost/addpost.component';
import { CommonModule } from '@angular/common';
import { MyTeamComponent } from '@pages/home/my-team/my-team.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { CoreModule } from '@core/core.module';
import { CodxCoreModule } from 'codx-core';

@NgModule({
  declarations: [
    LayoutComponent,
    HomeComponent,
    ListPostComponent,
    AddPostComponent,
    MyTeamComponent,
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    SharedModule,
    CodxCoreModule,
    CodxShareModule,
    PickerModule,
    CoreModule
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
