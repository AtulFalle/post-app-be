import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { TcpClientService } from './tcp-client.service';
import { AuthGuard } from './guard/auth.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let tcpClientService: TcpClientService;

  const mockTcpClientService = {
    send: jest.fn(),
    sendAuthReq: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = { id: 'user123' }; // Mock authenticated user
      return true;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: TcpClientService, useValue: mockTcpClientService }],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    appController = module.get<AppController>(AppController);
    tcpClientService = module.get<TcpClientService>(TcpClientService);
  });

  it('should create a post', async () => {
    const postDto = { title: 'Test Post', description: 'Test Description' };
    const req = { user: { id: 'user123' } };
    mockTcpClientService.send.mockResolvedValue({ id: 'post123', ...postDto });

    const result = await appController.createPost(req, postDto);
    expect(result).toEqual({ id: 'post123', ...postDto });
    expect(tcpClientService.send).toHaveBeenCalledWith(
      { cmd: 'create_post' },
      { ...postDto, id: 'user123' }
    );
  });

  it('should get all posts', async () => {
    const mockPosts = [{ id: 'post1', title: 'Test' }];
    mockTcpClientService.send.mockResolvedValue(mockPosts);

    const result = await appController.getAllPosts();
    expect(result).toEqual(mockPosts);
    expect(tcpClientService.send).toHaveBeenCalledWith({ cmd: 'get_all_post' }, {});
  });

  it('should get a post by ID', async () => {
    const postId = 'post123';
    const mockPost = { id: postId, title: 'Test Post' };
    mockTcpClientService.send.mockResolvedValue(mockPost);

    const result = await appController.getPostById(postId);
    expect(result).toEqual(mockPost);
    expect(tcpClientService.send).toHaveBeenCalledWith({ cmd: 'get_post_by_id' }, { id: postId });
  });

  it('should authenticate with Google', async () => {
    const authCode = 'test_code';
    const mockTokenResponse = { access_token: 'jwt_token', id: 'user123' };
    mockTcpClientService.sendAuthReq.mockResolvedValue(mockTokenResponse);

    const result = await appController.googleLogin(authCode);
    expect(result).toEqual(mockTokenResponse);
    expect(tcpClientService.sendAuthReq).toHaveBeenCalledWith(
      { cmd: 'get_auth_token' },
      { code: authCode }
    );
  });

  it('should update a post', async () => {
    const postId = 'post123';
    const updateDto = { title: 'Updated Title', description: 'Updated Description' };
    const updatedPost = { id: postId, ...updateDto };
    mockTcpClientService.send.mockResolvedValue(updatedPost);

    const result = await appController.update(postId, updateDto);
    expect(result).toEqual(updatedPost);
    expect(tcpClientService.send).toHaveBeenCalledWith(
      { cmd: 'update_post' },
      { data: { id: postId, ...updateDto } }
    );
  });
});
