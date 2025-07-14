import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaClient, User } from '@prisma/client'

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async getAllNonAdminUsers(): Promise<{ id: string; name: string }[]> {
    /**
     * add a try catch block here
     */
    return await this.prisma.user.findMany({
      where: {
        admin: false,
      },
      select: {
        id: true,
        name: true,
      },
    })
  }
}
