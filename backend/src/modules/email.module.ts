import { ConfigModule } from '@nestjs/config'
import { EmailService } from '../services/email.service'
import { Module } from '@nestjs/common'
import { AuthController } from '../controllers/auth.controller'

@Module({
  imports: [ConfigModule],
  providers: [EmailService],
  exports: [EmailService], // Makes it available to other modules
})
export class EmailModule {}

// Then import it in other modules
@Module({
  imports: [EmailModule], // Import the module
  controllers: [AuthController],
})
export class AuthModule {}
