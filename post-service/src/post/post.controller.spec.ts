import { Test, TestingModule } from '@nestjs/testing';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from './post.schema';
import { of } from 'rxjs';

describe('PostController', () => {
  let controller: PostController;
  let service: PostService;

  const mockPost = { _id: '1', title: 'Test Post', description: 'Test Description', createdBy: '123' };

  const mockPostService = {
    findAll: jest.fn().mockResolvedValue([mockPost]),
    findById: jest.fn().mockImplementation((id) => {
      console.log('findBy id ', id)
      return id === '1' ? Promise.resolve(mockPost) : Promise.reject(new NotFoundException());
    }),

    create: jest.fn().mockImplementation((title, description, id) => {
      return Promise.resolve({ _id: '2', title, description, createdBy: id });
    }),
    update: jest.fn().mockImplementation((id, title, description) => {
      return id === '1'
        ? Promise.resolve({ _id: '1', title, description, createdBy: '123' })
        : Promise.reject(new NotFoundException());
    }),
    delete: jest.fn().mockImplementation((id) => {
      return id === '1' ? Promise.resolve({ message: 'Post deleted successfully' }) : Promise.reject(new NotFoundException());
    }),
    findAllTCP: jest.fn().mockResolvedValue([mockPost]),
    createPostTCP: jest.fn().mockImplementation(({ title, description, id }) => {
      return Promise.resolve({ _id: '2', title, description, createdBy: id });
    }),
    updatePostTCP: jest.fn().mockImplementation(({ data }) => {
      return data.id === '1'
        ? Promise.resolve({ _id: '1', title: data.title, description: data.description, createdBy: '123' })
        : Promise.reject(new NotFoundException());
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [
        { provide: PostService, useValue: mockPostService },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn(), del: jest.fn() } },
      ],
    }).compile();

    controller = module.get<PostController>(PostController);
    service = module.get<PostService>(PostService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      expect(await controller.findAll()).toEqual([mockPost]);
    });
  });

  describe('findById', () => {
    it('should return a post if found', async () => {
      expect(await controller.findById('1')).toEqual(mockPost);
    });

    it('should throw NotFoundException if post is not found', async () => {
      await expect(controller.findById('2')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createPostTCP', () => {
    it('should create and return a new post', async () => {
      const newPost = await controller.createPostTCP({ title: 'New Post', description: 'New Description', id: '123' });
      expect(newPost).toEqual({ _id: '2', title: 'New Post', description: 'New Description', createdBy: '123' });
    });
  });



  describe('updatePostTCP', () => {
    it('should update and return a post', async () => {
      expect(await controller.updatePostTCP({ data: { id: '1', title: 'Updated Title', description: 'Updated Description' } })).toEqual({
        _id: '1',
        title: 'Updated Title',
        description: 'Updated Description',
        createdBy: '123',
      });
    });

    it('should throw NotFoundException if post is not found', async () => {
      await expect(controller.updatePostTCP({ data: { id: '2', title: 'Title', description: 'Description' } })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a post and return success message', async () => {
      expect(await controller.delete('1')).toEqual({ message: 'Post deleted successfully' });
    });

    it('should throw NotFoundException if post is not found', async () => {
      await expect(controller.delete('2')).rejects.toThrow(NotFoundException);
    });
  });
});
