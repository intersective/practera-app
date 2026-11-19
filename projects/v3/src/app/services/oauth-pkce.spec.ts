import * as pkce from './oauth-pkce';

describe('OAuth page continuation', () => {
  const resume=(stack:string)=>(pkce as any).getPkceResumeStart(stack);
  beforeEach(()=>sessionStorage.removeItem('oauth_pkce'));
  afterEach(()=>sessionStorage.removeItem('oauth_pkce'));
  it('restores the same tab and stack destination without reusing credentials',()=>{
    sessionStorage.setItem('oauth_pkce',JSON.stringify({stackUuid:'stack-1',createdAt:Date.now(),verifier:'old-secret',state:'old-state',email:'old@example.test',destination:{redirect:'badges-certificates',token:'secret'}}));
    const start=resume('stack-1');
    expect(start).toEqual({stackUuid:'stack-1',destination:{redirect:'badges-certificates'},redirect:'badges-certificates'});
  });
  it('rejects another stack and stale or malformed state',()=>{
    sessionStorage.setItem('oauth_pkce',JSON.stringify({stackUuid:'stack-1',createdAt:Date.now(),destination:{redirect:'badges-certificates'}}));
    expect(resume('stack-2')).toBeNull();
    sessionStorage.setItem('oauth_pkce',JSON.stringify({stackUuid:'stack-1',createdAt:Date.now()-31*60*1000,destination:{redirect:'badges-certificates'}}));
    expect(resume('stack-1')).toBeNull();
    sessionStorage.setItem('oauth_pkce','{invalid');
    expect(resume('stack-1')).toBeNull();
  });
});
