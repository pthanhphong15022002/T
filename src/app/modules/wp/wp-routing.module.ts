import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EventComponent } from './event/event.component';
import { HomeComponent } from './home/home.component';
import { PersonalComponent } from './personal/personal.component';
import { LayoutComponent } from './_layout/layout.component';
import { ProfileOverviewComponent } from './personal/profile-overview/profile-overview.component';

const routes: Routes = [
  {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path:'home',
                loadChildren: () =>
                    import('./home/home.module').then((m) => m.HomeModule),
            },
            {
                path:'event',
                loadChildren: () =>
                import('./event/event.module').then((m) => m.EventModule),
            },
            {
                path:'personalspace',
                component: PersonalComponent
            },
            {
                path:'personalspace/profile-overview',
                component: ProfileOverviewComponent
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
  declarations: [HomeComponent],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WPRoutingModule { }
