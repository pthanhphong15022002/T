import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HoverPreloadStrategy } from 'ngx-hover-preload';
import { AuthGuard } from 'codx-core';
export const routes: Routes = [
  {
    path: ':tenant',
    children: [
      {
        path: 'auth',
        loadChildren: () =>
          import('./modules/auth/auth.module').then((m) => m.AuthModule),
      },
      {
        path: 'error',
        loadChildren: () =>
          import('./pages/errors/errors.module').then((m) => m.ErrorsModule),
      },
      {
        path: '',
        canActivate: [AuthGuard],
        loadChildren: () =>
          import('./pages/_layout/layout.modules').then((m) => m.LayoutModule),
      },
      {
        path: 'chatting',
        loadChildren: () =>
          import('./modules/chatting/_layout/layout.modules').then((m) => m.LayoutModule),
      },
      {
        path: 'wp',
        loadChildren: () =>
          import('./modules/wp/_layout/layout.modules').then((m) => m.LayoutModule),
      },
      { path: '**', redirectTo: 'error/404' }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: HoverPreloadStrategy })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
