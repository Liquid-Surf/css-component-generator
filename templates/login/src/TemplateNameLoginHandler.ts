import { boolean, number, object, string } from 'yup';
import { getLoggerFor } from '@solid/community-server';
import { ForbiddenHttpError } from '@solid/community-server';
import type { AccountStore } from '@solid/community-server';
import type { CookieStore } from '@solid/community-server';
import type { JsonRepresentation } from '@solid/community-server';
import type { JsonInteractionHandlerInput } from '@solid/community-server';
import type { JsonView } from '@solid/community-server';
import type { LoginOutputType } from '@solid/community-server';
import { ResolveLoginHandler } from '@solid/community-server';
import { parseSchema, validateWithError } from '@solid/community-server';
import type { PasswordStore } from '@solid/community-server';

const inSchema = object({
  email: string().trim().email().required(),
  password: string().trim().required(),
  code: number().required(),
  remember: boolean().default(false),
});

export interface TemplateNameLoginHandlerArgs {
  accountStore: AccountStore;
  passwordStore: PasswordStore;
  cookieStore: CookieStore;
}

/**
 * Handles the submission of the Login Form and logs the user in.
 */
export class TemplateNameLoginHandler extends ResolveLoginHandler implements JsonView {
  protected readonly logger = getLoggerFor(this);

  private readonly passwordStore: PasswordStore;

  public constructor(args: TemplateNameLoginHandlerArgs) {
    super(args.accountStore, args.cookieStore);
    this.passwordStore = args.passwordStore;
  }

  public async getView(): Promise<JsonRepresentation> {
    return { json: parseSchema(inSchema) };
  }

  public async login({ json }: JsonInteractionHandlerInput): Promise<JsonRepresentation<LoginOutputType>> {
    const { email, password, code, remember } = await validateWithError(inSchema, json);
    // Try to log in, will error if email/password combination is invalid
    if( code != 42)
      throw new ForbiddenHttpError("Invalid secret code", {errorCode: "H403"})
    const { accountId } = await this.passwordStore.authenticate(email, password);
    this.logger.debug(`Logging in user ${email}`);

    return { json: { accountId, remember }};
  }
}
