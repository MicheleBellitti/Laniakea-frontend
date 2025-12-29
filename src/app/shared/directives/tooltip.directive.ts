import {
  Directive,
  Input,
  ElementRef,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements AfterViewInit, OnDestroy {
  @Input('appTooltip') tooltipText = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

  private tooltipElement: HTMLDivElement | null = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.el.nativeElement.addEventListener('mouseenter', this.show);
    this.el.nativeElement.addEventListener('mouseleave', this.hide);
  }

  ngOnDestroy(): void {
    this.el.nativeElement.removeEventListener('mouseenter', this.show);
    this.el.nativeElement.removeEventListener('mouseleave', this.hide);
    this.hide();
  }

  private show = (): void => {
    if (!this.tooltipText) return;

    this.tooltipElement = document.createElement('div');
    this.tooltipElement.className = 'custom-tooltip';
    this.tooltipElement.textContent = this.tooltipText;
    this.tooltipElement.style.cssText = `
      position: fixed;
      background: var(--surface-overlay);
      color: var(--text-color);
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      z-index: 10000;
      pointer-events: none;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 200px;
      word-wrap: break-word;
    `;

    document.body.appendChild(this.tooltipElement);
    this.positionTooltip();
  };

  private hide = (): void => {
    if (this.tooltipElement) {
      this.tooltipElement.remove();
      this.tooltipElement = null;
    }
  };

  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const rect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const offset = 8;

    let top: number;
    let left: number;

    switch (this.tooltipPosition) {
      case 'top':
        top = rect.top - tooltipRect.height - offset;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + (rect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.left - tooltipRect.width - offset;
        break;
      case 'right':
        top = rect.top + (rect.height - tooltipRect.height) / 2;
        left = rect.right + offset;
        break;
    }

    // Keep tooltip within viewport
    top = Math.max(8, Math.min(top, window.innerHeight - tooltipRect.height - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - tooltipRect.width - 8));

    this.tooltipElement.style.top = `${top}px`;
    this.tooltipElement.style.left = `${left}px`;
  }
}
