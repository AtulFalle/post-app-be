import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

jest.mock('@nestjs/passport', () => ({
  AuthGuard: jest.fn().mockImplementation(() => {
    return jest.fn().mockImplementation((context: ExecutionContext) => {
      return true;
    });
  }),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;
  let configService: ConfigService;

  const mockAuthService = {
    generateToken: jest.fn().mockReturnValue('mockJwtToken'),
    getGoogleAuthToken: jest.fn().mockResolvedValue('mockGoogleAuthToken'),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      return key === 'JWT_SECRET' ? 'mockSecret' : null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
        
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuthCallback', () => {
    it('should return an access token', () => {
      const req = { user: { id: '123', email: 'test@example.com' } };
      const result = controller.googleAuthCallback(req);
      expect(service.generateToken).toHaveBeenCalledWith(req.user);
      expect(result).toEqual({ access_token: 'mockJwtToken' });
    });
  });

  describe('googleLogin', () => {
    it('should return Google auth token', async () => {
      const code = 'testCode';
      const result = await controller.googleLogin(code);
      expect(service.getGoogleAuthToken).toHaveBeenCalledWith(code);
      expect(result).toEqual('mockGoogleAuthToken');
    });
  });

  describe('googleLoginTCP', () => {
    it('should return Google auth token via TCP', async () => {
      const data = { code: 'testCode' };
      const result = await controller.googleLoginTCP(data);
      expect(service.getGoogleAuthToken).toHaveBeenCalledWith(data.code);
      expect(result).toEqual('mockGoogleAuthToken');
    });
  });
});
