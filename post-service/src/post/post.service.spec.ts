import { Test, TestingModule } from '@nestjs/testing';
import { PostService } from './post.service';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Post } from './post.schema';

describe('PostService', () => {
  let service: PostService;
  let postModel: Model<Post>;
  let cacheManager: any;

  const mockPost = { _id: '1', title: 'Test Post', description: 'Test Description', createdBy: '123' };

  const mockPostModel = {
    find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockPost]) }),
    findById: jest.fn().mockImplementation((id) => ({
      exec: jest.fn().mockResolvedValue(id === '1' ? mockPost : null),
    })),
    findByIdAndUpdate: jest.fn().mockImplementation((id, update) => ({
      exec: jest.fn().mockResolvedValue(id === '1' ? { ...mockPost, ...update } : null),
    })),
    findByIdAndDelete: jest.fn().mockImplementation((id) => ({
      exec: jest.fn().mockResolvedValue(id === '1' ? mockPost : null),
    })),
    create: jest.fn().mockImplementation((dto) => ({
      _id: '2',
      ...dto,
    })),
  };

  const mockCacheManager = {
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostService,
        { provide: getModelToken(Post.name), useValue: mockPostModel },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<PostService>(PostService);
    postModel = module.get<Model<Post>>(getModelToken(Post.name));
    cacheManager = module.get(CACHE_MANAGER);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      expect(await service.findAll()).toEqual([mockPost]);
    });
  });

  describe('findById', () => {
    it('should return a post if found', async () => {
      expect(await service.findById('1')).toEqual(mockPost);
    });

    it('should throw NotFoundException if post is not found', async () => {
      mockPostModel.findById.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.findById('2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new post', async () => {
      const newPost = await service.create('New Post', 'New Description', '123');
      expect(newPost).toEqual({ _id: '2', title: 'New Post', description: 'New Description', createdBy: '123' });
    });
  });

  describe('update', () => {
    it('should update and return a post', async () => {
      expect(await service.update('1', 'Updated Title', 'Updated Description')).toEqual({
        _id: '1',
        title: 'Updated Title',
        description: 'Updated Description',
        createdBy: '123',
      });
    });

    it('should throw NotFoundException if post is not found', async () => {
      mockPostModel.findByIdAndUpdate.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.update('2', 'Title', 'Description')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a post and return success message', async () => {
      expect(await service.delete('1')).toEqual({ message: 'Post deleted successfully' });
    });

    it('should throw NotFoundException if post is not found', async () => {
      mockPostModel.findByIdAndDelete.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });

      await expect(service.delete('2')).rejects.toThrow(NotFoundException);
    });
  });
});
