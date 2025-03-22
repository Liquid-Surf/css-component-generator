import { object, string } from 'yup';
import { getLoggerFor } from '@solid/community-server';
import { assertAccountId } from '@solid/community-server';
import type { JsonRepresentation } from '@solid/community-server';
import { JsonInteractionHandler } from '@solid/community-server';
import type { JsonInteractionHandlerInput } from '@solid/community-server';
import type { JsonView } from '@solid/community-server';
import { parseSchema, validateWithError } from '@solid/community-server';
import type { PasswordIdRoute } from '@solid/community-server';
import type { PasswordStore } from '@solid/community-server';

type OutType = { resource: string };

const inSchema = object({
  email: string().trim().email().required(),
  password: string().trim().min(1).required(),
});

/**
 * Handles the creation of email/password login combinations for an account.
 */

export class CreateTemplateNameHandler extends JsonInteractionHandler<OutType> implements JsonView {
  protected readonly logger = getLoggerFor(this);

  private readonly passwordStore: PasswordStore;
  private readonly passwordRoute: PasswordIdRoute;

  public constructor(passwordStore: PasswordStore, passwordRoute: PasswordIdRoute) {
    super();
    this.passwordStore = passwordStore;
    this.passwordRoute = passwordRoute;
  }

  public async getView({ accountId }: JsonInteractionHandlerInput): Promise<JsonRepresentation> {
    assertAccountId(accountId);
    const passwordLogins: Record<string, string> = {};
    for (const { id, email } of await this.passwordStore.findByAccount(accountId)) {
      passwordLogins[email] = this.passwordRoute.getPath({ accountId, passwordId: id });
    }
    return { json: { ...parseSchema(inSchema), passwordLogins }};
  }

  public async handle({ accountId, json }: JsonInteractionHandlerInput): Promise<JsonRepresentation<OutType>> {
    // Email will be in lowercase
    const { email, password } = await validateWithError(inSchema, json);
    assertAccountId(accountId);

    const passwordId = await this.passwordStore.create(email, accountId, password);
    const resource = this.passwordRoute.getPath({ accountId, passwordId });

    // If we ever want to add email verification this would have to be checked separately
    await this.passwordStore.confirmVerification(passwordId);

    return { json: { resource }};
  }
}
