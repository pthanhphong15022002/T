import { Component, OnInit } from '@angular/core';


@Component({
    selector: 'lib-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  public data: Object[] = [
    {
        taskID: 1,
        taskName: 'Parent Task 1',
        startDate: new Date('2023-10-23'),
        duration: 5,
        subtasks: [
            { taskID: 2, taskName: 'Child Task 1', startDate: new Date('2023-10-23'), duration: 2 },
            { taskID: 3, taskName: 'Child Task 2', startDate: new Date('2023-10-25'), duration: 3 }
        ]
    },
    {
        taskID: 4,
        taskName: 'Parent Task 2',
        startDate: new Date('2023-10-23'),
        duration: 3,
        subtasks: [
            { taskID: 5, taskName: 'Child Task 1', startDate: new Date('2023-10-23'), duration: 2 },
            { taskID: 6, taskName: 'Child Task 2', startDate: new Date('2023-10-25'), duration: 1 }
        ]
    }
];
}