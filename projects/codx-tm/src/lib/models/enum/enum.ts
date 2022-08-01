export enum StatusTask {
    //10;Chưa thực hiện;20;Đang thực hiện;50;Hoãn lại;80;Bị huỷ;90;Hoàn tất
    New = '10',
    Processing = '20',
    Postpone = '50',
    Cancelled = '80',
    Done = '90'
}
export enum ActionTypeOnTask {
    ChangeStatus = '1',
}
export enum StatusTaskGoal{
    NotChecked = '00',
    Checked = '90',
}