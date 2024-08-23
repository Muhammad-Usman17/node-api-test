import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { RolesGuard } from '../../guards/roles.guard';
import { AuthGuard } from '../../guards/auth.guard';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn(),
            findOne: jest.fn(),
            findAll: jest.fn(),
            updateUser: jest.fn(),
            deleteUser: jest.fn(),
            removeUser: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(jest.fn(() => true))
      .overrideGuard(RolesGuard)
      .useValue(jest.fn(() => true))
      .compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'testuser@example.com',
    role: 'USER',
    password: 'hashedpassword',
  };

  const mockAdmin = {
    id: 2,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN',
    password: 'hashedpassword',
  };
  const mockReq = {
    user: { role: 'USER', id: mockUser.id },
  };
  const mockAdminReq = {
    user: { role: 'ADMIN', id: mockAdmin.id },
  };

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password',
      };

      jest.spyOn(userService, 'createUser').mockResolvedValue(mockUser as any);

      const result = await userController.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(userService.createUser).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findOne', () => {
    it('should return a user by ID', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser as any);

      const result = await userController.findOne(mockUser.id, mockReq);
      expect(result).toEqual(mockUser);
      expect(userService.findOne).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest
        .spyOn(userService, 'findOne')
        .mockRejectedValue(new NotFoundException());

      await expect(userController.findOne(99999, mockAdminReq)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'Updated Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      jest
        .spyOn(userService, 'updateUser')
        .mockResolvedValue(updatedUser as any);

      const result = await userController.update(
        mockUser.id,
        updateUserDto,
        mockReq,
      );
      expect(result).toEqual(updatedUser);
      expect(userService.updateUser).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
    });

    it('should throw NotFoundException if user to update is not found', async () => {
      jest
        .spyOn(userService, 'updateUser')
        .mockRejectedValue(new NotFoundException());

      await expect(
        userController.update(99999, { name: 'Updated Name' }, mockAdminReq),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeUser', () => {
    it('should delete a user', async () => {
      jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser as any);
      jest.spyOn(userService, 'removeUser').mockResolvedValue(undefined);

      const result = await userController.remove(mockUser.id, mockAdminReq);
      expect(result).toBeUndefined();
      expect(userService.removeUser).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw ForbiddenException if user tries to delete itself', async () => {
      await expect(async () => {
        await userController.remove(mockAdmin.id, mockAdminReq);
      }).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return a list of users', async () => {
      const mockUsers = [mockUser, mockAdmin];
      jest.spyOn(userService, 'findAll').mockResolvedValue(mockUsers as any);

      const result = await userController.findAll();
      expect(result).toEqual(mockUsers);
      expect(userService.findAll).toHaveBeenCalled();
    });
  });
});
