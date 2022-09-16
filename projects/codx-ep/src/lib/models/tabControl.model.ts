export class TabModel {
  name:
    | 'Lịch sử'
    | 'Đính kèm'
    | 'Bình luận'
    | 'Tham chiếu'
    | 'Xét duyệt'
    | string;
  textDefault: string;
  isActive: boolean;
}
