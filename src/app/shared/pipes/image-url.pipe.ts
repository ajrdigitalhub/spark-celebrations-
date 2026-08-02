import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

@Pipe({
  name: 'imageUrl',
  standalone: true
})
export class ImageUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string | null {
    if (!value) return null;
    if (value.startsWith('http')) return value;
    return `${environment.uploadsBaseUrl}${value}`;
  }
}
