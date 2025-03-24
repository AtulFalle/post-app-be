import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    console.log('inside auth guard', authHeader)

    if (!authHeader) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    console.log('inside auth guard: token', token)
    try {
      const decoded = this.jwtService.verify(token);
      console.log('inside auth guard: verify', decoded)

      request['user'] = decoded; // Attach user data to request
      return true;
    } catch (err) {
      return false;
    }
  }
}
