import { StatusNote } from './enum/enum';

export class Notes {
  recID: string;
  transID: string;
  noteType: string;
  title: string;
  memo: string;
  pictures: object;
  checkList: any[];
  isPin: boolean;
  showCalendar: boolean = true;
  createdOn: string;
  createdBy: string;
  tags: string;
  fileCount: string;
  isNote: boolean;
  files: any[];
}

export class TempNote {
  status: StatusNote;
  listNote: any;
}

export class NoteType {
  text: boolean;
  check: boolean;
  list: boolean;
}
export class NoteFile {
  avatar: string;
  createdBy: string;
  createdOn: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  objectID: string;
  objectType: string;
  recID: string;
  thumbnail: string;
}
