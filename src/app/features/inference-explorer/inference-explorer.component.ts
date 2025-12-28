import {
  Component,
  inject,
  OnInit,
  signal,
  computed,
  effect,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';
import { ModelsService, InferenceService, PhysicsService } from '../../core/services';
import { PredictionResult, ModelDetail } from '../../core/models';
import { ParameterPanelComponent, ParameterValues, RangeConfig } from './parameter-panel/parameter-panel.component';
import { ResultsPanelComponent } from './results-panel/results-panel.component';
import { PlotlyChartComponent, PlotlyData, PlotlyLayout } from '../visualization/plotly-chart/plotly-chart.component';
import { ThreeSceneComponent, SurfaceData } from '../visualization/three-scene/three-scene.component';
import { EquationDisplayComponent, ErrorDisplayComponent, LoadingSpinnerComponent } from '../../shared/components';
import { ParameterSpec } from '../../shared/components/parameter-slider/parameter-slider.component';

@Component({
  selector: 'app-inference-explorer',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    BreadcrumbModule,
    ParameterPanelComponent,
    ResultsPanelComponent,
    PlotlyChartComponent,
    ThreeSceneComponent,
    EquationDisplayComponent,
    ErrorDisplayComponent,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="explorer-container">
      <!-- Breadcrumb -->
      <p-breadcrumb [model]="breadcrumbItems" [home]="homeItem" />

      <!-- Header -->
      <header class="explorer-header">
        @if (modelsService.loading() && !model()) {
          <div class="header-skeleton">
            <div class="skeleton-line wide"></div>
            <div class="skeleton-line"></div>
          </div>
        } @else if (model()) {
          <div class="header-content">
            <div class="header-info">
              <h1>{{ model()!.name }}</h1>
              <p>{{ model()!.description }}</p>
            </div>
            <div class="header-equation">
              <app-equation-display
                [latex]="getGoverningEquation()"
                displayMode="block"
              />
            </div>
          </div>
        }
      </header>

      @if (modelsService.error()) {
        <app-error-display
          [message]="modelsService.error()!"
          title="Failed to load model"
          [retryable]="true"
          (retry)="loadModel()"
        />
      } @else {
        <!-- Main Content -->
        <div class="explorer-content">
          <!-- Parameter Panel -->
          <aside class="parameters-sidebar">
            <app-parameter-panel
              [parameters]="parameters()"
              [parameterValues]="parameterValues()"
              [rangeConfig]="rangeConfig()"
              [loading]="inferenceService.loading()"
              (parameterChange)="onParameterChange($event)"
              (rangeChange)="onRangeChange($event)"
              (runPrediction)="runPrediction()"
            />
          </aside>

          <!-- Results Panel -->
          <main class="results-main">
            <app-results-panel
              [result]="predictionResult()"
              [loading]="inferenceService.loading()"
            >
              <!-- Visualization -->
              @if (predictionResult() && chartData().length > 0) {
                @if (is2DVisualization()) {
                  <app-three-scene
                    [data]="surfaceData()"
                    [autoRotate]="true"
                  />
                } @else {
                  <app-plotly-chart
                    [data]="chartData()"
                    [layout]="chartLayout()"
                  />
                }
              }
            </app-results-panel>
          </main>
        </div>
      }
    </div>
  `,
  styles: [`
    .explorer-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1rem;
      gap: 1rem;
    }

    .explorer-header {
      background: var(--surface-section);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .header-skeleton {
      .skeleton-line {
        height: 1.5rem;
        background: linear-gradient(90deg, var(--surface-border) 25%, var(--surface-overlay) 50%, var(--surface-border) 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 0.5rem;

        &.wide {
          width: 60%;
          height: 2rem;
        }

        &:last-child {
          width: 80%;
          margin-bottom: 0;
        }
      }
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 2rem;

      @media (max-width: 1024px) {
        flex-direction: column;
      }
    }

    .header-info {
      flex: 1;

      h1 {
        margin: 0 0 0.5rem;
        font-size: 1.5rem;
      }

      p {
        margin: 0;
        color: var(--text-color-secondary);
      }
    }

    .header-equation {
      flex-shrink: 0;

      :host ::ng-deep .equation-container.block {
        margin: 0;
        padding: 1rem;
      }
    }

    .explorer-content {
      flex: 1;
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: 1rem;
      min-height: 0;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
      }
    }

    .parameters-sidebar {
      min-height: 0;
      overflow: hidden;

      @media (max-width: 1024px) {
        max-height: 400px;
      }
    }

    .results-main {
      min-height: 0;
      overflow: hidden;
    }
  `]
})
export class InferenceExplorerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  modelsService = inject(ModelsService);
  inferenceService = inject(InferenceService);
  private physicsService = inject(PhysicsService);

  // Breadcrumb
  homeItem: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  breadcrumbItems: MenuItem[] = [];

  // State signals
  modelId = signal<string>('');
  problemType = signal<string>('');
  parameterValues = signal<ParameterValues>({});
  rangeConfig = signal<RangeConfig>({ min: 0, max: 10, steps: 100 });
  predictionResult = signal<PredictionResult | null>(null);

  // Computed signals
  model = computed(() => this.modelsService.selectedModel());

  parameters = computed<ParameterSpec[]>(() => {
    const model = this.model();
    if (!model) return [];

    return model.problemParams.map(p => ({
      name: p.name,
      symbol: p.symbol,
      description: p.description,
      min: p.min,
      max: p.max,
      default: p.default,
      step: p.step,
    }));
  });

  chartData = computed<PlotlyData[]>(() => {
    const result = this.predictionResult();
    if (!result) return [];

    const inputs = result.inputs;
    const outputs = result.outputs;

    const inputKey = Object.keys(inputs)[0];
    const outputKey = Object.keys(outputs)[0];

    if (!inputKey || !outputKey) return [];

    const xData = inputs[inputKey];
    const yData = outputs[outputKey];

    if (!Array.isArray(xData) || !Array.isArray(yData)) return [];

    // Check if 2D output
    if (Array.isArray(yData[0])) return [];

    return [{
      x: xData,
      y: yData as number[],
      type: 'scatter',
      mode: 'lines',
      name: outputKey,
      line: {
        color: '#6366f1',
        width: 2,
      },
      hovertemplate: `${inputKey}: %{x:.4f}<br>${outputKey}: %{y:.4f}<extra></extra>`,
    }];
  });

  chartLayout = computed<Partial<PlotlyLayout>>(() => {
    const result = this.predictionResult();
    if (!result) return {};

    const inputKey = Object.keys(result.inputs)[0];
    const outputKey = Object.keys(result.outputs)[0];

    return {
      xaxis: { title: inputKey || 'x' },
      yaxis: { title: outputKey || 'y' },
    };
  });

  is2DVisualization = computed(() => {
    const result = this.predictionResult();
    if (!result?.outputs) return false;

    const outputKey = Object.keys(result.outputs)[0];
    if (!outputKey) return false;

    const output = result.outputs[outputKey];
    return Array.isArray(output) && Array.isArray(output[0]);
  });

  surfaceData = computed<SurfaceData>(() => {
    const result = this.predictionResult();
    if (!result) return { x: [], y: [], z: [] };

    const inputs = result.inputs;
    const outputs = result.outputs;

    const inputKeys = Object.keys(inputs);
    const outputKey = Object.keys(outputs)[0];

    if (inputKeys.length < 2 || !outputKey) {
      return { x: [], y: [], z: [] };
    }

    return {
      x: inputs[inputKeys[0]] || [],
      y: inputs[inputKeys[1]] || [],
      z: (outputs[outputKey] as number[][]) || [],
    };
  });

  constructor() {
    // Initialize parameters when model loads
    effect(() => {
      const model = this.model();
      if (model) {
        this.initializeFromModel(model);
      }
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.paramMap;
    const problemType = params.get('problemType') || '';
    const modelId = params.get('modelId') || '';

    this.problemType.set(problemType);
    this.modelId.set(modelId);

    this.updateBreadcrumb();
    this.loadModel();
  }

  private updateBreadcrumb(): void {
    this.breadcrumbItems = [
      { label: 'Problems', routerLink: '/problems' },
      { label: this.problemType(), routerLink: `/gallery/${this.problemType()}` },
      { label: 'Explorer' },
    ];
  }

  loadModel(): void {
    const modelId = this.modelId();
    if (modelId) {
      this.modelsService.selectModel(modelId);
    }
  }

  private initializeFromModel(model: ModelDetail): void {
    // Set default parameter values
    const defaults: ParameterValues = {};
    model.problemParams.forEach(p => {
      defaults[p.name] = p.trainedValue ?? p.default;
    });
    this.parameterValues.set(defaults);

    // Set input range from model domain
    if (model.inputDomain?.variables?.length > 0) {
      const inputVar = model.inputDomain.variables[0];
      this.rangeConfig.set({
        min: inputVar.min,
        max: inputVar.max,
        steps: 100,
      });
    }
  }

  getGoverningEquation(): string {
    const problem = this.physicsService.getProblemById(this.problemType());
    return problem?.governingEquation || '';
  }

  onParameterChange(values: ParameterValues): void {
    this.parameterValues.set(values);
  }

  onRangeChange(config: RangeConfig): void {
    this.rangeConfig.set(config);
  }

  async runPrediction(): Promise<void> {
    const model = this.model();
    if (!model) return;

    const range = this.rangeConfig();
    const params = this.parameterValues();

    try {
      const result = await this.inferenceService.predict({
        modelId: model.id,
        inputs: {
          x: this.inferenceService.buildRangeInputs(range.min, range.max, range.steps),
        },
        parameters: params,
      });
      this.predictionResult.set(result);
    } catch (error) {
      console.error('Prediction failed:', error);
    }
  }
}
