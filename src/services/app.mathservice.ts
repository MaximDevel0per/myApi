import { Injectable } from '@nestjs/common';
import { error } from 'console';

export enum Operation {
  ADD = 'add',
  SUBTRACT = 'subtract',
  MULTIPLY = 'multiply',
  DIVIDE = 'divide',
}

@Injectable()
export class MathService {
  getAdd(a: number, b: number): number {
    return a + b;
  }
  getSubstract(a: number, b: number): number {
    return a - b;
  }
  getCalculate(a: number, b: number, c: Operation): number {
    if (c === Operation.ADD) {
      return a+b;
    } else if(c===Operation.SUBTRACT) {
      return a-b;
    } else if(c===Operation.MULTIPLY) {
      return a*b;
    } else if(c===Operation.DIVIDE) {
      return a/b;
    }
    throw new error("operation not defined")
  }
}
