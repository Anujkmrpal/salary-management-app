import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get high-level summary KPIs' })
  getSummary() {
    return this.analyticsService.getSummary();
  }

  @Get('by-department')
  @ApiOperation({ summary: 'Get headcount and salary stats by department' })
  getByDepartment() {
    return this.analyticsService.getByDepartment();
  }

  @Get('by-country')
  @ApiOperation({ summary: 'Get headcount and salary stats by country' })
  getByCountry() {
    return this.analyticsService.getByCountry();
  }

  @Get('salary-distribution')
  @ApiOperation({ summary: 'Get salary distribution in bands (histogram data)' })
  getSalaryDistribution() {
    return this.analyticsService.getSalaryDistribution();
  }

  @Get('by-employment-type')
  @ApiOperation({ summary: 'Get headcount by employment type' })
  getByEmploymentType() {
    return this.analyticsService.getByEmploymentType();
  }

  @Get('by-gender')
  @ApiOperation({ summary: 'Get headcount and salary stats by gender' })
  getByGender() {
    return this.analyticsService.getByGender();
  }
}
