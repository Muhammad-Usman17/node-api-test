import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { AuthGuard } from '../../guards/auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { UserService } from './user.service';
import { UserEntity } from './entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_secret_key', // Replace with a strong secret
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [UserController], // Register the UserController
  providers: [
    UserService, // Register the UserService
    AuthGuard, // Register the AuthGuard
    RolesGuard, // Register the RolesGuard
    JwtStrategy, // Register the JWT Strategy for authentication
  ],
  exports: [UserService],
})
export class UserModule {}
