import { Test, TestingModule } from '@nestjs/testing';
import { UrlResolverService } from './url-resolver.service';

describe('UrlResolverService', () => {
  let service: UrlResolverService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlResolverService],
    }).compile();

    service = module.get<UrlResolverService>(UrlResolverService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
