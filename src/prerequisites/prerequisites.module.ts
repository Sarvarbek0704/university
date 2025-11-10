import { Module } from '@nestjs/common';
import { PrerequisitesService } from './prerequisites.service';
import { PrerequisitesController } from './prerequisites.controller';

@Module({
  controllers: [PrerequisitesController],
  providers: [PrerequisitesService],
})
export class PrerequisitesModule {}
