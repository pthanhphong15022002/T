import { TmComponent } from './tm.component';
import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

const routes: Routes = [{
  path: '',
  component: TmComponent
}, {
  path: '',
  redirectTo: ''
}]

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild(routes)
  ]
})
export class TmModule { }
