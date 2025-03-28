import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('axios');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockJwtToken'),
            verify: jest.fn().mockImplementation((token) => {
              if (token === 'validToken') return { id: '123', email: 'test@example.com' };
              throw new UnauthorizedException('Invalid token');
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key) => {
              const config = {
                GOOGLE_CLIENT_ID: 'mockClientId',
                GOOGLE_CLIENT_SECRET: 'mockClientSecret',
                JWT_SECRET: 'mockSecret',
              };
              return config[key];
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockResolvedValue({ id: '123', email: 'test@example.com' }),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateOAuthLogin', () => {
    it('should return a JWT token', async () => {
      const token = await service.validateOAuthLogin({ id: '123', email: 'test@example.com' });
      expect(token).toBe('mockJwtToken');
    });
  });


  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      const token = service.generateToken({ googleId: '123', email: 'test@example.com' });
      expect(token).toBe('mockJwtToken');
    });
  });

  describe('getGoogleAuthToken', () => {
    it('should return an access token', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: { id_token: 'mockIdToken', access_token: 'mockAccessToken' } });
      jest.spyOn(service, 'getUserProfile').mockResolvedValue('mockJwtToken');
      jest.spyOn(service, 'handelUserCreation').mockResolvedValue({id: '123', email: '', name: '', googleId: '', image: '', createdAt: new Date()});
      
      const result = await service.getGoogleAuthToken('mockCode');
      expect(result).toEqual({ access_token: 'mockJwtToken', id: '123' });
    });

    it('should throw UnauthorizedException if id_token is missing', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: {} });
      await expect(service.getGoogleAuthToken('mockCode')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('handelUserCreation', () => {
    it('should create and return a new user if not found', async () => {
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.user.create = jest.fn().mockResolvedValue({ id: '123', email: 'test@example.com' });
      
      const result = await service.handelUserCreation({ id: '123', email: 'test@example.com' });
      expect(result).toEqual({ id: '123', email: 'test@example.com' });
    });
  });
});
