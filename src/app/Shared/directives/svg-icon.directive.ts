import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSvgIcon]',
  standalone: true
})
export class SvgIconDirective {
  @Input('appSvgIcon') iconName: string = '';
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.setIcon(this.iconName);
  }

  setIcon(iconName: string) {
    let svgMarkup = '';

    switch (iconName) {
      case 'football':
        svgMarkup = '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><ellipse cx="256" cy="256" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" rx="267.57" ry="173.44" transform="rotate(-45 256 256.002)"></ellipse><path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M334.04 177.96 177.96 334.04M278.3 278.3l-44.6-44.6m89.19 0-44.59-44.59m178.38 22.29L300.6 55.32m-89.2 401.36L55.32 300.6m178.38 22.29-44.59-44.59"></path></svg>';
        break;
    }


      // Insert the SVG as innerHTML
      this.el.nativeElement.innerHTML = svgMarkup;
  }
}
