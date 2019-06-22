import { Test, TestingModule } from '@nestjs/testing';
import { MfhtmlService } from './mfhtml.service';

describe('MfhtmlService', () => {
  let service: MfhtmlService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MfhtmlService],
    }).compile();

    service = module.get<MfhtmlService>(MfhtmlService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
