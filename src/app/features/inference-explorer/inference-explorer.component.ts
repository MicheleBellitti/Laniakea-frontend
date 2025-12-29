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
import { ModelsService, InferenceService, PhysicsService } from '../../core/services';
import { PredictionResult, ModelDetail } from '../../core/models';
import { ParameterPanelComponent, ParameterValues, RangeConfig } from './parameter-panel/parameter-panel.component';
import { ResultsPanelComponent } from './results-panel/results-panel.component';
import { PlotlyChartComponent, PlotlyData, PlotlyLayout } from '../visualization/plotly-chart/plotly-chart.component';
import { EquationDisplayComponent, LoadingSpinnerComponent } from '../../shared/components';
import { ParameterSpec } from '../../shared/components/parameter-slider/parameter-slider.component';

@Component({
  selector: 'app-inference-explorer',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ParameterPanelComponent,
    ResultsPanelComponent,
    PlotlyChartComponent,
    EquationDisplayComponent,
    LoadingSpinnerComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="explorer-page">
      <!-- Header -->
      <header class="page-header animate-fade-in">
        <div class="header-nav">
          <button class="back-btn" (click)="goBack()">
            <i class="pi pi-arrow-left"></i>
            <span>Back to Models</span>
          </button>
        </div>

        @if (modelsService.loading() && !model()) {
          <div class="header-skeleton">
            <div class="skeleton-line wide"></div>
            <div class="skeleton-line"></div>
          </div>
        } @else if (model()) {
          <div class="header-content">
            <div class="header-info">
              <span class="model-badge">
                <i class="pi pi-box"></i>
                {{ model()!.problemType }}
              </span>
              <h1>{{ model()!.name }}</h1>
              <p>{{ model()!.description }}</p>
            </div>

            @if (getGoverningEquation()) {
              <div class="header-equation animate-fade-in delay-2">
                <app-equation-display
                  [latex]="getGoverningEquation()"
                  displayMode="block"
                />
              </div>
            }
          </div>
        }
      </header>

      <!-- Main Content -->
      <div class="explorer-content">
        <!-- Parameters Panel -->
        <aside class="parameters-panel animate-fade-in delay-1">
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
        <main class="results-panel animate-fade-in delay-2">
          <app-results-panel
            [result]="predictionResult()"
            [loading]="inferenceService.loading()"
          >
            <!-- Visualization slot -->
            @if (predictionResult() && chartData().length > 0) {
              <div class="chart-wrapper">
                <app-plotly-chart
                  [data]="chartData()"
                  [layout]="chartLayout()"
                />
              </div>
            } @else if (!predictionResult() && !inferenceService.loading()) {
              <div class="empty-chart">
                <div class="empty-icon">
                  <i class="pi pi-chart-line"></i>
                </div>
                <h3>No Results Yet</h3>
                <p>Configure parameters and click "Run Prediction" to see results</p>
                <p-button
                  label="Run Prediction"
                  icon="pi pi-play"
                  styleClass="run-btn-empty"
                  (onClick)="runPrediction()"
                  [loading]="inferenceService.loading()"
                />
              </div>
            }
          </app-results-panel>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .explorer-page {
      min-height: 100vh;
      padding: 1.5rem;
      max-width: 1600px;
      margin: 0 auto;
    }

    // ============================================
    // HEADER
    // ============================================
    .page-header {
      margin-bottom: 1.5rem;
    }

    .header-nav {
      margin-bottom: 1.5rem;
    }

    .back-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: transparent;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #94a3b8;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease;

      &:hover {
        border-color: #7c3aed;
        color: #a78bfa;
      }
    }

    .header-skeleton {
      .skeleton-line {
        height: 1.5rem;
        background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 8px;
        margin-bottom: 0.75rem;

        &.wide {
          width: 300px;
          height: 2.5rem;
        }

        &:last-child {
          width: 500px;
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
      padding: 1.5rem;
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(51, 65, 85, 0.5);
      border-radius: 16px;

      @media (max-width: 1024px) {
        flex-direction: column;
      }
    }

    .header-info {
      flex: 1;
    }

    .model-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: rgba(124, 58, 237, 0.1);
      border: 1px solid rgba(124, 58, 237, 0.2);
      border-radius: 9999px;
      font-size: 0.75rem;
      color: #a78bfa;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.75rem;
    }

    h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 0.5rem;
    }

    .header-info > p {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0;
    }

    .header-equation {
      flex-shrink: 0;
      padding: 1.25rem 1.5rem;
      background: rgba(3, 7, 18, 0.5);
      border-radius: 12px;
      max-width: 400px;

      :host ::ng-deep .equation-container {
        margin: 0;
        padding: 0;
        background: transparent;
      }
    }

    // ============================================
    // MAIN CONTENT
    // ============================================
    .explorer-content {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 1.5rem;
      min-height: 600px;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
      }
    }

    .parameters-panel {
      @media (max-width: 1024px) {
        max-height: 400px;
      }
    }

    .results-panel {
      min-height: 500px;
    }

    .chart-wrapper {
      width: 100%;
      height: 100%;
      min-height: 400px;
    }

    .empty-chart {
      height: 100%;
      min-height: 400px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;

      .empty-icon {
        width: 100px;
        height: 100px;
        background: rgba(124, 58, 237, 0.1);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;

        i {
          font-size: 2.5rem;
          color: #7c3aed;
          opacity: 0.6;
        }
      }

      h3 {
        font-size: 1.25rem;
        color: #f1f5f9;
        margin-bottom: 0.5rem;
      }

      p {
        color: #64748b;
        margin-bottom: 1.5rem;
        max-width: 300px;
      }
    }

    :host ::ng-deep .run-btn-empty {
      background: linear-gradient(135deg, #7c3aed, #a855f7) !important;
      border: none !important;
      padding: 0.875rem 2rem !important;
    }

    // ============================================
    // ANIMATIONS
    // ============================================
    .animate-fade-in {
      opacity: 0;
      animation: fadeInUp 0.5s ease forwards;
    }

    @for $i from 1 through 5 {
      .delay-#{$i} {
        animation-delay: #{$i * 100}ms;
      }
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class InferenceExplorerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  modelsService = inject(ModelsService);
  inferenceService = inject(InferenceService);
  private physicsService = inject(PhysicsService);

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
    if (!model || !model.problemParams) return [];

    return model.problemParams.map(p => ({
      name: p.name,
      symbol: p.symbol,
      description: p.description,
      min: p.min,
      max: p.max,
      default: p.default,
      step: p.step || 0.1,
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
    if (Array.isArray(yData[0])) return []; // 2D output not supported yet

    return [{
      x: xData,
      y: yData as number[],
      type: 'scatter',
      mode: 'lines',
      name: outputKey,
      line: {
        color: '#7c3aed',
        width: 3,
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

  constructor() {
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

    this.physicsService.loadProblems();
    this.loadModel();
  }

  loadModel(): void {
    const modelId = this.modelId();
    if (modelId) {
      this.modelsService.selectModel(modelId);
    }
  }

  private initializeFromModel(model: ModelDetail): void {
    const defaults: ParameterValues = {};
    if (model.problemParams) {
      model.problemParams.forEach(p => {
        defaults[p.name] = p.trainedValue ?? p.default;
      });
    }
    this.parameterValues.set(defaults);

    if (model.inputDomain?.variables?.length > 0) {
      const inputVar = model.inputDomain.variables[0];
      this.rangeConfig.set({
        min: inputVar.min,
        max: inputVar.max,
        steps: 100,
      });
    }

    // Auto-run prediction on load
    setTimeout(() => this.runPrediction(), 500);
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

    // Get the input variable name from the model's input domain (e.g., 'xi', 'x', 'r', etc.)
    const inputVarName = model.inputDomain?.variables?.[0]?.name || 'x';

    try {
      const result = await this.inferenceService.predict({
        modelId: model.id,
        inputs: {
          [inputVarName]: this.inferenceService.buildRangeInputs(range.min, range.max, range.steps),
        },
        parameters: params,
      });
      this.predictionResult.set(result);
    } catch (error) {
      console.error('Prediction failed:', error);
    }
  }

  goBack(): void {
    const problemType = this.problemType();
    if (problemType) {
      this.router.navigate(['/gallery', problemType]);
    } else {
      this.router.navigate(['/gallery']);
    }
  }
}
