export enum StatusTask {
    //1;Chưa thực hiện;2;Đang thực hiện;5;Hoãn lại;8;Bị huỷ;9;Hoàn tất
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