export class TabModel {
  name:
    | 'Lịch sử'
    | 'Đính kèm'
    | 'Bình luận'
    | 'Tham chiếu'
    | string;
  textDefault: string;
  isActive: boolean;
}
