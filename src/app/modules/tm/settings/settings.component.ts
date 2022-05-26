import { Component, OnInit } from '@angular/core';
import { CodxService } from 'codx-core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  constructor(
    public codxService: CodxService

  ) { }

  ngOnInit(): void {
  }


  navigate(funcId){

  }

}
