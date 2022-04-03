import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MomentModule } from 'ngx-moment';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

@NgModule({
    imports: [
        CommonModule,
        MomentModule,
        NgxSkeletonLoaderModule,
    ],
    declarations: [],
    exports: [
        MomentModule,
        NgxSkeletonLoaderModule],
})
export class SharedModule { }
