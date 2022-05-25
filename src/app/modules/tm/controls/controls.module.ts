import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskInfoComponent } from './task-info/task-info.component';
import { CodxCoreModule } from 'codx-core';
import { environment } from 'src/environments/environment';
import { SharedModule } from '@shared/shared.module';
import { FormsModule } from '@angular/forms';
import { TabModule } from '@syncfusion/ej2-angular-navigations';



@NgModule({
  declarations: [TaskInfoComponent],
  exports:[TaskInfoComponent],
  imports: [
    CodxCoreModule.forRoot({ environment }),
    TabModule,
    FormsModule,CommonModule,SharedModule
  ]
})
export class ControlsModule { }
