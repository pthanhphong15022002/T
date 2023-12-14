import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore, RealHubService, TenantStore } from 'codx-core';

@Component({
  selector: 'codx-containers',
  templateUrl: './codx-containers.component.html',
  styleUrls: ['./codx-containers.component.scss']
})
export class CodxContainersComponent implements OnInit {
  constructor(
    private router: Router,
    private adHub: RealHubService,
    private authStore: AuthStore,
    private tenantStore: TenantStore
  ) {
  }

  ngOnInit(): void {
    var t = this;
    this.adHub.start('ad').then(x=>{
      x?.$subjectReal.asObservable().subscribe(d=>{
        if(d.event == "RemoveSession"){
          var us = t.authStore.get();
          if(us.securityKey == d.data){
            let tenant = t.tenantStore.getName();
            t.authStore.remove();
            t.tenantStore.removeKey();
            t.router.navigate([`/${tenant}/auth/login`]);
          }
        }
      });
    });
  }
}
