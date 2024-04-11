import { Component, Input, Optional } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DialogData, DialogRef } from 'codx-core';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

@Component({
  selector: 'codx-image-cropper',
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.css']
})
export class CodxImageCropperComponent {
  @Input() heightCropper: number = 200;
  @Input() widthCropper: number = 200;
  dialog: any;
  imageBase64: any = '';
  croppedImage: any = '';
  blobImage: any = '';

  constructor(
    private sanitizer: DomSanitizer,
    @Optional() dt?: DialogData,
    @Optional() dialog?: DialogRef,
  ) {
    this.dialog = dialog;
    const reader = new FileReader();
    reader.readAsDataURL(dt.data.image);
    reader.onload = () => {
      this.imageBase64 = reader.result;
    }
    reader.onerror = (error) => {
      console.log('Error: ', error);
    }
    if(dt.data.heightCropper) {
      this.heightCropper = dt.data.heightCropper;
    }
    if(dt.data.widthCropper) {
      this.widthCropper = dt.data.widthCropper;
    }
  }
  ngOnInit(): void {}

  close() {
    this.dialog.close();
  }

  success(){
    this.dialog.close(this.blobImage);
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    this.blobImage = event.blob;
    // event.blob can be used to upload the cropped image
  }
  imageLoaded(image: LoadedImage) {
      // show cropper
  }
  cropperReady() {
      // cropper ready
  }
  loadImageFailed() {
      // show message
  }
}
