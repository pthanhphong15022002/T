import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
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
                component: HomeComponent
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
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class WPRoutingModule { }
