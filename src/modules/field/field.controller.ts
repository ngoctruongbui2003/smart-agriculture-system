import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FieldService } from './field.service';

@Controller('field')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

}
