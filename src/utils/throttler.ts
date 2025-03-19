import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const ip = req.ips.length ? req.ips[0] : req.ip;

    console.log(`🛠️ Inside ThrottlerBehindProxyGuard - IP: ${ip}`);
    return ip;
  }

  // async canActivate(context: ExecutionContext): Promise<boolean> {
  //   const canProceed = await super.canActivate(context);
  //   console.log('Can activate:', canProceed);

  //   if (!canProceed) {
  //     console.log('🚫 Throttling limit reached! Throwing error.');
  //     throw new ThrottlerException('Too many requests, slow down!'); // Lỗi 429
  //   }

  //   return canProceed;
  // }
}
