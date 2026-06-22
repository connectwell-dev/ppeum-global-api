import { Module, Global } from '@nestjs/common';
import { OrderHelper } from './order.helper';

@Global()
@Module({
  providers: [OrderHelper],
  exports: [OrderHelper],
})
export class HelpersModule { }
