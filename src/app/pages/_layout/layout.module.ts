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
import { AddNoteComponent } from '@pages/home/add-note/add-note.component';
import { SaveNoteComponent } from '@pages/home/add-note/save-note/save-note.component';
import { UpdateNotePinComponent } from '@pages/home/update-note-pin/update-note-pin.component';
import { MyTeamComponent } from '@pages/home/my-team/my-team.component';
import { UpdateNoteComponent } from '@pages/home/update-note/update-note.component';
//import { PickerModule } from '@ctrl/ngx-emoji-mart';

@NgModule({
  declarations: [
    LayoutComponent,
    HomeComponent,
    ListPostComponent,
    AddPostComponent,
    AddNoteComponent,
    SaveNoteComponent,
    UpdateNotePinComponent,
    MyTeamComponent,
    UpdateNoteComponent,
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    SharedModule,
    CodxShareModule,
   // PickerModule
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
