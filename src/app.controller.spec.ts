import { Test, TestingModule } from '@nestjs/testing';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
    }).compile();
  });

  /*describe('root', () => {
    it('should return "Hello World!"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getMicroApp()).toBe('Hello World!');
    });
  });*/
});
