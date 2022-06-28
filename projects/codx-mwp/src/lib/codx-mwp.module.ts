import { CodxShareModule } from 'projects/codx-share/src/public-api';
import { UpdateNoteBookComponent } from './personals/note-books/update-note-book/update-note-book.component';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CodxCoreModule, EnvironmentConfig } from 'codx-core';
import { InlineSVGModule } from 'ng-inline-svg';
import { LayoutComponent } from './_layout/layout.component';
import { EmployeeInfomationComponent } from './employeeinfomation/employee-infomation.component';
import { HomeComponent } from './home/home.component';
import { PersonalsComponent } from './personals/personals.component';
import { ImgComponent } from './personals/img/img.component';
import { VideoComponent } from './personals/video/video.component';
import { StorageComponent } from './personals/storage/storage.component';
import { UpdateStorageComponent } from './personals/storage/update-storage/update-storage.component';
import { InfoLeftComponent } from './employeeinfomation/info-left/info-left.component';
import { AddUpdateStorageComponent } from './personals/storage/add-update-storage/add-update-storage.component';
import { DetailStorageComponent } from './personals/storage/detail-storage/detail-storage.component';
import { NoteBooksComponent } from './personals/note-books/note-books.component';
import { UpdateDetailNoteBookComponent } from './personals/note-books/detail/update-detail-note-book/update-detail-note-book.component';
import { AddDetailNoteBooksComponent } from './personals/note-books/detail/add-detail-note-books/add-detail-note-books.component';
import { DetailNoteBooksComponent } from './personals/note-books/detail/detail-note-books/detail-note-books.component';
import { AttachmentComponent } from 'projects/codx-share/src/lib/components/attachment/attachment.component';
import { AddUpdateNoteBookComponent } from './personals/note-books/add-update-note-book/add-update-note-book.component';
import { PostsComponent } from './personals/posts/posts.component';
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'personals/:funcID',
        component: PersonalsComponent,
      },
      {
        path: 'employeeinfo/:funcID',
        component: EmployeeInfomationComponent,
      },
    ],
  },
];

const Component: Type<any>[] = [
  LayoutComponent,
  EmployeeInfomationComponent,
  HomeComponent,
  PersonalsComponent,
  ImgComponent,
  VideoComponent,
  StorageComponent,
  UpdateStorageComponent,
  DetailStorageComponent,
  AddUpdateStorageComponent,
  InfoLeftComponent,
  NoteBooksComponent,
  AddUpdateNoteBookComponent,
  UpdateNoteBookComponent,
  AddDetailNoteBooksComponent,
  UpdateDetailNoteBookComponent,
  DetailNoteBooksComponent,
  PostsComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    InlineSVGModule.forRoot(),
    HttpClientModule,
    CodxCoreModule,
    RouterModule.forChild(routes),
    CodxShareModule,
  ],
  exports: [
    RouterModule,
  ],
  declarations: [Component],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CodxMwpModule {
  public static forRoot(
    config?: EnvironmentConfig
  ): ModuleWithProviders<CodxCoreModule> {
    return {
      ngModule: CodxCoreModule,
      providers: [
        HttpClientModule,
        { provide: EnvironmentConfig, useValue: config },
      ],
    };
  }
}
