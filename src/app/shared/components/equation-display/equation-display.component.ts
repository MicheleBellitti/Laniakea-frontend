import {
  Component,
  Input,
  ElementRef,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-equation-display',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="equation-container" [class.block]="displayMode === 'block'">
      <div #katexContainer class="katex-output"></div>
    </div>
  `,
  styles: [`
    .equation-container {
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &.block {
        display: flex;
        width: 100%;
        padding: 1rem;
        background: var(--surface-section);
        border-radius: 8px;
        margin: 1rem 0;
        overflow-x: auto;
      }
    }

    .katex-output {
      font-size: 1.1em;
    }

    :host ::ng-deep .katex {
      color: var(--text-color);
    }

    :host ::ng-deep .katex-display {
      margin: 0;
    }
  `]
})
export class EquationDisplayComponent implements AfterViewInit, OnChanges {
  @ViewChild('katexContainer') container!: ElementRef<HTMLDivElement>;

  @Input({ required: true }) latex!: string;
  @Input() displayMode: 'inline' | 'block' = 'inline';

  private katexLoaded = false;

  async ngAfterViewInit(): Promise<void> {
    await this.renderEquation();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['latex'] && this.container) {
      await this.renderEquation();
    }
  }

  private async renderEquation(): Promise<void> {
    if (!this.container || !this.latex) return;

    try {
      const katex = await import('katex');

      if (!this.katexLoaded) {
        // Load KaTeX CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css';
        document.head.appendChild(link);
        this.katexLoaded = true;
      }

      katex.default.render(this.latex, this.container.nativeElement, {
        throwOnError: false,
        displayMode: this.displayMode === 'block',
        trust: true,
      });
    } catch (error) {
      console.error('Failed to render equation:', error);
      this.container.nativeElement.textContent = this.latex;
    }
  }
}
