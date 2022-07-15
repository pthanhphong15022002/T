import { Component, OnInit, Optional } from '@angular/core';
import { DialogData, DialogRef } from 'codx-core';

@Component({
  selector: 'lib-pop-add-skill',
  templateUrl: './pop-add-skill.component.html',
  styleUrls: ['./pop-add-skill.component.css']
})
export class PopAddSkillComponent implements OnInit {
  title = "Thêm kỹ năng";
  dialog: any;
  constructor(
    @Optional() dialog?: DialogRef,
    @Optional() dt?: DialogData
  ) { 

  }

  ngOnInit(): void {
  }

}
