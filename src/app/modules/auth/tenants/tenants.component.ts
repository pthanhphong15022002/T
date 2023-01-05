import { Route, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ApiHttpService, AuthStore } from 'codx-core';

@Component({
  selector: 'app-tenants',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.scss'],
})
export class TenantsComponent implements OnInit {
  constructor(
    private router: Router,
    private api: ApiHttpService,
    private authStore: AuthStore
  ) {
    this.user = this.authStore.get();
  }

  lstTenant = [];
  private user;
  ngOnInit(): void {
    // this.router.navigate(['/tester']);
    this.getTenants().subscribe((tenants: Array<any>) => {
      this.lstTenant = tenants;
    });
  }

  getTenants() {
    return this.api.execSv(
      'Tenant',
      'Tenant',
      'TenantsBusiness',
      'GetListDatabaseByEmailAsync',
      this.user.email
    );
  }
}
