import { Global, Module } from "@nestjs/common";
import { CookieService } from "./services/cookie.service";

@Global()
@Module({
  providers: [CookieService],
  exports: [CookieService],
})
export class CommonModule {}
