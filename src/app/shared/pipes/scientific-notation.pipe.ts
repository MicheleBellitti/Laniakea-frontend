import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'scientificNotation',
  standalone: true,
})
export class ScientificNotationPipe implements PipeTransform {
  transform(value: number | null | undefined, precision: number = 2): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value === 0) {
      return '0';
    }

    // For very small or very large numbers, use scientific notation
    if (Math.abs(value) < 0.001 || Math.abs(value) >= 10000) {
      const exp = value.toExponential(precision);
      // Format as 1.23×10⁻⁵ instead of 1.23e-5
      return exp.replace(/e([+-]?\d+)/, (_, exp) => {
        const superscript = exp
          .replace('+', '')
          .split('')
          .map((char: string) => this.toSuperscript(char))
          .join('');
        return `×10${superscript}`;
      });
    }

    return value.toFixed(precision);
  }

  private toSuperscript(char: string): string {
    const map: Record<string, string> = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      '-': '⁻', '+': '⁺',
    };
    return map[char] || char;
  }
}
