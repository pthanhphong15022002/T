import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CodxMwpService } from '../codx-mwp.service';

@Component({
  selector: 'lib-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {

  funcID: any;
  constructor(private activedRouter: ActivatedRoute, private mwpService:CodxMwpService) {
    this.funcID = this.activedRouter.snapshot.params['funcID'];
  }

  ngOnInit(): void {
    this.changeFunction()
  }
  changeFunction(){
    this.mwpService.childMenuClick.subscribe((res) => {
      if (res && res.func) {
        if (this.funcID != res.func.functionID)
          this.funcID = res.func.functionID;
        this.mwpService.childMenuClick.next(null);
      }
    });
  }

}
