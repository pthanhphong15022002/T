import { BehaviorSubject, Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { ApiHttpService } from 'codx-core';
import { tmpUser } from './models/tmpUser';
@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  public tmpUsers: tmpUser[] = [];
  constructor(private api: ApiHttpService) { }

  ngOnInit(): void {
    this.api.execSv<tmpUser>('SYS','AD','UsersBusiness','GetListAsync').subscribe((res)=>{
      console.log(res);
    })
  }

  // GetListUser() {
  //   return this.api.execSv<tmpUser>('SYS','AD','UsersBusiness','GetListAsync').subscribe((res)=>{
  //     console.log(res);
  //   })
  // }
}
