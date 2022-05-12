import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status',
})
export class StatusPipe implements PipeTransform {
  transform(value: string) {
    let result;
    switch (value) {
      case '1':
        result = 'Chưa thực hiện';
        break;
      case '2':
        result = 'Đang thực hiện';
        break;
      case '9':
        result = 'Hoàn tất';
        break;
      case '5':
        result = 'Hoãn lại';
        break;
      case '8':
        result = 'Bị huỷ';
        break;
    }
    return result;
  }
}
