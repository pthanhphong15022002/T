import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { HoverPreloadModule } from 'ngx-hover-preload';
import { ERMModule, SharedModule } from 'src/shared';
import { CoreModule } from 'src/core/core.module';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { DesignUIRoutingModule } from './designui-routing.module';
import { DesignUIComponent } from './designui.component';
import { ChattingComponent } from './chatting/chatting.component';

@NgModule({
  declarations: [
    DesignUIComponent,
    ChattingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,

    SharedModule,
    CoreModule,
    ERMModule,
    DesignUIRoutingModule,
    HoverPreloadModule,
    CodxCoreModule.forRoot({environment}),
  ]
})
export class DesignUIModule { }
