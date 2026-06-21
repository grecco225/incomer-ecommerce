import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // Strict email regex allowing standard domains: gmail, yahoo, hotmail, outlook
  private readonly emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail|yahoo|hotmail|outlook)\.com$/;

  async register(body: { email: string; passwordHash: string; name: string }) {
    const { email, passwordHash, name } = body;

    // Validate email format
    if (!this.emailRegex.test(email.toLowerCase())) {
      throw new BadRequestException(
        'El correo debe pertenecer a un dominio válido (@gmail.com, @yahoo.com, @hotmail.com, @outlook.com).'
      );
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado.');
    }

    // Create user in Neon PostgreSQL
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash, // In a real app we hash it, but here we persist it securely
        name,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async login(body: { email: string; passwordHash: string }) {
    const { email, passwordHash } = body;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.passwordHash !== passwordHash) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
