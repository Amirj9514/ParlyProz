import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appJersey]',
  standalone: true,
})
export class JerseyDirective implements OnChanges {
  @Input() jerseyNumber: string = '10'; // Default number
  @Input() jerseyColor: string = 'blue'; // Default color

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges() {
    this.createJersey();
  }

  private createJersey() {
    const svgNS = 'http://www.w3.org/2000/svg';

    // Clear previous content
    this.el.nativeElement.innerHTML = '';

    // Create SVG element
    const svg = this.renderer.createElement('svg', svgNS);
    this.renderer.setAttribute(svg, 'stroke', '#9233DF');
    this.renderer.setAttribute(svg, 'fill', 'silver');
    this.renderer.setAttribute(svg, 'stroke-width', '0.2');
    this.renderer.setAttribute(svg, 'viewBox', '0 0 16 16');
    this.renderer.setAttribute(svg, 'height', '50');
    this.renderer.setAttribute(svg, 'width', '50');
    this.renderer.setAttribute(svg, 'xmlns', svgNS);

    // Create Jersey Path (from provided SVG)
    const path = this.renderer.createElement('path', svgNS);
    this.renderer.setAttribute(
      path,
      'd',
      'M11.91 14.22H4.06l-.5-.5V7.06H2.15l-.48-.38L1 4l.33-.6L5.59 2l.64.32a2.7 2.7 0 0 0 .21.44c.071.103.152.2.24.29.168.169.369.302.59.39a1.82 1.82 0 0 0 1.43 0 1.74 1.74 0 0 0 .59-.39c.09-.095.173-.195.25-.3l.15-.29a1.21 1.21 0 0 0 .05-.14l.64-.32 4.26 1.42L15 4l-.66 2.66-.49.38h-1.44v6.66l-.5.52zm-7.35-1h6.85V6.56l.5-.5h1.52l.46-1.83-3.4-1.14a1.132 1.132 0 0 1-.12.21c-.11.161-.233.312-.37.45a2.75 2.75 0 0 1-.91.61 2.85 2.85 0 0 1-2.22 0A2.92 2.92 0 0 1 6 3.75a2.17 2.17 0 0 1-.36-.44l-.13-.22-3.43 1.14.46 1.83h1.52l.5.5v6.66z'
    );

    this.renderer.appendChild(svg, path);

    // Create Jersey Number
    const text = this.renderer.createElement('text', svgNS);
    this.renderer.setAttribute(text, 'x', '8');
    this.renderer.setAttribute(text, 'y', '10');
    this.renderer.setAttribute(text, 'font-size', '3');
    this.renderer.setAttribute(text, 'fill', 'black');
    this.renderer.setAttribute(text, 'font-weight', 'bold');
    this.renderer.setAttribute(text, 'text-anchor', 'middle');
    const textNode = this.renderer.createText(this.jerseyNumber);
    this.renderer.appendChild(text, textNode);
    this.renderer.appendChild(svg, text);

    // Append SVG to the element
    this.renderer.appendChild(this.el.nativeElement, svg);
  }
}
