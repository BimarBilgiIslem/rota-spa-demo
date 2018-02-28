interface IPagePreviewOptions extends IContentOptions {
    state: string;
    params?: any;
    trigger?: 'mouseenter' | 'click' | 'outsideClick' | 'focus';
    title?: string;
}
