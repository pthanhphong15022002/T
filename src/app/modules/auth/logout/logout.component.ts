import { Component, OnDestroy, OnInit } from '@angular/core';
import { CodxShareService } from 'projects/codx-share/src/public-api';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {
  constructor(private codxShareSV: CodxShareService) {}
  ngOnInit(): void {
    this.codxShareSV.logout();
  }
}
