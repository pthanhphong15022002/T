import { CodxCoreModule } from 'codx-core';

import { Type, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

import { CoreModule } from 'src/core/core.module';
import { environment } from 'src/environments/environment';

const ERM_COMPONENTS: Type<any>[] = [

];

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    FormsModule,
    // ColorSketchModule,
    CoreModule,
    CodxCoreModule.forRoot({ environment }),
  ],
  providers: [],
  declarations: [ERM_COMPONENTS],
  exports: [ERM_COMPONENTS],
})
export class ERMModule { }
