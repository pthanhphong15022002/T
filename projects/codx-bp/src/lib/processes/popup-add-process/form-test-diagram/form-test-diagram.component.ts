import { Component, Optional } from "@angular/core";
import { ApiHttpService, DialogData, DialogRef } from "codx-core";

@Component({
  selector: 'form-test-diagram',
  templateUrl: './form-test-diagram.component.html',
  styleUrls: ['./form-test-diagram.component.scss']
})
export class FormTestDiagramComponent {
  dialog: DialogRef;
  title = 'Test DIAGRAM';
  settings = [];
  isLoad = false;
  constructor(
    private api: ApiHttpService,
    @Optional() dg: DialogRef,
    @Optional() dt: DialogData
  ) {
    this.dialog = dg;
  }
}
