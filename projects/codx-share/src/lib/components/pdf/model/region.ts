//Input
//View Child
//core
//virtual layer for sign areas
//vll
//page
//zoom
//sign area
//save to db
//signer info
//file info
//font
//size
//date
//style
//auto sign
//thumbnail
//css ???
//change
//go to
//pop up
//test func
//button
//get
//before load pdf
//nho sua

//code cu
//render
// lastRender() {
//   let ngxCanvas = document.getElementsByTagName('canvas').item(0);
//   let ngxCanvasParentEle = ngxCanvas.parentElement;
//   let virtualCanvasEle = document.createElement('div');
//   virtualCanvasEle.id = 'virtualLayer';
//   virtualCanvasEle.style.display = 'display: flex';
//   virtualCanvasEle.style.position = 'absolute';
//   virtualCanvasEle.style.top = '0';
//   virtualCanvasEle.style.left = '0';
//   virtualCanvasEle.style.zIndex = '2';
//   virtualCanvasEle.style.width = this.vcWidth + 'px';
//   virtualCanvasEle.style.width = this.vcWidth + 'px';
//   virtualCanvasEle.style.border = '1px solid blue';
//   ngxCanvasParentEle.appendChild(virtualCanvasEle);

//   this.xScale = this.vcWidth / this.xAt100;
//   this.yScale = this.vcHeight / this.yAt100;

//   this.stage = new Konva.Stage({
//     container: 'virtualLayer',
//     width: this.vcWidth,
//     height: this.vcHeight,
//   });
//   this.layer = new Konva.Layer();

//   this.tr = new Konva.Transformer({
//     rotateEnabled: false,
//   });
//   this.layer.add(this.tr);

//   //right click on stage
//   this.stage.on('contextmenu', (e: any) => {
//     e.evt.preventDefault();
//     if (e.target === this.stage) {
//       this.contextMenu.style.display = 'none';
//       return;
//     }
//     this.curSelectedArea = e.target;
//     console.log('dang chon', this.curSelectedArea);

//     if (this.contextMenu) {
//       this.contextMenu.style.display = 'initial';
//       this.contextMenu.style.zIndex = '2';

//       this.contextMenu.style.top = e.evt.pageY + 'px';
//       this.contextMenu.style.left = e.evt.pageX + 'px';
//     }
//   });

//   //left click
//   this.stage.on('click', (e: any) => {
//     if (e.target == this.stage) {
//       this.tr.nodes([]);
//       this.contextMenu.style.display = 'none';
//     } else {
//       console.log('click on', e.target);
//       this.curSelectedArea = e.target;
//       this.tr.nodes([e.target]);
//     }
//   });

//   this.stage.add(this.layer);
//   this.esService
//     .getSignAreas(
//       this.recID,
//       this.fileInfo.fileID,
//       this.isApprover,
//       this.user.userID
//     )
//     .subscribe((res) => {
//       this.lstAreas = res;
//       this.detectorRef.detectChanges();

//       this.lstAreas
//         ?.filter((loca) => {
//           return loca.location.pageNumber + 1 == this.curPage;
//         })
//         ?.forEach((area) => {
//           console.log('area', area);

//           let isRender = true;
//           if (
//             (this.isApprover || this.isDisable) &&
//             (area.signer != this.curSignerID ||
//               area.stepNo != this.stepNo ||
//               area.isLock)
//           ) {
//             isRender = false;
//           }
//           if (isRender) {
//             switch (area.labelType) {
//               case '1': {
//                 this.addArea(
//                   this.lstSigners.find(
//                     (signer) => signer.authorID == area.signer
//                   ).signature,
//                   'img',
//                   area.labelType,
//                   area.allowEditAreas,
//                   false,
//                   area.signer,
//                   area.stepNo,
//                   area
//                 );
//                 break;
//               }
//               case '2': {
//                 this.addArea(
//                   this.lstSigners.find(
//                     (signer) => signer.authorID == area.signer
//                   ).stamp,
//                   'img',
//                   area.labelType,
//                   area.allowEditAreas,
//                   false,
//                   area.signer,
//                   area.stepNo,
//                   area
//                 );
//                 break;
//               }
//               case '8': {
//                 this.addArea(
//                   this.fileInfo.qr,
//                   'img',
//                   area.labelType,
//                   area.allowEditAreas,
//                   false,
//                   area.signer,
//                   area.stepNo,
//                   area
//                 );
//                 break;
//               }
//               case '3':
//               case '4':
//               case '5':
//               case '6':
//               case '7':
//               case '9': {
//                 this.addArea(
//                   area.labelValue,
//                   'text',
//                   area.labelType,
//                   area.allowEditAreas,
//                   false,
//                   area.signer,
//                   area.stepNo,
//                   area
//                 );
//                 break;
//               }
//             }
//           }
//         });
//       this.detectorRef.detectChanges();
//     });

//   this.detectorRef.detectChanges();
// }

// timeOutId;
// pageRendered(e: any) {
//   //context menu
//   this.contextMenu = document.getElementById('contextMenu');
//   document.getElementById('delete-btn')?.addEventListener('click', () => {
//     this.contextMenu.style.display = 'none';
//     this.tr.nodes([]);
//     this.esService
//       .deleteAreaById([
//         this.recID,
//         this.fileInfo.fileID,
//         this.curSelectedArea.id(),
//       ])
//       .subscribe((res) => {
//         if (res) {
//           this.curSelectedArea.destroy();
//           this.esService
//             .getSignAreas(
//               this.recID,
//               this.fileInfo.fileID,
//               this.isApprover,
//               this.user.userID
//             )
//             .subscribe((res) => {
//               this.lstAreas = res;
//               this.detectorRef.detectChanges();
//             });
//         }
//       });
//   });

//   //get canvas bounds in pdf
//   let ngxCanvas = document.getElementsByTagName('canvas').item(0);

//   let bounds = ngxCanvas?.getBoundingClientRect();
//   if (bounds) {
//     this.vcTop = bounds.top;
//     this.vcLeft = bounds.left;
//     this.vcWidth = bounds.width;
//     this.vcHeight = bounds.height;
//     if (this.stage) {
//       this.stage.destroyChildren();
//     }
//     if (this.layer) {
//       this.layer.destroyChildren();
//     }
//     if (this.tr) {
//       this.tr.destroy();
//     }

//     clearTimeout(this.timeOutId);
//     this.timeOutId = setTimeout(
//       this.lastRender.bind(this),
//       this.after_X_Second
//     );

//     this.detectorRef.detectChanges();
//   }
// }
