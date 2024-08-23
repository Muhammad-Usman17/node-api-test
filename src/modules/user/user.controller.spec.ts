import { Test, TestingModule } from '@nestjs/testing';

import { JwtService } from '@nestjs/jwt';
import { Like, Repository } from 'typeorm';

import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { UserEntity, UserRole } from './entities/user.entity';

describe('UserController', () => {
  let app;
  let jwtService: JwtService;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    jwtService = moduleRef.get<JwtService>(JwtService);
    userRepository = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  // Helper function to create a user with a specific role
  const createUser = async (role: UserRole) => {
    const user = new UserEntity();
    user.name = 'Test User';
    user.email = `testuser${Date.now()}@example.com`;
    user.password = 'password';
    user.role = role;
    const token = generateToken(user);
    user.accessToken = token;
    return await userRepository.save(user);
  };

  // Helper function to generate a JWT token
  const generateToken = (user) => {
    return jwtService.sign({ ...user, sub: Date.now() });
  };

  it('USER should be able to view their own details', async () => {
    const user = await createUser(UserRole.ADMIN);

    const response = await request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  });

  it("USER should not be able to view other users' details", async () => {
    const user1 = await createUser(UserRole.USER);
    const user2 = await createUser(UserRole.USER);

    await request(app.getHttpServer())
      .get(`/users/${user2.id}`)
      .set('Authorization', `Bearer ${user1.accessToken}`)
      .expect(403);
  });

  it('ADMIN should be able to get a list of users', async () => {
    const admin = await createUser(UserRole.ADMIN);

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('ADMIN should be able to update the details of another user', async () => {
    const admin = await createUser(UserRole.ADMIN);
    const user = await createUser(UserRole.ADMIN);

    const updatedUserDetails = {
      name: 'Updated Name',
      email: 'testuserupdatedemail@example.com',
    };

    const response = await request(app.getHttpServer())
      .patch(`/users/${user.id}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .send(updatedUserDetails)
      .expect(200);

    expect(response.body).toMatchObject(updatedUserDetails);
  });

  it('ADMIN should be able to delete another user', async () => {
    const admin = await createUser(UserRole.ADMIN);
    const user = await createUser(UserRole.USER);

    await request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    // Verify user is deleted
    await request(app.getHttpServer())
      .get(`/users/${user.id}`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(404);
  });

  it('No role should be able to delete themselves', async () => {
    const user = await createUser(UserRole.USER);

    await request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .expect(403);
  });

  it('Should return 404 for ADMIN trying to access non-existent user', async () => {
    const admin = await createUser(UserRole.ADMIN);

    await request(app.getHttpServer())
      .get(`/users/99999`)
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(404);
  });

  afterAll(async () => {
    const testUsers = await userRepository.find({
      where: { email: Like('testuser%') },
    });
    await userRepository.remove(testUsers);
    await app.close();
  });
});
