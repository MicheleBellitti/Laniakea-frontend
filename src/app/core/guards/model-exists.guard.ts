import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ModelsService } from '../services/models.service';

export const modelExistsGuard: CanActivateFn = async (route) => {
  const modelsService = inject(ModelsService);
  const router = inject(Router);

  const modelId = route.paramMap.get('modelId');

  if (!modelId) {
    router.navigate(['/problems']);
    return false;
  }

  try {
    await modelsService.selectModel(modelId);
    return modelsService.selectedModel() !== null;
  } catch {
    router.navigate(['/problems']);
    return false;
  }
};
