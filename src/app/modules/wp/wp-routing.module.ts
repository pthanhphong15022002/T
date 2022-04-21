import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LayoutComponent } from './_layout/layout.component';

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
