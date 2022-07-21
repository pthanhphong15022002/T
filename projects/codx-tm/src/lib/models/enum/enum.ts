export enum StatusTask {
    //1;Chưa thực hiện;2;Đang thực hiện;5;Hoãn lại;8;Bị huỷ;9;Hoàn tất
    New = '1',
    Processing = '2',
    Postpone = '5',
    Cancelled = '8',
    Done = '9'
}
export enum ActionTypeOnTask {
    ChangeStatus = '1',
}
export enum StatusTaskGoal{
    NotChecked = '0',
    Checked = '9',
}