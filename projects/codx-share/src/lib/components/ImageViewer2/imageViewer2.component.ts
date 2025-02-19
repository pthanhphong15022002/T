import { style } from '@angular/animations';
import {
    AfterViewInit,
    Component,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    Renderer2,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import { ApiHttpService, DialogRef } from 'codx-core';
import { ImageViewer,FullScreenViewer } from 'iv-viewer';
import { environment } from 'src/environments/environment';
@Component({
    selector: 'codx-image-viewer',
    templateUrl: './imageViewer2.component.html',
    styleUrls:['./imageViewer2.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ImageViewerComponent2 implements OnChanges, OnInit, AfterViewInit {
    @HostBinding('class') get class() {
        return "w-100 h-100";
      }

    @HostListener('keydown',['$event']) keydown(event:any) {
        debugger
        this.onKeypress(event);
    }
    fileSelected:any = null;

    @Input() dialog:DialogRef;
    @Input() idContainer;
    @Input() rotate = true;
    @Input() download = true;
    @Input() fullscreen = true;
    @Input() resetZoom = true;
    @Input() loadOnInit = false;
    @Input() showOptions = true;
    @Input() zoomInButton = true;
    @Input() zoomOutButton = true;
    ///
    images: any[] = [];
    @Input() fileID:string = "";
    @Input() objectID: string = "";

    @Input() primaryColor = '#0176bd';
    @Input() buttonsColor = 'white';
    @Input() buttonsHover = '#333333';
    @Input() defaultDownloadName = 'Image';
    @Input() rotateRightTooltipLabel = 'Rotate right';
    @Input() rotateLeftTooltipLabel = 'Rotate left';
    @Input() resetZoomTooltipLabel = 'Reset zoom';
    @Input() fullscreenTooltipLabel = 'Fullscreen';
    @Input() zoomInTooltipLabel = 'Zoom In';
    @Input() zoomOutTooltipLabel = 'Zoom Out';
    @Input() downloadTooltipLabel = 'Download';
    @Input() showPDFOnlyLabel = 'Show only PDF';
    @Input() openInNewTabTooltipLabel = 'Open in new tab';
    @Input() enableTooltip = true;

    @Output() onNext = new EventEmitter();
    @Output() onPrevious = new EventEmitter();

    viewer;
    wrapper;
    curSpan;
    viewerFullscreen;
    totalImagens: number;
    indexImage: number;
    zoomPercent = 100;

    constructor
    (
        private renderer: Renderer2,
        private api: ApiHttpService,
    )
    {}

    ngOnInit() {
        this.getFileByObjectID();
    }

    ngAfterViewInit() {
    }
    onKeypress(e:any){
        if(e?.code?.toLocaleLowerCase() == 'arrowright'){
            this.proximaImagem();
        }
        if(e?.code?.toLocaleLowerCase() == 'arrowleft'){
            this.imagemAnterior();
        }
    }

    // get file by objectID
    getFileByObjectID(){
        this.api
        .execSv(
        'DM',
        'ERM.Business.DM',
        'FileBussiness',
        'GetFilesByIbjectIDAsync',
        [this.objectID])
        .subscribe((res:any[]) => {
            if(Array.isArray(res) && res.length > 0){
                res.forEach((f: any) => {
                    if(f.referType == "image" || f.referType == "video")
                    {
                        f["source"] = `${environment.urlUpload}/${f.url}`; 
                        this.images.push(f);
                    }
                });
                this.inicializarImageViewer();
                this.showImage();
            }
        });
    }

    ngOnChanges(changes: SimpleChanges) {
        this.imagesChange(changes);
        this.primaryColorChange(changes);
        this.buttonsColorChange(changes);
        this.defaultDownloadNameChange(changes);
    }

    clickZoomIn() {
        this.zoomPercent += 10;
        this.viewer.zoom(this.zoomPercent);
    }

    clickZoomOut() {
        if (this.zoomPercent === 100) {
            return;
        }
        this.zoomPercent -= 10;
        if (this.zoomPercent < 0) {

            this.zoomPercent = 0;
        }
        this.viewer.zoom(this.zoomPercent);
    }

    primaryColorChange(changes: SimpleChanges) {
        if (changes['primaryColor'] || changes['showOptions']) {
            setTimeout(() => {
                this.setStyleClass('inline-icon', 'background-color', this.primaryColor);
                this.setStyleClass('footer-info', 'background-color', this.primaryColor);
            }, 350);
        }
    }

    buttonsColorChange(changes: SimpleChanges) {
        if (changes['buttonsColor'] || changes['rotate'] || changes['download']
        || changes['fullscreen']) {
            setTimeout(() => {

                this.setStyleClass('footer-icon', 'color', this.buttonsColor);
            }, 350);
        }
    }

    defaultDownloadNameChange(changes: SimpleChanges) {
        if (changes['defaultDownloadName']) {
            this.defaultDownloadName = this.defaultDownloadName;
        }
    }

    imagesChange(changes: SimpleChanges) {
        if (changes['images'] && this.isImagensPresentes()) {
            this.inicializarImageViewer();
            setTimeout(() => {
                this.showImage();
            }, 1000);
        }
    }

    isImagensPresentes() {
        return this.images
            && this.images.length > 0;
    }
    inicializarImageViewer() {
        let _index = 0;
        _index =  this.images.findIndex(x => x.recID == this.fileID);
        if(_index > -1){
            this.indexImage = _index;
        }
        else
        {
            this.indexImage = 0;
        }
        this.totalImagens = this.images.length;
        if (this.viewer) {
            this.wrapper.querySelector('.total').innerHTML = this.totalImagens;
            return;
        }

        this.wrapper = document.getElementById(`${this.idContainer}`);

        if (this.wrapper) {
            this.curSpan = this.wrapper.querySelector('#current');
            this.viewer = new ImageViewer(this.wrapper.querySelector('.image-container'));
            this.wrapper.querySelector('.total').innerHTML = this.totalImagens;
        }
    }

    showImage() {
        this.prepararTrocaImagem();
        let imgObj = this.isURlImagem();
        this.fileSelected = this.images[this.indexImage];
        this.viewer.load(imgObj, imgObj);
        if(this.fileSelected.referType == "video")
        {
                var ele = document.getElementById(this.idContainer).getElementsByClassName('iv-image-wrap');
                if(ele){
                    var video = document.createElement('video');
                    video.className = "iv-image-wrap iv-large-image";
                    video.autoplay = true;
                    video.controls = true;
                    video.src = imgObj;
                    video.id = this.fileSelected.recID;
                    var eleBody = document.getElementsByClassName("iv-image-view");
                    var eleFooter = document.getElementsByClassName("footer-info");
                    if(eleBody && eleFooter)
                        video.height = eleBody[0].clientHeight - eleFooter[0].clientHeight;
                    else
                        video.height = eleBody[0].clientHeight - 50;
                    ele[0].firstChild.remove();
                    ele[0].appendChild(video);
                    this.setStyleClass('iv-loader', 'visibility', 'hidden');
                    // this.setStyleClass('iv-image-wrap', 'widht', '100%');
                    // this.setStyleClass('iv-image-wrap', 'height', video.height+"");
                    // this.setStyleClass('iv-image-wrap', 'display', 'flex');
                    // this.setStyleClass('iv-image-wrap', 'justify-content', 'center');
                    // this.setStyleClass('iv-image-wrap', 'align-items', 'center');
                }
        }
        else
        {
            var ele = document.getElementById(this.idContainer).getElementsByClassName('iv-image-wrap');
            if(ele)
            {
                var length = ele[0].children.length;
                for (let index = 0; index < length; index++) {
                    var element = ele[index];
                    element.tagName.toLocaleLowerCase() == "video" ? element.remove() : null;
                } 
            }
        }
        this.curSpan.innerHTML = this.indexImage + 1;
    }

    getTamanhoIframe() {

        const container = document.getElementById(this.idContainer);

        const widthIframe = container.offsetWidth;
        const heightIframe = container.offsetHeight;
        return {widthIframe, heightIframe};
    }

    esconderBotoesImageViewer() {
        this.setStyleClass('iv-loader', 'visibility', 'hidden');
        this.setStyleClass('options-image-viewer', 'visibility', 'hidden');
    }

    isPDF() {
        return this.getImagemAtual().startsWith('JVBE') || this.getImagemAtual().startsWith('0M8R');
    }

    isURlImagem() {
        return this.images[this.indexImage]["source"];
    }

    prepararTrocaImagem() {
        this.limparCacheElementos();
    }

    limparCacheElementos() {
        const container = document.getElementById(this.idContainer);
        const iframeElement = document.getElementById(this.getIdIframe());
        const ivLargeImage = document.getElementById(this.idContainer).getElementsByClassName('iv-large-image').item(0);

        if (iframeElement) {

            this.renderer.removeChild(container, iframeElement);

            if (ivLargeImage) {

                this.renderer.removeChild(container, ivLargeImage);
            }
        }
        this.setStyleClass('iv-loader', 'visibility', 'auto');
        this.setStyleClass('options-image-viewer', 'visibility', 'inherit');
    }

    //next
    proximaImagem() {
        this.indexImage++;
        if (this.indexImage >= this.totalImagens) {
            this.indexImage = 0;
        }
        this.onNext.emit(this.images[this.indexImage]);
        this.showImage();
    }

    //previrious
    imagemAnterior() {
        this.indexImage--;
        if (this.indexImage < 0) {
            this.indexImage = this.totalImagens - 1;
        }
        this.onPrevious.emit(this.images[this.indexImage]);
        this.showImage();
    }

    rotacionarDireita() {
        const timeout = this.resetarZoom();
        setTimeout(() => {
            this.atualizarRotacao();
        }, timeout);
    }

    rotacionarEsquerda() {
        const timeout = this.resetarZoom();
        setTimeout(() => {
            this.atualizarRotacao();
        }, timeout);
    }

    resetarZoom(): number {
        this.zoomPercent = 100;
        this.viewer.zoom(this.zoomPercent);
        let timeout = 800;
        if (this.viewer._state.zoomValue === this.zoomPercent) {
            timeout = 0;
        }
        return timeout;
    }

    atualizarRotacao(isAnimacao = true) {
        // let scale = '';
        // if (this.isImagemVertical && this.isImagemSobrepondoNaVertical()) {
        //     scale = `scale(${this.getScale()})`;
        // }
        // const novaRotacao = `rotate(${this.rotacaoImagemAtual}deg)`;
        // this.carregarImagem(novaRotacao, scale, isAnimacao);
    }

    getScale() {

        const containerElement = document.getElementById(this.idContainer);
        const ivLargeImageElement = document.getElementById(this.idContainer).getElementsByClassName('iv-large-image').item(0);
        const diferencaTamanhoImagem = ivLargeImageElement.clientWidth - containerElement.clientHeight;

        if (diferencaTamanhoImagem >= 250 && diferencaTamanhoImagem < 300) {

            return (ivLargeImageElement.clientWidth - containerElement.clientHeight) / (containerElement.clientHeight) - 0.1;
        } else if (diferencaTamanhoImagem >= 300 && diferencaTamanhoImagem < 400) {

            return ((ivLargeImageElement.clientWidth - containerElement.clientHeight) / (containerElement.clientHeight)) - 0.15;
        } else if (diferencaTamanhoImagem >= 400) {

            return ((ivLargeImageElement.clientWidth - containerElement.clientHeight) / (containerElement.clientHeight)) - 0.32;
        }

        return 0.6;
    }

    isImagemSobrepondoNaVertical() {

        const margemErro = 5;
        const containerElement: Element = document.getElementById(this.idContainer);
        const ivLargeImageElement: Element = document.getElementById(this.idContainer).getElementsByClassName('iv-large-image').item(0);

        return containerElement.clientHeight < ivLargeImageElement.clientWidth + margemErro;
    }

    carregarImagem(novaRotacao: string, scale: string, isAnimacao = true) {
        if (isAnimacao) {
            this.adicionarAnimacao('iv-snap-image');
            this.adicionarAnimacao('iv-large-image');
        }
        this.adicionarRotacao('iv-snap-image', novaRotacao, scale);
        this.adicionarRotacao('iv-large-image', novaRotacao, scale);
        setTimeout(() => {
            if (isAnimacao) {
                this.retirarAnimacao('iv-snap-image');
                this.retirarAnimacao('iv-large-image');
            }
        }, 501);
    }

    retirarAnimacao(componente: string) {
        this.setStyleClass(componente, 'transition', 'auto');
    }

    adicionarRotacao(componente: string, novaRotacao: string, scale: string) {
        this.setStyleClass(componente, 'transform', `${novaRotacao} ${scale}`);
    }

    adicionarAnimacao(componente: string) {
        this.setStyleClass(componente, 'transition', `0.5s linear`);
    }

    clickFullscreen() {
        debugger
        if(this.fileSelected.referType =='video'){
            document.getElementById(this.fileSelected.recID)?.requestFullscreen();
        }
        else
        {
            const timeout = this.resetarZoom();
            setTimeout(() => {
                this.viewerFullscreen = new FullScreenViewer();
                let imgSrc = this.isURlImagem();
                this.viewerFullscreen.show(imgSrc, imgSrc);
                this.atualizarRotacao(false);
            }, timeout);
        }
        
    }

    getImagemAtual() {
        return this.images[this.indexImage - 1];
    }


    setStyleClass(nomeClasse: string, nomeStyle: string, cor: string) {

        let cont;
        const listaElementos = document.getElementById(this.idContainer).getElementsByClassName(nomeClasse);

        for (cont = 0; cont < listaElementos.length; cont++) {

            this.renderer.setStyle(listaElementos.item(cont), nomeStyle, cor);
        }
    }

    atualizarCorHoverIn(event: MouseEvent) {

        this.renderer.setStyle(event.srcElement, 'color', this.buttonsHover);
    }

    atualizarCorHoverOut(event: MouseEvent) {

        this.renderer.setStyle(event.srcElement, 'color', this.buttonsColor);
    }

    getIdIframe() {
        return this.idContainer + '-iframe'
    }

    // close
    close(){
        if(this.dialog){
            this.dialog.close();
        }
    }
    video(){
        
    }
}
