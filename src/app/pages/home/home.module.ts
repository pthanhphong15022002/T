import { CalendarModule } from '@syncfusion/ej2-angular-calendars';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { InlineSVGModule } from 'ng-inline-svg';
import { NotesHomeComponent } from './notes-home/notes-home.component';
import { AddNoteComponent } from './notes-home/add-note/add-note.component';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';

@NgModule({
  declarations: [
    HomeComponent,
    NotesHomeComponent,
    AddNoteComponent
  ],
  imports: [
    CommonModule,
    CalendarModule,
    CodxCoreModule.forRoot({ environment }),
    RouterModule.forChild([
      {
        path: '',
        component: HomeComponent,
      },
    ]),
    InlineSVGModule,
  ],
})
export class HomeModule { }
