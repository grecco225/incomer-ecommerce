import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // No roles required
    }
    
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    
    if (!userId) {
      throw new UnauthorizedException('No user ID provided in headers for role verification');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('You do not have permission to access this resource. Admin role required.');
    }
    
    return true;
  }
}
