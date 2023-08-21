import { Component, Injector, OnInit } from '@angular/core';
import { CodxWsService } from '../codx-ws.service';
import { ActivatedRoute } from '@angular/router';
import { WSUIComponent } from '../default/wsui.component';

@Component({
  selector: 'lib-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css']
})
export class WorkspaceComponent extends WSUIComponent{
  constructor(inject: Injector) 
  {
    super(inject);
  }

  override onInit(): void {
    throw new Error('Method not implemented.');
  }
}
