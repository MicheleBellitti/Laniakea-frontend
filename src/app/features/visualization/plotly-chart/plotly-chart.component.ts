import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

declare const Plotly: any;

export interface PlotlyData {
  x: number[];
  y: number[];
  z?: number[][] | number[];
  type: string;
  mode?: string;
  name?: string;
  line?: {
    color?: string;
    width?: number;
    dash?: string;
  };
  marker?: {
    color?: string | number[];
    size?: number;
    colorscale?: string;
  };
  colorscale?: string;
  colorbar?: {
    title?: string;
    tickfont?: { color?: string };
  };
  hovertemplate?: string;
}

export interface PlotlyLayout {
  title?: string | { text: string; font?: { color?: string; size?: number } };
  xaxis?: {
    title?: string;
    gridcolor?: string;
    zerolinecolor?: string;
    tickfont?: { color?: string };
    titlefont?: { color?: string };
    range?: [number, number];
  };
  yaxis?: {
    title?: string;
    gridcolor?: string;
    zerolinecolor?: string;
    tickfont?: { color?: string };
    titlefont?: { color?: string };
    range?: [number, number];
  };
  paper_bgcolor?: string;
  plot_bgcolor?: string;
  font?: { color?: string };
  margin?: { t?: number; r?: number; b?: number; l?: number };
  showlegend?: boolean;
  legend?: {
    x?: number;
    y?: number;
    bgcolor?: string;
    font?: { color?: string };
  };
  autosize?: boolean;
  height?: number;
  width?: number;
}

@Component({
  selector: 'app-plotly-chart',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #plotContainer class="plotly-container"></div>`,
  styles: [`
    .plotly-container {
      width: 100%;
      height: 100%;
      min-height: 300px;
    }

    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class PlotlyChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('plotContainer') container!: ElementRef<HTMLDivElement>;

  @Input() data: PlotlyData[] = [];
  @Input() layout: Partial<PlotlyLayout> = {};
  @Input() config: Partial<{ responsive: boolean; displayModeBar: boolean }> = {
    responsive: true,
    displayModeBar: true,
  };

  private plotInitialized = false;
  private resizeObserver?: ResizeObserver;

  private defaultLayout: Partial<PlotlyLayout> = {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: '#1f2937',
    font: { color: '#e5e7eb' },
    margin: { t: 40, r: 20, b: 50, l: 60 },
    xaxis: {
      gridcolor: '#374151',
      zerolinecolor: '#4b5563',
      tickfont: { color: '#9ca3af' },
      titlefont: { color: '#e5e7eb' },
    },
    yaxis: {
      gridcolor: '#374151',
      zerolinecolor: '#4b5563',
      tickfont: { color: '#9ca3af' },
      titlefont: { color: '#e5e7eb' },
    },
    showlegend: true,
    legend: {
      bgcolor: 'rgba(31, 41, 55, 0.8)',
      font: { color: '#e5e7eb' },
    },
    autosize: true,
  };

  async ngAfterViewInit(): Promise<void> {
    await this.initPlot();
    this.setupResizeObserver();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (this.plotInitialized && (changes['data'] || changes['layout'])) {
      await this.updatePlot();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    if (this.container?.nativeElement) {
      import('plotly.js-dist-min').then((Plotly) => {
        Plotly.purge(this.container.nativeElement);
      });
    }
  }

  private async initPlot(): Promise<void> {
    const Plotly = await import('plotly.js-dist-min');
    await Plotly.newPlot(
      this.container.nativeElement,
      this.data,
      this.mergeLayout(),
      this.config
    );
    this.plotInitialized = true;
  }

  private async updatePlot(): Promise<void> {
    const Plotly = await import('plotly.js-dist-min');
    await Plotly.react(
      this.container.nativeElement,
      this.data,
      this.mergeLayout()
    );
  }

  private mergeLayout(): Partial<PlotlyLayout> {
    return {
      ...this.defaultLayout,
      ...this.layout,
      xaxis: { ...this.defaultLayout.xaxis, ...this.layout.xaxis },
      yaxis: { ...this.defaultLayout.yaxis, ...this.layout.yaxis },
    };
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(async () => {
      if (this.plotInitialized) {
        const Plotly = await import('plotly.js-dist-min');
        Plotly.Plots.resize(this.container.nativeElement);
      }
    });
    this.resizeObserver.observe(this.container.nativeElement);
  }

  async downloadImage(format: 'png' | 'svg' = 'png'): Promise<void> {
    const Plotly = await import('plotly.js-dist-min');
    await Plotly.downloadImage(this.container.nativeElement, {
      format,
      filename: 'laniakea-plot',
    });
  }
}
