import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Subscription } from 'rxjs';
import 'lodash';
import { AuthService, FilesService, NotificationsService } from 'codx-core';
import { ErmComponent } from '../ermcomponent/erm.component';
import { isBuffer } from 'util';
import { environment } from 'src/environments/environment';
import { CodxDMService } from 'projects/codx-dm/src/lib/codx-dm.service';
import { AttachmentComponent } from '../attachment/attachment.component';
import { Thickness } from '@syncfusion/ej2-angular-charts';
@Component({
  selector: 'codx-file',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.scss'],
})
export class ImageGridComponent extends ErmComponent implements OnInit {

  @Input() funcID:string = "";
  @Input() objectID:string = "";
  @Input() objectType:string = "";
  @Input() edit: boolean = false;
  @Input() lstFile:any[] = [];
  @Output() evetFile = new EventEmitter();
  @Output() removeFile = new EventEmitter();
  @Output() addFile = new EventEmitter();

  @ViewChild('atm') atm:AttachmentComponent;
  FILE_REFERTYPE = {
    IMAGE: "image",
    VIDEO: "video",
    APPLICATION :'application'
  }
  file_img_video:any[] = [];
  file_application:any[] = [];
  videos:any[] = [];
  filesAdd: any[] = [];
  filesDelete: any[] = [];
  content:string = "";
  user:any = null;
  showEmojiPicker
  mineTypes = {
    //   File Extension   MIME Type
      'abs':           'audio/x-mpeg',
      'ai':            'application/postscript',
      'aif':           'audio/x-aiff',
      'aifc':          'audio/x-aiff',
      'aiff':          'audio/x-aiff',
      'aim':           'application/x-aim',
      'art':           'image/x-jg',
      'asf':           'video/x-ms-asf',
      'asx':           'video/x-ms-asf',
      'au':            'audio/basic',
      'avi':           'video/x-msvideo',
      'avx':           'video/x-rad-screenplay',
      'bcpio':         'application/x-bcpio',
      'bin':           'application/octet-stream',
      'bmp':           'image/bmp',
      'body':          'text/html',
      'cdf':           'application/x-cdf',
      'cer':           'application/pkix-cert',
      'class':         'application/java',
      'cpio':          'application/x-cpio',
      'csh':           'application/x-csh',
      'css':           'text/css',
      'dib':           'image/bmp',
      'doc':           'application/msword',
      'dtd':           'application/xml-dtd',
      'dv':            'video/x-dv',
      'dvi':           'application/x-dvi',
      'eot':           'application/vnd.ms-fontobject',
      'eps':           'application/postscript',
      'etx':           'text/x-setext',
      'exe':           'application/octet-stream',
      'gif':           'image/gif',
      'gtar':          'application/x-gtar',
      'gz':            'application/x-gzip',
      'hdf':           'application/x-hdf',
      'hqx':           'application/mac-binhex40',
      'htc':           'text/x-component',
      'htm':           'text/html',
      'html':          'text/html',
      'ief':           'image/ief',
      'jad':           'text/vnd.sun.j2me.app-descriptor',
      'jar':           'application/java-archive',
      'java':          'text/x-java-source',
      'jnlp':          'application/x-java-jnlp-file',
      'jpe':           'image/jpeg',
      'jpeg':          'image/jpeg',
      'jpg':           'image/jpeg',
      'js':            'application/javascript',
      'jsf':           'text/plain',
      'json':          'application/json',
      'jspf':          'text/plain',
      'kar':           'audio/midi',
      'latex':         'application/x-latex',
      'm3u':           'audio/x-mpegurl',
      'mac':           'image/x-macpaint',
      'man':           'text/troff',
      'mathml':        'application/mathml+xml',
      'me':            'text/troff',
      'mid':           'audio/midi',
      'midi':          'audio/midi',
      'mif':           'application/x-mif',
      'mov':           'video/quicktime',
      'movie':         'video/x-sgi-movie',
      'mp1':           'audio/mpeg',
      'mp2':           'audio/mpeg',
      'mp3':           'audio/mpeg',
      'mp4':           'video/mp4',
      'mpa':           'audio/mpeg',
      'mpe':           'video/mpeg',
      'mpeg':          'video/mpeg',
      'mpega':         'audio/x-mpeg',
      'mpg':           'video/mpeg',
      'mpv2':          'video/mpeg2',
      'ms':            'application/x-wais-source',
      'nc':            'application/x-netcdf',
      'oda':           'application/oda',
      'odb':           'application/vnd.oasis.opendocument.database',
      'odc':           'application/vnd.oasis.opendocument.chart',
      'odf':           'application/vnd.oasis.opendocument.formula',
      'odg':           'application/vnd.oasis.opendocument.graphics',
      'odi':           'application/vnd.oasis.opendocument.image',
      'odm':           'application/vnd.oasis.opendocument.text-master',
      'odp':           'application/vnd.oasis.opendocument.presentation',
      'ods':           'application/vnd.oasis.opendocument.spreadsheet',
      'odt':           'application/vnd.oasis.opendocument.text',
      'otg':           'application/vnd.oasis.opendocument.graphics-template',
      'oth':           'application/vnd.oasis.opendocument.text-web',
      'otp':           'application/vnd.oasis.opendocument.presentation-template',
      'ots':           'application/vnd.oasis.opendocument.spreadsheet-template',
      'ott':           'application/vnd.oasis.opendocument.text-template',
      'ogx':           'application/ogg',
      'ogv':           'video/ogg',
      'oga':           'audio/ogg',
      'ogg':           'audio/ogg',
      'otf':           'application/x-font-opentype',
      'spx':           'audio/ogg',
      'flac':          'audio/flac',
      'anx':           'application/annodex',
      'axa':           'audio/annodex',
      'axv':           'video/annodex',
      'xspf':          'application/xspf+xml',
      'pbm':           'image/x-portable-bitmap',
      'pct':           'image/pict',
      'pdf':           'application/pdf',
      'pgm':           'image/x-portable-graymap',
      'pic':           'image/pict',
      'pict':          'image/pict',
      'pls':           'audio/x-scpls',
      'png':           'image/png',
      'pnm':           'image/x-portable-anymap',
      'pnt':           'image/x-macpaint',
      'ppm':           'image/x-portable-pixmap',
      'ppt':           'application/vnd.ms-powerpoint',
      'pps':           'application/vnd.ms-powerpoint',
      'ps':            'application/postscript',
      'psd':           'image/vnd.adobe.photoshop',
      'qt':            'video/quicktime',
      'qti':           'image/x-quicktime',
      'qtif':          'image/x-quicktime',
      'ras':           'image/x-cmu-raster',
      'rdf':           'application/rdf+xml',
      'rgb':           'image/x-rgb',
      'rm':            'application/vnd.rn-realmedia',
      'roff':          'text/troff',
      'rtf':           'application/rtf',
      'rtx':           'text/richtext',
      'sfnt':          'application/font-sfnt',
      'sh':            'application/x-sh',
      'shar':          'application/x-shar',
      'sit':           'application/x-stuffit',
      'snd':           'audio/basic',
      'src':           'application/x-wais-source',
      'sv4cpio':       'application/x-sv4cpio',
      'sv4crc':        'application/x-sv4crc',
      'svg':           'image/svg+xml',
      'svgz':          'image/svg+xml',
      'swf':           'application/x-shockwave-flash',
      't':             'text/troff',
      'tar':           'application/x-tar',
      'tcl':           'application/x-tcl',
      'tex':           'application/x-tex',
      'texi':          'application/x-texinfo',
      'texinfo':       'application/x-texinfo',
      'tif':           'image/tiff',
      'tiff':          'image/tiff',
      'tr':            'text/troff',
      'tsv':           'text/tab-separated-values',
      'ttf':           'application/x-font-ttf',
      'txt':           'text/plain',
      'ulw':           'audio/basic',
      'ustar':         'application/x-ustar',
      'vxml':          'application/voicexml+xml',
      'xbm':           'image/x-xbitmap',
      'xht':           'application/xhtml+xml',
      'xhtml':         'application/xhtml+xml',
      'xls':           'application/vnd.ms-excel',
      'xml':           'application/xml',
      'xpm':           'image/x-xpixmap',
      'xsl':           'application/xml',
      'xlsx':          'application/xlsx',
      'xslt':          'application/xslt+xml',
      'xul':           'application/vnd.mozilla.xul+xml',
      'xwd':           'image/x-xwindowdump',
      'vsd':           'application/vnd.visio',
      'wav':           'audio/x-wav',
      'wbmp':          'image/vnd.wap.wbmp',
      'wml':           'text/vnd.wap.wml',
      'wmlc':          'application/vnd.wap.wmlc',
      'wmls':          'text/vnd.wap.wmlsc',
      'wmlscriptc':    'application/vnd.wap.wmlscriptc',
      'wmv':           'video/x-ms-wmv',
      'woff':          'application/font-woff',
      'woff2':         'application/font-woff2',
      'wrl':           'model/vrml',
      'wspolicy':      'application/wspolicy+xml',
      'z':             'application/x-compress',
      'zip':           'application/zip'
    };
    
  private subscription: Subscription = new Subscription();
  constructor(
    private injector: Injector,
    private auth:AuthService,
    private dmSV:CodxDMService,
    private notifiSV: NotificationsService,
    private dt: ChangeDetectorRef
  ) {
    super(injector);
    this.user = this.auth.userValue;
  }
  
  ngOnInit() {
    if(this.objectID){
      this.getFileByObjectID();
    }
  }
  getFiles(){
    let files = this.file_img_video.concat(this.file_application);
    return this.lstFile.concat(this.file_img_video,this.file_application);
  }
  getFileByObjectID() {
    this.api.execSv(
      "DM","ERM.Business.DM",
      "FileBussiness",
      "GetFilesByObjectIDImageAsync",
      this.objectID)
    .subscribe((files:any[]) => {
      if(files.length > 0){
        this.lstFile = files
        this.lstFile.forEach((f:any) => {
          if(f.category == this.FILE_REFERTYPE.IMAGE){
            this.file_img_video.push(f);
          }
          else if(f.category == this.FILE_REFERTYPE.VIDEO){
            f['srcVideo'] = `${environment.apiUrl}/api/dm/filevideo/${f.recID}?access_token=${this.auth.userValue.token}`;
            this.file_img_video.push(f);
          }
          else{
            this.file_application.push(f);
          }
        });
        this.dt.detectChanges();
        this.evetFile.emit(this.lstFile);
      }
    })
  }

  openDetail(indexFile:any){}

  removeFiles(file:any){
    if(file.referType == this.FILE_REFERTYPE.IMAGE || file.referType == this.FILE_REFERTYPE.VIDEO){
      for (let i = 0; i < this.file_img_video.length; i++) {
        if(this.file_img_video[i].fileName == file.fileName)
        {
          this.file_img_video.splice(i,1);
          break;
        };
      };
    }
    else
    {
      for (let i = 0; i < this.file_application.length; i++) {
        if(this.file_application[i].fileName == file.fileName)
        {
          this.file_application.splice(i,1);
          break;
        };
      };
    }
      this.filesDelete.push(file);
      this.removeFile.emit(file);
      this.dt.detectChanges();
  }

  addFiles(files:any[]){
    this.lstFile.concat(files);
    files.map(f => {
      if(f.mimeType.indexOf("image") >= 0 ){
        f['referType'] = this.FILE_REFERTYPE.IMAGE;
        let a = this.file_img_video.find(f2 => f2.fileName == f.fileName);
        if(a) return;
        this.file_img_video.push(f);
      }
      else if(f.mimeType.indexOf("video") >= 0)
      {
        f['referType'] = this.FILE_REFERTYPE.VIDEO;
        let a = this.file_img_video.find(f2 => f2.fileName == f.fileName);
        if(a) return;
        this.file_img_video.push(f);
      }
      else{
        f['referType'] = this.FILE_REFERTYPE.APPLICATION;
        let a = this.file_application.find(f2 => f2.fileName == f.fileName);
        if(a) return;
        this.file_application.push(f);
      }
    });
    this.filesAdd.concat(files);
    this.addFile.emit(files);
    this.dt.detectChanges();
  }

}
