import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogDetailRegisterApproveComponent } from './components/dialog-detail-register-approve/dialog-detail-register-approve.component';
import { DialogRegisterApproveComponent } from './components/dialog-register-approve/dialog-register-approve.component';
import { HistoryLevelComponent } from './components/dialog-detail-register-approve/components/history-level/history-level.component';
import { HrTableNewemployeeComponent } from './widgets/hr-table-newemployee/hr-table-newemployee.component';

const T_Component = [
  

]

@NgModule({
  imports: [
    CommonModule,
    DialogDetailRegisterApproveComponent, 
    HistoryLevelComponent
  ], 
  declarations: [T_Component]

})
export class DashboardModule { }
