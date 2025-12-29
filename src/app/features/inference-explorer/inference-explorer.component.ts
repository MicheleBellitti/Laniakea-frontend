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
import { PredictionResult, ModelDetail, InputDomain, DomainVariable } from '../../core/models';
import { ParameterPanelComponent, ParameterValues, RangeConfig } from './parameter-panel/parameter-panel.component';
import { ResultsPanelComponent } from './results-panel/results-panel.component';
import { PhysicsInterpretationComponent } from './physics-interpretation/physics-interpretation.component';
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
    PhysicsInterpretationComponent,
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
              <div class="chart-wrapper" [class.chart-3d]="is2DProblem()">
                <app-plotly-chart
                  [data]="chartData()"
                  [layout]="chartLayout()"
                />
              </div>

              <!-- Physics Interpretation -->
              <div class="interpretation-wrapper animate-fade-in delay-3">
                <app-physics-interpretation
                  [problemType]="problemType()"
                  [outputKeys]="getOutputKeys()"
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

      &.chart-3d {
        min-height: 500px;
      }
    }

    .interpretation-wrapper {
      margin-top: 1rem;
      padding: 0 0.5rem;
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
  visualizationMode = signal<'auto' | 'surface' | 'heatmap' | 'contour' | 'line'>('auto');

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

  // Detect if this is a 2D problem based on input structure
  is2DProblem = computed(() => {
    const result = this.predictionResult();
    if (!result) return false;
    const inputKeys = Object.keys(result.inputs);
    return inputKeys.length >= 2;
  });

  chartData = computed<PlotlyData[]>(() => {
    const result = this.predictionResult();
    const model = this.model();
    if (!result) return [];

    const inputs = result.inputs;
    const outputs = result.outputs;
    const inputKeys = Object.keys(inputs);
    const outputKeys = Object.keys(outputs);

    if (inputKeys.length === 0 || outputKeys.length === 0) return [];

    const modelAny = model as unknown as Record<string, unknown>;
    const pType = model?.problemType || modelAny?.['problem_type'] as string || '';

    // Check if this is a 2D problem (two input variables like x, y)
    if (inputKeys.length >= 2) {
      return this.create2DVisualization(inputs, outputs, inputKeys, outputKeys, pType);
    }

    // 1D problem visualization
    return this.create1DVisualization(inputs, outputs, inputKeys, outputKeys, pType, model);
  });

  private create2DVisualization(
    inputs: Record<string, unknown>,
    outputs: Record<string, unknown>,
    inputKeys: string[],
    outputKeys: string[],
    problemType: string
  ): PlotlyData[] {
    const xData = inputs[inputKeys[0]] as number[];
    const yData = inputs[inputKeys[1]] as number[];
    const zData = outputs[outputKeys[0]];

    if (!Array.isArray(xData) || !Array.isArray(yData)) return [];

    // For 2D problems, create a 3D surface plot
    // The output should be a 2D array for surface plots
    if (Array.isArray(zData) && Array.isArray(zData[0])) {
      // Already 2D array
      const z2D = zData as number[][];
      return [{
        x: xData,
        y: yData,
        z: z2D,
        type: 'surface',
        colorscale: this.getColorscaleForProblem(problemType),
        colorbar: {
          title: this.getOutputLabel(outputKeys[0], problemType),
          tickfont: { color: '#e5e7eb' },
          titlefont: { color: '#e5e7eb' },
        },
        hovertemplate: `x: %{x:.3f}<br>y: %{y:.3f}<br>${outputKeys[0]}: %{z:.6f}<extra></extra>`,
        contours: {
          z: {
            show: true,
            usecolormap: true,
            highlightcolor: '#ffffff',
            project: { z: true }
          }
        },
        lighting: {
          ambient: 0.6,
          diffuse: 0.5,
          specular: 0.2,
          roughness: 0.5,
        },
        lightposition: {
          x: 100,
          y: 200,
          z: 0
        }
      } as PlotlyData];
    }

    // If flat array, we need to reshape it into a 2D grid
    if (Array.isArray(zData)) {
      const gridSize = Math.sqrt(zData.length);
      if (Number.isInteger(gridSize)) {
        const z2D: number[][] = [];
        for (let i = 0; i < gridSize; i++) {
          z2D.push((zData as number[]).slice(i * gridSize, (i + 1) * gridSize));
        }

        // Create unique x and y arrays for the grid
        const uniqueX = [...new Set(xData)].sort((a, b) => a - b);
        const uniqueY = [...new Set(yData)].sort((a, b) => a - b);

        return [{
          x: uniqueX,
          y: uniqueY,
          z: z2D,
          type: 'surface',
          colorscale: this.getColorscaleForProblem(problemType),
          colorbar: {
            title: this.getOutputLabel(outputKeys[0], problemType),
            tickfont: { color: '#e5e7eb' },
            titlefont: { color: '#e5e7eb' },
          },
          hovertemplate: `x: %{x:.3f}<br>y: %{y:.3f}<br>${outputKeys[0]}: %{z:.6f}<extra></extra>`,
          contours: {
            z: {
              show: true,
              usecolormap: true,
              highlightcolor: '#ffffff',
              project: { z: true }
            }
          },
          lighting: {
            ambient: 0.6,
            diffuse: 0.5,
            specular: 0.2,
            roughness: 0.5,
          }
        } as PlotlyData];
      }
    }

    return [];
  }

  private create1DVisualization(
    inputs: Record<string, unknown>,
    outputs: Record<string, unknown>,
    inputKeys: string[],
    outputKeys: string[],
    problemType: string,
    model: ModelDetail | null
  ): PlotlyData[] {
    const xData = inputs[inputKeys[0]] as number[];
    if (!Array.isArray(xData)) return [];

    const modelAny = model as unknown as Record<string, unknown>;
    const domain = model?.inputDomain || modelAny?.['input_domain'] as InputDomain | undefined;
    const inputSymbol = domain?.variables?.[0]?.symbol || inputKeys[0];

    // Color palette
    const colors = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

    // Check if output is 2D (shouldn't happen for 1D input, but handle it)
    const firstOutput = outputs[outputKeys[0]];
    if (Array.isArray(firstOutput) && Array.isArray(firstOutput[0])) {
      const zData = firstOutput as number[][];
      return [{
        x: xData,
        y: Array.from({ length: zData.length }, (_, i) => i),
        z: zData,
        type: 'heatmap',
        colorscale: this.getColorscaleForProblem(problemType),
        colorbar: {
          title: outputKeys[0],
          tickfont: { color: '#9ca3af' },
        },
        hovertemplate: `${inputKeys[0]}: %{x:.4f}<br>y: %{y}<br>${outputKeys[0]}: %{z:.4f}<extra></extra>`,
      }];
    }

    // Standard 1D line traces with enhanced styling for Lane-Emden
    const traces = outputKeys.map((outputKey, index) => {
      const yData = outputs[outputKey];
      if (!Array.isArray(yData) || Array.isArray(yData[0])) {
        return null;
      }

      const isLaneEmden = problemType.includes('lane') || problemType.includes('emden');
      const outputLabel = this.getOutputLabel(outputKey, problemType);

      return {
        x: xData,
        y: yData as number[],
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: outputLabel,
        line: {
          color: colors[index % colors.length],
          width: isLaneEmden ? 3 : 2.5,
        },
        fill: isLaneEmden ? 'tozeroy' : undefined,
        fillcolor: isLaneEmden ? 'rgba(124, 58, 237, 0.1)' : undefined,
        hovertemplate: `${inputSymbol}: %{x:.4f}<br>${outputLabel}: %{y:.6f}<extra></extra>`,
      };
    }).filter((trace): trace is NonNullable<typeof trace> => trace !== null);

    return traces;
  }

  private getColorscaleForProblem(problemType: string): string {
    if (problemType.includes('poisson') || problemType.includes('gravity')) {
      // Purple-blue gradient for gravitational potential (deeper = more negative)
      return 'Viridis';
    }
    if (problemType.includes('lane') || problemType.includes('emden')) {
      // Orange-red for stellar density (hot core)
      return 'Hot';
    }
    if (problemType.includes('heat') || problemType.includes('diffusion')) {
      return 'RdYlBu';
    }
    if (problemType.includes('schrodinger') || problemType.includes('quantum')) {
      return 'Portland';
    }
    return 'Viridis';
  }

  private getOutputLabel(outputKey: string, problemType: string): string {
    // Map output variable names to physical meanings
    const labelMap: Record<string, Record<string, string>> = {
      'lane_emden': {
        'theta': 'θ (Density Profile)',
        'y': 'θ (Density Profile)',
      },
      'poisson_gravity': {
        'phi': 'φ (Gravitational Potential)',
        'potential': 'φ (Gravitational Potential)',
        'y': 'φ (Gravitational Potential)',
      },
      'schrodinger': {
        'psi': 'ψ (Wave Function)',
        'y': 'ψ (Wave Function)',
      },
      'heat': {
        'T': 'T (Temperature)',
        'temperature': 'T (Temperature)',
        'y': 'T (Temperature)',
      }
    };

    // Find matching problem type
    for (const [pType, labels] of Object.entries(labelMap)) {
      if (problemType.includes(pType) || problemType.replace('-', '_').includes(pType)) {
        const label = labels[outputKey.toLowerCase()] || labels['y'];
        if (label) return label;
      }
    }

    return outputKey;
  }

  chartLayout = computed<Partial<PlotlyLayout>>(() => {
    const result = this.predictionResult();
    const model = this.model();
    if (!result) return {};

    const inputKeys = Object.keys(result.inputs);
    const outputKeys = Object.keys(result.outputs);
    const is2D = inputKeys.length >= 2;

    const modelAny = model as unknown as Record<string, unknown>;
    const domain = model?.inputDomain || modelAny?.['input_domain'] as InputDomain | undefined;
    const pType = model?.problemType || modelAny?.['problem_type'] as string || '';

    if (is2D) {
      // 3D surface layout for 2D problems
      const zLabel = this.getOutputLabel(outputKeys[0], pType);

      return {
        scene: {
          xaxis: {
            title: 'x',
            gridcolor: 'rgba(75, 85, 99, 0.5)',
            backgroundcolor: 'rgba(15, 23, 42, 0.8)',
            tickfont: { color: '#9ca3af' },
            titlefont: { color: '#e5e7eb' },
          },
          yaxis: {
            title: 'y',
            gridcolor: 'rgba(75, 85, 99, 0.5)',
            backgroundcolor: 'rgba(15, 23, 42, 0.8)',
            tickfont: { color: '#9ca3af' },
            titlefont: { color: '#e5e7eb' },
          },
          zaxis: {
            title: zLabel,
            gridcolor: 'rgba(75, 85, 99, 0.5)',
            backgroundcolor: 'rgba(15, 23, 42, 0.8)',
            tickfont: { color: '#9ca3af' },
            titlefont: { color: '#e5e7eb' },
          },
          camera: {
            eye: { x: 1.5, y: 1.5, z: 1.2 },
            center: { x: 0, y: 0, z: -0.1 },
          },
          aspectmode: 'cube',
          bgcolor: 'rgba(15, 23, 42, 0.95)',
        },
        margin: { t: 30, r: 30, b: 30, l: 30 },
        showlegend: false,
      } as Partial<PlotlyLayout>;
    }

    // 1D layout
    const inputVar = domain?.variables?.[0];
    const xLabel = inputVar?.symbol
      ? `${inputVar.symbol} (${inputVar.name || inputKeys[0]})`
      : inputKeys[0] || 'x';

    const yLabel = this.getOutputLabel(outputKeys[0], pType);

    // Add physical interpretation title for Lane-Emden
    const isLaneEmden = pType.includes('lane') || pType.includes('emden');
    const title = isLaneEmden
      ? { text: 'Stellar Density Profile', font: { color: '#a78bfa', size: 14 } }
      : undefined;

    return {
      title,
      xaxis: {
        title: xLabel,
        gridcolor: 'rgba(75, 85, 99, 0.3)',
      },
      yaxis: {
        title: yLabel,
        gridcolor: 'rgba(75, 85, 99, 0.3)',
      },
      showlegend: outputKeys.length > 1,
      legend: {
        x: 1,
        y: 1,
        xanchor: 'right',
        bgcolor: 'rgba(31, 41, 55, 0.8)',
        font: { color: '#e5e7eb' },
      },
    };
  });

  constructor() {
    effect(() => {
      const model = this.model();
      if (model) {
        this.initializeFromModel(model);
      }
    }, { allowSignalWrites: true });
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

    // Handle both camelCase and snake_case from API
    const modelAny = model as unknown as Record<string, unknown>;
    const problemParams = model.problemParams || modelAny['problem_params'];
    const inputDomain = model.inputDomain || modelAny['input_domain'] as typeof model.inputDomain;

    // problemParams can be either an array (mock data) or object (real API)
    if (Array.isArray(problemParams)) {
      problemParams.forEach(p => {
        const pAny = p as unknown as Record<string, unknown>;
        const trainedValue = p.trainedValue ?? pAny['trained_value'] as number | undefined;
        defaults[p.name] = trainedValue ?? p.default;
      });
    } else if (problemParams && typeof problemParams === 'object') {
      // Real API returns problem_params as an object - use it directly for predictions
      // Store the raw object for later use
      Object.assign(defaults, problemParams);
    }
    this.parameterValues.set(defaults);

    // Handle both 'variables' and 'input_variables' from API
    const inputDomainAny = inputDomain as unknown as Record<string, unknown>;
    const variables = inputDomain?.variables || inputDomainAny?.['input_variables'] as typeof inputDomain.variables;

    if (variables?.length > 0) {
      const inputVar = variables[0];
      this.rangeConfig.set({
        min: inputVar.min,
        max: inputVar.max,
        steps: 100,
      });
    } else {
      // Fallback: derive range from problem_params or use defaults
      const paramsObj = problemParams as unknown as Record<string, unknown>;
      const domainSize = paramsObj?.['domain_size'] as number;
      if (domainSize) {
        this.rangeConfig.set({
          min: -domainSize,
          max: domainSize,
          steps: 100,
        });
      }
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

  /**
   * Creates default input variables based on problem type and input dimension.
   */
  private getDefaultInputVariables(problemType: string, inputDim: number): DomainVariable[] {
    const range = this.rangeConfig();

    if (problemType === 'lane_emden' || problemType === 'lane-emden') {
      return [{ name: 'xi', symbol: 'ξ', min: range.min, max: range.max, description: 'Dimensionless radius' }];
    }

    if (problemType === 'poisson_gravity' || problemType === 'poisson-gravity' || problemType.startsWith('poisson')) {
      if (inputDim === 2) {
        return [
          { name: 'x', symbol: 'x', min: range.min, max: range.max, description: 'X coordinate' },
          { name: 'y', symbol: 'y', min: range.min, max: range.max, description: 'Y coordinate' }
        ];
      }
      return [{ name: 'r', symbol: 'r', min: range.min, max: range.max, description: 'Radial coordinate' }];
    }

    if (problemType === 'schrodinger_1d' || problemType === 'schrodinger-1d') {
      return [{ name: 'x', symbol: 'x', min: range.min, max: range.max, description: 'Position' }];
    }

    if (problemType === 'heat_diffusion' || problemType === 'heat-diffusion') {
      if (inputDim === 2) {
        return [
          { name: 'x', symbol: 'x', min: range.min, max: range.max, description: 'Position' },
          { name: 't', symbol: 't', min: 0, max: 1, description: 'Time' }
        ];
      }
      return [{ name: 'x', symbol: 'x', min: range.min, max: range.max, description: 'Position' }];
    }

    // Default: generate x, y, z... based on input dimension
    const varNames = ['x', 'y', 'z', 'w'];
    return varNames.slice(0, inputDim).map(name => ({
      name,
      symbol: name,
      min: range.min,
      max: range.max,
      description: `${name.toUpperCase()} coordinate`
    }));
  }

  /**
   * Normalizes a variable symbol to the ASCII name expected by the API.
   * Maps Greek letters and other symbols to their ASCII equivalents.
   */
  private normalizeVariableName(symbol: string, problemType: string): string {
    // Map of Greek symbols to ASCII equivalents
    const symbolMap: Record<string, string> = {
      'ξ': 'xi',
      'Ξ': 'xi',
      'ρ': 'rho',
      'θ': 'theta',
      'Θ': 'theta',
      'φ': 'phi',
      'Φ': 'phi',
      'ψ': 'psi',
      'Ψ': 'psi',
      'α': 'alpha',
      'β': 'beta',
      'γ': 'gamma',
      'δ': 'delta',
      'ε': 'epsilon',
      'η': 'eta',
      'λ': 'lambda',
      'μ': 'mu',
      'π': 'pi',
      'σ': 'sigma',
      'τ': 'tau',
      'ω': 'omega',
    };

    // Normalize the symbol (remove subscripts/superscripts)
    const normalizedSymbol = symbol.trim();
    
    // Problem-specific mappings (these take precedence)
    if (problemType === 'lane-emden' || problemType === 'lane_emden') {
      // Lane-Emden always uses 'xi' for the radial coordinate
      return 'xi';
    }
    
    if (problemType === 'poisson-gravity' || problemType === 'poisson_gravity' || problemType.startsWith('poisson')) {
      // Poisson gravity problems use 'r' for radial coordinate
      return 'r';
    }

    // Check if it's a Greek letter
    if (symbolMap[normalizedSymbol]) {
      return symbolMap[normalizedSymbol];
    }

    // Default: return lowercase ASCII version of the symbol
    return normalizedSymbol.toLowerCase();
  }

  async runPrediction(): Promise<void> {
    const model = this.model();
    if (!model) return;

    const range = this.rangeConfig();
    const params = this.parameterValues();

    // Get the input variable info from the model
    const modelAny = model as unknown as Record<string, unknown>;
    const inputDomain = model.inputDomain || modelAny['input_domain'] as typeof model.inputDomain;
    const architecture = model.architecture || modelAny['architecture'] as Record<string, unknown>;
    const problemType = model.problemType || modelAny['problem_type'] as string;

    // Handle both 'variables' and 'input_variables' from API
    const inputDomainAny = inputDomain as unknown as Record<string, unknown>;
    let variables = inputDomain?.variables || inputDomainAny?.['input_variables'] as typeof inputDomain.variables;

    // If no variables defined, create defaults based on architecture and problem type
    if (!variables || variables.length === 0) {
      const archAny = architecture as unknown as Record<string, unknown>;
      const inputDim = (architecture?.inputDim || archAny?.['input_dim'] || 1) as number;
      variables = this.getDefaultInputVariables(problemType, inputDim);
    }

    const firstVariable = variables[0];
    const inputVarName = firstVariable.name || firstVariable.symbol || 'x';

    console.log('Running prediction with input variable:', inputVarName, 'problemType:', model.problemType, 'variables:', variables);

    try {
      // Build inputs object - for 1D problems use first variable, for 2D handle both
      const inputs: Record<string, any> = {};
      
      if (variables.length === 1) {
        // 1D problem - single input variable
        inputs[inputVarName] = this.inferenceService.buildRangeInputs(range.min, range.max, range.steps);
      } else {
        // 2D problem - multiple input variables (e.g., Poisson with x and y)
        variables.forEach((variable, index) => {
          const varName = variable.name || variable.symbol || (index === 0 ? 'x' : 'y');
          // For 2D, use the same range for both dimensions (could be enhanced later)
          inputs[varName] = this.inferenceService.buildRangeInputs(range.min, range.max, range.steps);
        });
      }

      const result = await this.inferenceService.predict({
        modelId: model.id,
        inputs,
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

  getOutputKeys(): string[] {
    const result = this.predictionResult();
    if (!result?.outputs) return [];
    return Object.keys(result.outputs);
  }
}
