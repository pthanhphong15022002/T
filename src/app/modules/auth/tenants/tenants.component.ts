import { Route, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ApiHttpService, AuthService, AuthStore } from 'codx-core';

@Component({
  selector: 'app-tenants',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.scss'],
})
export class TenantsComponent implements OnInit {
  constructor(
    private router: Router,
    private api: ApiHttpService,
    private authStore: AuthStore,
    private authService: AuthService
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

  navigate(tn) {
    this.authService.createUserToken(tn).subscribe((res) => {
      if (res) this.router.navigate(['/' + tn]);
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
