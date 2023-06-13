import { Component } from '@angular/core';
import { LayoutModel } from 'codx-core/lib/models/layout.model';
import { CodxCmService } from '../codx-cm.service';

@Component({
  selector: 'lib-setting-process-cm',
  templateUrl: './setting-process-cm.component.html',
  styleUrls: ['./setting-process-cm.component.css']
})
export class SettingProcessCmComponent {

  constructor(
    private cmSv: CodxCmService
  ){

  }
  ngOnInit(): void {
  }
}
