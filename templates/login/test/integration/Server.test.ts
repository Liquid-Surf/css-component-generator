import { App, AppRunner, joinFilePath } from '@solid/community-server';

describe('My Server', (): void => {
  let app: App;

  beforeAll(async(): Promise<void> => {
    // This creates an App, which can be used to start (and stop) a CSS instance
    app = await new AppRunner().create(
      {
        // For testing we created a custom configuration that runs the server in memory so nothing gets written on disk.
        config: joinFilePath(__dirname, '../config/template-name-memory.json'),
        loaderProperties: {
          // Tell Components.js where to start looking for component configurations.
          // We need to make sure it finds the components we made in our project
          // so this needs to point to the root directory of our project.
          mainModulePath: joinFilePath(__dirname, '../../'),
          // We don't want Components.js to create an error dump in case something goes wrong with our test.
          dumpErrorState: false,
        },
        // We use the CLI options to set the port of our server to 3456
        // and disable logging so nothing gets printed during our tests.
        // Should you have multiple test files, it is important they all host their test server
        // on a different port to prevent conflicts.
        shorthand: {
          port: 3456,
          loggingLevel: 'off',
        },
        // We do not use any custom Components.js variable bindings and set our values through the CLI options below.
        // Note that this parameter is optional, so you can just drop it.
        variableBindings: {}
      }
    );

    // This starts with the settings provided above
    await app.start();
  });

  afterAll(async(): Promise<void> => {
    // Make sure to stop the server after all tests are finished so jest can finish.
    await app.stop();
  });

  it('runs.', async(): Promise<void> => {
    // Verify that our server is running correctly.
    // In practice, you would want to add tests here that test the specific behaviour added by your new components.
    const response = await fetch('http://localhost:3456');
    expect(response.status).toBe(200);
  });
  it('returns the correct login template URL', async(): Promise<void> => {
    const response = await fetch('http://localhost:3456/.account/');
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.controls.html.templateName.login).toBe('http://localhost:3456/.account/login/template-name/');
  });
  it('returns the correct login template URL without html', async(): Promise<void> => {
    const response = await fetch('http://localhost:3456/.account/');
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.controls.templateName.login).toBe('http://localhost:3456/.account/login/template-name/');
  });
  it('returns the correct login providers', async(): Promise<void> => {
    const response = await fetch('http://localhost:3456/.account/login/');
    expect(response.status).toBe(200);
    const json = await response.json();
    const logins = json.logins;
    
    // Check there are at least 2 login providers
    expect(Object.keys(logins).length).toBeGreaterThanOrEqual(2);
    
    // Check that "Login with templateName" is one of the providers
    expect(Object.keys(logins)).toContain('Login with templateName');
  });
  it('returns HTML containing "secret code ?" when requesting the login template', async(): Promise<void> => {
    const response = await fetch('http://localhost:3456/.account/login/template-name/', {
      headers: {
        'Accept': 'text/html'
      }
    });
    expect(response.status).toBe(200);
    const text = await response.text();
    expect(text).toContain('secret code ?');
  });

});
