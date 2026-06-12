import { PipeTransform, ArgumentMetadata, Injectable } from '@nestjs/common';

@Injectable()
export class LowerPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata): any {
    console.log(value)
    if (typeof value === 'string') {
      return value.toLowerCase();
    }

    return value;
  }
}
