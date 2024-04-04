import { Component } from '@angular/core';

@Component({
  selector: 'lib-dashboard-totalemployee-chart',
  templateUrl: './dashboard-totalemployee-chart.component.html',
  styleUrls: ['./dashboard-totalemployee-chart.component.css']
})
export class DashboardTotalemployeeChartComponent {
  public gridData: any[];

  constructor() {
    this.gridData = [
      {
        department: 'A',
        total: 180,
        malePercentage: '20%',
        femalePercentage: '80%',
        expanded: false, // Set initial accordion state
        departments: [
          { department: 'XYZ', total: 60, malePercentage: '20%', femalePercentage: '80%' },
          { department: 'PQR', total: 120, malePercentage: '30%', femalePercentage: '70%' }
        ]
      },
      {
        department: 'B',
        total: 150,
        malePercentage: '30%',
        femalePercentage: '70%',
        expanded: false, // Set initial accordion state
        departments: [
          { department: 'LMN', total: 50, malePercentage: '40%', femalePercentage: '60%' },
          { department: 'UVW', total: 100, malePercentage: '25%', femalePercentage: '75%' }
        ]
      }
    ];
  }

  toggleAccordion(row: any) {
    row.expanded = !row.expanded;
  }
}
