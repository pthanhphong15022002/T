import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PagesRoutingModule } from '../pages-routing.module';
import { SharedModule } from 'src/shared';
import { LayoutComponent } from './layout.component';
import { NotesHomeComponent } from '@pages/home/notes-home/notes-home.component';
import { AddNoteComponent } from '@pages/home/notes-home/add-note/add-note.component';
import { HomeComponent } from '@pages/home/home.component';
import { ListPostComponent } from '@pages/home/list-post/list-post.component';
import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { AddPostComponent } from '@pages/home/list-post/popup-add/addpost/addpost.component';
import { CommonModule } from '@angular/common';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@NgModule({
  declarations: [
    LayoutComponent,
    NotesHomeComponent,
    AddNoteComponent,
    HomeComponent,
    ListPostComponent,
    AddPostComponent
  ],
  imports: [
    CommonModule,
    PagesRoutingModule,
    SharedModule,
    CodxShareModule,
    PickerModule
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
