import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalComponent } from './personal.component';
import { ProfileOverviewComponent } from './profile-overview/profile-overview.component';
import { ProfileCardComponent } from './profile-card/profile-card.component';



@NgModule({
  declarations: [
    PersonalComponent,
    ProfileOverviewComponent,
    ProfileCardComponent
  ],
  imports: [
    CommonModule
  ]
})
export class PersonalModule { }
