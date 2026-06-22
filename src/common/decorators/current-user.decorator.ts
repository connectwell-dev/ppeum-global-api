import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../interfaces/permission.interface';
import { resolveTestFallbackEmployeeId } from '../utils/auth-context';

// ─── @CurrentUser('id') / @CurrentUser('permission') 등 토큰 페이로드에서 값 추출 ──
// - 토큰이 있을 때: request.user 에서 해당 키 값 반환
// - 토큰이 없고 data='id' 인 경우 (개발/테스트 한정): super_admin 직원 id 를 fallback 으로 반환
//   · 운영(NODE_ENV=production) 에서는 fallback 비활성 → 가드 미통과 시 undefined
//   · 'id' 외 다른 키 (permission / loginId / name 등) 는 fallback 없음
export const CurrentUser = createParamDecorator(
  async (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JwtPayload | undefined = request.user;
    if (!user) {
      if (data === 'id') return await resolveTestFallbackEmployeeId();
      return undefined;
    }
    return data ? user[data] : user;
  },
);
