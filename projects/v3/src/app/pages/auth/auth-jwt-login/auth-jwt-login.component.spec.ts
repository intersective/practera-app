import { convertToParamMap } from '@angular/router';
import { AuthJwtLoginComponent } from './auth-jwt-login.component';

describe('certificate OAuth destination',()=>{
  function component(params:Record<string,string>){
    return new AuthJwtLoginComponent({} as any,{} as any,
      {snapshot:{paramMap:convertToParamMap(params)}} as any,
      {clearCache:async()=>{}} as any,{} as any,{} as any,{} as any,{} as any,{} as any);
  }
  it('opens the user collection without requiring a timeline',async()=>{
    const c=component({redirect:'badges-certificates'});
    const route=spyOn<any>(c,'_saveOrRedirect').and.returnValue(Promise.resolve(true));
    await (c as any)._redirect();
    expect(route.calls.mostRecent().args[0]).toEqual(['v3','badges-certificates']);
  });
  it('opens the collection even if optional program initialization fails',async()=>{
    const c=component({redirect:'badges-certificates'});
    (c as any).experienceService={switchProgram:()=>Promise.reject(Error('Team unavailable'))};
    const route=spyOn<any>(c,'_saveOrRedirect').and.returnValue(Promise.resolve(true));
    await (c as any)._redirect({experience:{id:1}});
    expect(route.calls.mostRecent().args[0]).toEqual(['v3','badges-certificates']);
  });
  it('still requires a timeline for program destinations',async()=>{
    const c=component({redirect:'home'});
    const route=spyOn<any>(c,'_saveOrRedirect').and.returnValue(Promise.resolve(true));
    await (c as any)._redirect();
    expect(route.calls.mostRecent().args[0]).toEqual(['experiences']);
  });
});
