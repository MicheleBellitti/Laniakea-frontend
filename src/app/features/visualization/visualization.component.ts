import { Component, Input, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { PlotlyChartComponent, PlotlyData, PlotlyLayout } from './plotly-chart/plotly-chart.component';
import { ThreeSceneComponent, SurfaceData } from './three-scene/three-scene.component';

export type VisualizationType = '1d' | '2d-heatmap' | '2d-contour' | '3d';

@Component({
  selector: 'app-visualization',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    SelectButtonModule,
    PlotlyChartComponent,
    ThreeSceneComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="visualization-container">
      <div class="visualization-header">
        <h4>{{ title }}</h4>
        <div class="visualization-controls">
          @if (showTypeSelector && availableTypes.length > 1) {
            <p-selectButton
              [options]="typeOptions()"
              [(ngModel)]="selectedType"
              optionLabel="label"
              optionValue="value"
            />
          }
          <p-button
            icon="pi pi-download"
            styleClass="p-button-text p-button-sm"
            pTooltip="Download"
            (onClick)="download()"
          />
        </div>
      </div>

      <div class="visualization-content">
        @switch (selectedType) {
          @case ('1d') {
            <app-plotly-chart
              [data]="plotlyData()"
              [layout]="plotlyLayout()"
            />
          }
          @case ('2d-heatmap') {
            <app-plotly-chart
              [data]="heatmapData()"
              [layout]="heatmapLayout()"
            />
          }
          @case ('2d-contour') {
            <app-plotly-chart
              [data]="contourData()"
              [layout]="contourLayout()"
            />
          }
          @case ('3d') {
            <app-three-scene
              [data]="surfaceData()"
              [autoRotate]="autoRotate"
            />
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .visualization-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--surface-section);
      border-radius: 12px;
      overflow: visible;
    }

    .visualization-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-bottom: 1px solid var(--surface-border);

      h4 {
        margin: 0;
        color: var(--text-color);
      }
    }

    .visualization-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .visualization-content {
      flex: 1;
      min-height: 300px;
      padding: 1rem;
    }
  `]
})
export class VisualizationComponent {
  @Input() title = 'Visualization';
  @Input() type: VisualizationType = '1d';
  @Input() showTypeSelector = true;
  @Input() availableTypes: VisualizationType[] = ['1d'];
  @Input() autoRotate = true;

  // 1D data
  @Input() xData: number[] = [];
  @Input() yData: number[] = [];
  @Input() xLabel = 'x';
  @Input() yLabel = 'y';
  @Input() lineName = 'Solution';

  // 2D data
  @Input() zData: number[][] = [];

  selectedType: VisualizationType = '1d';

  typeOptions = computed(() => {
    const options: { label: string; value: VisualizationType }[] = [];
    if (this.availableTypes.includes('1d')) options.push({ label: 'Line', value: '1d' });
    if (this.availableTypes.includes('2d-heatmap')) options.push({ label: 'Heatmap', value: '2d-heatmap' });
    if (this.availableTypes.includes('2d-contour')) options.push({ label: 'Contour', value: '2d-contour' });
    if (this.availableTypes.includes('3d')) options.push({ label: '3D', value: '3d' });
    return options;
  });

  plotlyData = computed<PlotlyData[]>(() => [{
    x: this.xData,
    y: this.yData,
    type: 'scatter',
    mode: 'lines',
    name: this.lineName,
    line: {
      color: '#6366f1',
      width: 2,
    },
    hovertemplate: `${this.xLabel}: %{x:.4f}<br>${this.yLabel}: %{y:.4f}<extra></extra>`,
  }]);

  plotlyLayout = computed<Partial<PlotlyLayout>>(() => ({
    xaxis: { title: this.xLabel },
    yaxis: { title: this.yLabel },
  }));

  heatmapData = computed<PlotlyData[]>(() => [{
    x: this.xData,
    y: this.yData,
    z: this.zData,
    type: 'heatmap',
    colorscale: 'Viridis',
    colorbar: {
      title: this.lineName,
      tickfont: { color: '#e5e7eb' },
    },
  }]);

  heatmapLayout = computed<Partial<PlotlyLayout>>(() => ({
    xaxis: { title: this.xLabel },
    yaxis: { title: this.yLabel },
  }));

  contourData = computed<PlotlyData[]>(() => [{
    x: this.xData,
    y: this.yData,
    z: this.zData,
    type: 'contour',
    colorscale: 'Viridis',
    colorbar: {
      title: this.lineName,
      tickfont: { color: '#e5e7eb' },
    },
  }]);

  contourLayout = computed<Partial<PlotlyLayout>>(() => ({
    xaxis: { title: this.xLabel },
    yaxis: { title: this.yLabel },
  }));

  surfaceData = computed<SurfaceData>(() => ({
    x: this.xData,
    y: this.yData,
    z: this.zData,
  }));

  ngOnInit(): void {
    this.selectedType = this.type;
  }

  download(): void {
    // Implementation depends on visualization type
    console.log('Download requested');
  }
}
