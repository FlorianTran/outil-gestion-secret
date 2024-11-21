import { Controller, Get, Post, Body, Param } from '@nestjs/common';

@Controller('secrets')
export class SecretsController {
  @Post()
  createSecret(@Body() body: any) {
    return {
      message: 'Secret created successfully!',
      body,
    };
  }

  @Get(':id')
  getSecret(@Param('id') id: string) {
    return {
      message: `Fetching secret with ID: ${id}`,
    };
  }
}
