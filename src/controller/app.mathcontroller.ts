import { Controller, Get, Param } from '@nestjs/common';
import { MathService, Operation } from '../services/app.mathservice';
import { ApiQuery } from '@nestjs/swagger';

@Controller('math')
export class MathController {
  constructor(private readonly mathService: MathService) {}

  @Get('add')
  @ApiQuery({ name: 'a', type: Number })
  @ApiQuery({ name: 'b', type: Number })
  getAdd(@Param('a') a:number, @Param('b') b:number): number {
    return this.mathService.getAdd(a, b);
  }

  @Get('substract')
  @ApiQuery({ name: 'a', type: Number })
  @ApiQuery({ name: 'b', type: Number })
  getSubstract(@Param('a') a:number, @Param('b') b:number): number {
    return this.mathService.getCalculate(a, b, Operation.SUBTRACT);
  }

  @Get('multiply')
  @ApiQuery({ name: 'a', type: Number })
  @ApiQuery({ name: 'b', type: Number })
  getMultiply(@Param('a') a:number, @Param('b') b:number): number {
    return this.mathService.getCalculate(a, b, Operation.MULTIPLY);
  }

  @Get('divide')
  @ApiQuery({ name: 'a', type: Number })
  @ApiQuery({ name: 'b', type: Number })
  getDivide(@Param('a') a:number, @Param('b') b:number): number {
    return this.mathService.getCalculate(a, b, Operation.DIVIDE);
  }

}
