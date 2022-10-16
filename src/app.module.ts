import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { JwtMiddleWare } from './middlewares/jwt.middleware';
import { JwtService } from '@nestjs/jwt';
import { GoodsModule } from './context/goods/goods.module';
import { AccountsModule } from './context/accounts/accounts.module';
import { BoardsModule} from './context/boards/boards.module'
@Module({
  imports: [GoodsModule, AccountsModule, BoardsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleWare)
      .forRoutes
      // { path: 'post/*', method: RequestMethod.POST },
      // { path: 'post/*', method: RequestMethod.PATCH },
      // { path: 'post/*', method: RequestMethod.DELETE },
      ();
  }
}
