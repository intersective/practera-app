# Authentication Workflow

This documentation explains the workflow related to authentication process. Including the code execute steps, and the APIs that are used etc.

## Login Flow

This conatains information about how login works inside App.

To log user in, we use both login API and core API.

### General logic
- Use Login API to authenticate user.
  - Login API will return a list of App stacks that the user is in.
  - Each stack includes url for core, graphql, chat-api etc.
- Redirect the user to the experience switcher page.
- Send requests to core url for each stack to get the list of experiences for the user.
- Once user selected an experience, store the related stack info in local storage for future requests.

### code execute steps

1. User enter username and password and clicks on login button.
1. Make API request to Auth service login method. `authService.login`.
  - `authService.login` makes request to login API with `username` and `password`.
  - Sample

    ``` ts
    this.authService.login({
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    })
    ```
1. Auth service invokes the `post()` from request service `request.post`.
  - request body - `username` and `password` and `from`.
  - sample

    ``` ts
    this.request.post(api.loginAPI.login, body, {}, true);
    ```
1. After login api return success response. login component call Auth service directLoginWithApikey method. `authService.directLoginWithApikey`.
  - `authService.directLoginWithApikey` call core API to login user with `apikey` and `service`.
  - `apikey` is from the response of `authService.login`.
  - sample

    ``` ts
    this.authService.directLoginWithApikey({
      apikey: globalRes.apikey,
      service: 'LOGIN'
    })
    ```
1. Auth service invokes the `post()` from request service `request.post`.  
  - request body - `apikey` getting from login API.
  - serviceHeader - `LOGIN` indicates that the apikey is generated from the Login API.
  - sample

    ``` ts
    this.request.post(api.login, body.toString(), {
      headers
    })
    ```
1. core API will return timeline, programs related to login user.

## Registration Flow

This conatains information about new user registration process.

To rester a new user, we use both login API and core API. After user registered successfully, user will automatically login to the app.

### code execute steps

1. User enter password and confirm the password and clicks on register button.
2. In `auth-regitration.component.ts` `register()` method get call.
3. Validates the entered passwords if anyof them empty show errors in UI.
4. If not empty call Auth service login method. `authService.saveRegistration`.
  - `authService.saveRegistration` call core API to register user with `password` and `user_id` and `key`.
  - Sample
    ``` ts
    this.authService.saveRegistration({
      password: this.confirmPassword,
      user_id: this.user.id,
      key: this.user.key
    })
    ```
5. After registration request return success response. `auth-regitration.component.ts` start auto login process.
6. `auth-regitration.component.ts` call Auth service login method. `authService.login`.
  - `authService.login` call login API to login user with `username` and `password`.
  - Sample
    ``` ts
    this.authService.login({
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    })
    ```
7. Then from Auth service it call request service `post` method `request.post`.
  - With these params.
  - login endpoint - `'login' ( api.loginAPI.login )`.
  - request body - `username and password and from`.
  - httpOptions - `no httpOptions. so pass empty object {}`
  - isLoginAPI - to indicate need to call login API need to pass it as `true`.
  - sample

    ``` ts
    this.request.post(api.loginAPI.login, body, {}, true);
    ```
8. After login api return success response. login component call Auth service directLoginWithApikey method. `authService.directLoginWithApikey`.
  - `authService.directLoginWithApikey` call core API to login user with `apikey` and `service`.
  - `apikey` return from login api call `authService.login`.
  - sample
    ``` ts
    this.authService.directLoginWithApikey({
      apikey: globalRes.apikey,
      service: 'LOGIN'
    })
    ```
9. Then from Auth service it call request service `post` method `request.post`.  
  - With thiese params.
  - login endpoint - `'api/auths.json' ( api.login )`.
  - request body - `apikey` getting from login API.
  - serviceHeader - `LOGIN` service header as Login.
  - sample
    ``` ts
    this.request.post(api.login, body.toString(), {
      headers
    })
    ```
10. core API will return timeline, programs related to login user.