import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Injector, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { Subscription } from 'rxjs';
import 'lodash';
import { AuthService, FilesService } from 'codx-core';
import { ErmComponent } from '../ermcomponent/erm.component';
import { isBuffer } from 'util';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'codx-file',
  templateUrl: './image-grid.component.html',
  styleUrls: ['./image-grid.component.scss'],
})
export class ImageGridComponent extends ErmComponent implements OnInit,OnChanges {

  @Input() objectID:string = "";
  @Input() showBtnRemove: boolean = false;
  @Input() lstFile:any[] = [];
  @ViewChild('video') video: ElementRef;
  FILE_CATEGORY = {
    IMAGE: "image",
    VIDEO: "video"
  }
  file_img_video:any[] = [];
  files:any[] = [];
  videos:any[] = [];


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
    private df: ChangeDetectorRef
  ) {
    super(injector);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(changes.lstFile){
      let files = changes.lstFile.currentValue;
      if(files && files.length >0 ){
        this.lstFile = files;
        this.converFile();
      }
    }
    
  }

  ngOnInit() {
    
    if(this.objectID){
      this.getFile();
    }
    else{
      this.converFile();
    } 
  }


  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  getFile() {
    this.api.execSv("DM","ERM.Business.DM","FileBussiness","GetFilesByObjectIDImageAsync",this.objectID)
    .subscribe((files:any) => {
      if(files){
        this.lstFile = files;
        this.lstFile.forEach((f:any) => {
          let file = f;
          var minType = this.mineTypes[file.topics];
          if(minType.indexOf("image") >= 0 ){
            this.file_img_video.push(file);
          }
          else if(minType.indexOf("video") >= 0){
            file['srcVideo'] = `${environment.apiUrl}/api/dm/filevideo/${file.recID}?access_token=${this.auth.userValue.token}`;
            this.file_img_video.push(file);
          }
          else{
            this.files.push(file);
          }
        });
        this.df.detectChanges();
      }
    })
  }


  converFile(){
    if(this.lstFile){
      this.lstFile.forEach((f:any) => {
        let minType = this.mineTypes[f.type];
        if(minType.indexOf("image") >= 0 ){
          f['category'] = 'image';
          this.file_img_video.push(f);
        }
        else if(minType.indexOf("video") >= 0)
        {
          f['category'] = 'video';
          this.file_img_video.push(f);
        }
        else{
          this.files.push(f);
        }
      });
      this.df.detectChanges();
    }
  }


  removeImg(){
    
  }

  openDetail(indexFile:any){}
}
