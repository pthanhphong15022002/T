export class TaskRemind {
  taskOutOfDate: number = 0;
  taskUncompelete: number = 0;
  taskPrioritized: number = 0;
  taskPrioritizedUnFinish: number = 0;
  rateDoneOnTime: number = 0;
  totalTaskInWeek: number = 0;
  taskCount: number = 0;
  listTaskByDay: Array<RemiderOnDay> = [];
  listUser : Array<Owner> = [];
  rateDoneAllTime: number = 0;
  trendChart: object;
  doughnutChart: object;
  barChart: object;
}
export class ChartTaskRemind {
  rateDoneOnTime: number = 0;
  totalTaskInWeek: number = 0;
}
export class BarChart {
  barChart: any;
  lineChart: any;
}
export class RemiderOnDay {
  taskName: string;
  createdBy: string;
  status: string;
  priority: string;
  userName: string;
}

export class Owner{
  userName: string;
}
