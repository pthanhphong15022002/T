import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PagesRoutingModule } from '../pages-routing.module';
import { SharedModule } from 'src/shared';
import { LayoutComponent } from './layout.component';
import { NotesHomeComponent } from '@pages/home/notes-home/notes-home.component';
import { AddNoteComponent } from '@pages/home/notes-home/add-note/add-note.component';
import { HomeComponent } from '@pages/home/home.component';

@NgModule({
  declarations: [
    LayoutComponent,
    NotesHomeComponent,
    AddNoteComponent,
    HomeComponent
  ],
  imports: [
    PagesRoutingModule,
    SharedModule
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
