import { PrismaModule } from './prisma/prisma.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GoodsModule } from './context/goods/goods.module';
import { AccountsModule } from './context/accounts/accounts.module';
import { BoardsModule } from './context/boards/boards.module';
import { RolesGuard } from './guard/role.guard';
import { InjectAccountMiddleware } from './middlewares/injectAccount.middleware';

@Module({
  imports: [PrismaModule, GoodsModule, AccountsModule, BoardsModule,],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: RolesGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(InjectAccountMiddleware).forRoutes('*');
  }
}
