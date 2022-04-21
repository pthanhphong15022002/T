import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChattingComponent } from './chatting/chatting.component';
import { DesignUIComponent } from './designui.component';

const routes: Routes = [
  {
    path: '',
    component: DesignUIComponent,
    children: [
      {
        path: '',
        redirectTo: 'chatting',
        pathMatch: 'full'
      },
      {
        path: 'chatting',
        component: ChattingComponent,
      },
     
      { path: '', redirectTo: 'chatting', pathMatch: 'full' },
      { path: '**', redirectTo: 'chatting', pathMatch: 'full' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DesignUIRoutingModule { }
