import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'avtFile'
})
export class FileImage implements PipeTransform {


    getAvatar(filename: string) {
    if (filename == "" || filename == null)
      return "";
    var ext = filename.substring(filename.lastIndexOf('.'), filename.length) || filename;

    if (ext == null) {
      // alert(1);
      return "file.svg";
    }
    else {
      switch (ext) {
        case ".txt":
          return "txt.svg";
        case ".doc":
        case ".docx":
          return "doc.svg";
        case ".7z":
        case ".rar":
        case ".zip":
          return "zip.svg";        
        case ".jpg":     
          return "jpg.svg";
        case ".mp4":
          return "mp4.svg";
        case ".xls":
        case ".xlsx":
          return "xls.svg";
        case ".pdf":
          return "pdf.svg";
        case ".png":
          return "png.svg";
        case ".js":
          return "javascript.svg";
        default:
          return "file.svg";
      }
    }
  }
  transform(value: string) {
    if(value){
        return `../../../assets/codx/dms/${this.getAvatar(value)}`;
    }
    else
    return "";
  }
}