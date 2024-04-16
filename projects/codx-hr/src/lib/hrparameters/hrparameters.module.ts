import { Routes, RouterModule } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HRParametersComponent } from './hrparameters.component';
import { HomeHrparametersComponent } from './home-hrparameters/home-hrparameters.component';
import { CertificatesComponent } from './category/certificates/certificates.component';
import { NationalitiesComponent } from './category/nationalities/nationalities.component';
import { CountriesComponent } from './category/countries/countries.component';
import { ProvincesComponent } from './category/provinces/provinces.component';
import { DistrictsComponent } from './category/districts/districts.component';
import { CompetencesComponent } from './category/competences/competences.component';
import { EducationsComponent } from './category/educations/educations.component';
import { OrganizationsComponent } from './category/organizations/organizations.component';
import { ReligionsComponent } from './category/religions/religions.component';
import { EthnicGroupsComponent } from './category/ethnic-groups/ethnic-groups.component';
import { FormsModule } from '@angular/forms';
import { CodxCoreModule } from 'codx-core';
import { CoreModule } from '@core/core.module';
import { CodxShareModule } from 'projects/codx-share/src/public-api';

const routes: Routes = [
  {
    path: '',
    component: HRParametersComponent,
    children: [
      {
        path: ':funcID',
        component: HomeHrparametersComponent,
      },
      {
        path: 'certificate/:funcID',
        component: CertificatesComponent,
      },
      {
        path: 'nationality/:funcID',
        component: NationalitiesComponent,
      },
      {
        path: 'country/:funcID',
        component: CountriesComponent,
      },
      {
        path: 'province/:funcID',
        component: ProvincesComponent,
      },
      {
        path: 'district/:funcID',
        component: DistrictsComponent,
      },
      {
        path: 'competence/:funcID',
        component: CompetencesComponent,
      },
      {
        path: 'education/:funcID',
        component: EducationsComponent,
      },
      {
        path: 'organization/:funcID',
        component: OrganizationsComponent,
      },
      {
        path: 'religions/:funcID',
        component: ReligionsComponent,
      },
      {
        path: 'ethnicgroups/:funcID',
        component: EthnicGroupsComponent,
      },
    ],
  },
];


const T_Module = [
  CommonModule,
  FormsModule,
  CodxCoreModule,
  CoreModule,
  CodxShareModule,
]


@NgModule({
  declarations: [
    HRParametersComponent,
    HomeHrparametersComponent,
    CertificatesComponent,
    NationalitiesComponent,
    CountriesComponent,
    ProvincesComponent,
    DistrictsComponent,
    CompetencesComponent,
    EducationsComponent,
    OrganizationsComponent,
    ReligionsComponent,
    EthnicGroupsComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    ...T_Module
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HrParametersModule { }
