import { Component, OnInit } from '@angular/core';
import { auto } from '@popperjs/core';
import { CallFuncService, DialogRef, FormModel, SidebarModel } from 'codx-core';
import { PopupTypeTaskComponent } from 'projects/codx-dp/src/lib/dynamic-process/popup-add-dynamic-process/step-task/popup-type-task/popup-type-task.component';
import { PopupTaskComponent } from '../task/popup-task/popup-task.component';

@Component({
  selector: 'lib-test-componet',
  templateUrl: './test-componet.component.html',
  styleUrls: ['./test-componet.component.scss']
})
export class TestComponetComponent implements OnInit {
  popupJob: DialogRef;
 
  constructor( 
    private callfc: CallFuncService,) { }

  ngOnInit(): void {
  }
 
  

}
