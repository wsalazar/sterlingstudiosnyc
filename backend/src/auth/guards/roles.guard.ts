import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class RolesGuard implements CanActivate {
  private prisma: PrismaClient

  constructor(private reflector: Reflector) {
    this.prisma = new PrismaClient()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    )
    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user) {
      return false
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: { admin: true },
    })

    return dbUser?.admin || false
  }
}
