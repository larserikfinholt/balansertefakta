import { test, expect, request } from '@playwright/test';

const API_URL = 'http://localhost:4000';

// Helper function to login and get auth token
async function loginUser(email: string, password: string): Promise<string> {
  const apiContext = await request.newContext({
    baseURL: API_URL,
  });

  const response = await apiContext.post('/graphql', {
    data: {
      query: `
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            token
            user {
              id
              email
            }
          }
        }
      `,
      variables: { email, password },
    },
  });

  const json = await response.json();
  return json.data.login.token;
}

test.describe('GraphQL API', () => {
  test('should return topics from GraphQL endpoint', async () => {
    const apiContext = await request.newContext({
      baseURL: API_URL,
    });

    const response = await apiContext.post('/graphql', {
      data: {
        query: `
          query {
            topics {
              id
              title
              slug
            }
          }
        `,
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data).toHaveProperty('topics');
    expect(Array.isArray(json.data.topics)).toBeTruthy();
  });

  test('should create a topic via mutation', async () => {
    const apiContext = await request.newContext({
      baseURL: API_URL,
    });

    const slug = `test-topic-${Date.now()}`;
    
    const response = await apiContext.post('/graphql', {
      data: {
        query: `
          mutation CreateTopic($input: CreateTopicInput!) {
            createTopic(input: $input) {
              id
              title
              slug
            }
          }
        `,
        variables: {
          input: {
            title: 'E2E Test Topic',
            description: 'Created by E2E test',
            slug,
          },
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data.createTopic).toHaveProperty('id');
    expect(json.data.createTopic.title).toBe('E2E Test Topic');
    expect(json.data.createTopic.slug).toBe(slug);
  });

  test('should create a claim with pro and contra arguments', async () => {
    // Login first
    const token = await loginUser('vegard@test.no', 'password123');
    
    const apiContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 1. Create a claim
    const claimResponse = await apiContext.post('/graphql', {
      data: {
        query: `
          mutation CreateClaim($input: CreateClaimInput!) {
            createClaim(input: $input) {
              id
              statement
              claimType
              proArgumentCount
              contraArgumentCount
              isBalanced
            }
          }
        `,
        variables: {
          input: {
            statement: 'E2E Test Claim - Climate change is primarily caused by human activity',
            context: 'Test claim for E2E testing',
            claimType: 'EMPIRICAL',
          },
        },
      },
    });

    expect(claimResponse.ok()).toBeTruthy();
    const claimJson = await claimResponse.json();
    const claimId = claimJson.data.createClaim.id;
    expect(claimJson.data.createClaim.isBalanced).toBe(false);

    // 2. Add a PRO argument
    const proResponse = await apiContext.post('/graphql', {
      data: {
        query: `
          mutation CreateArgument($input: CreateArgumentInput!) {
            createArgument(input: $input) {
              id
              content
              argumentType
            }
          }
        `,
        variables: {
          input: {
            content: 'Scientific consensus supports this claim based on multiple studies',
            argumentType: 'PRO',
            strength: 'HIGH',
            claimId,
          },
        },
      },
    });

    expect(proResponse.ok()).toBeTruthy();

    // 3. Add a CONTRA argument
    const contraResponse = await apiContext.post('/graphql', {
      data: {
        query: `
          mutation CreateArgument($input: CreateArgumentInput!) {
            createArgument(input: $input) {
              id
              content
              argumentType
            }
          }
        `,
        variables: {
          input: {
            content: 'Natural climate variability has always existed',
            argumentType: 'CONTRA',
            strength: 'MEDIUM',
            claimId,
          },
        },
      },
    });

    expect(contraResponse.ok()).toBeTruthy();

    // 4. Verify the claim is now balanced
    const verifyResponse = await apiContext.post('/graphql', {
      data: {
        query: `
          query GetClaim($id: String!) {
            claim(id: $id) {
              id
              proArgumentCount
              contraArgumentCount
              isBalanced
            }
          }
        `,
        variables: { id: claimId },
      },
    });

    expect(verifyResponse.ok()).toBeTruthy();
    const verifyJson = await verifyResponse.json();
    expect(verifyJson.data.claim.proArgumentCount).toBe(1);
    expect(verifyJson.data.claim.contraArgumentCount).toBe(1);
    expect(verifyJson.data.claim.isBalanced).toBe(true);
  });

  test('should record events in the event log', async () => {
    const apiContext = await request.newContext({
      baseURL: API_URL,
    });

    const response = await apiContext.post('/graphql', {
      data: {
        query: `
          query {
            events(limit: 5) {
              id
              eventType
              entityType
              entityId
              createdAt
            }
          }
        `,
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(Array.isArray(json.data.events)).toBeTruthy();
  });
});

test.describe('Balance Enforcement', () => {
  test('claim should not be balanced without both argument types', async () => {
    const apiContext = await request.newContext({
      baseURL: API_URL,
    });

    // Create a claim with only PRO argument
    const claimResponse = await apiContext.post('/graphql', {
      data: {
        query: `
          mutation CreateClaim($input: CreateClaimInput!) {
            createClaim(input: $input) {
              id
              isBalanced
            }
          }
        `,
        variables: {
          input: {
            statement: 'Unbalanced test claim',
            claimType: 'EMPIRICAL',
          },
        },
      },
    });

    const claimId = (await claimResponse.json()).data.createClaim.id;

    // Add only PRO argument
    await apiContext.post('/graphql', {
      data: {
        query: `
          mutation CreateArgument($input: CreateArgumentInput!) {
            createArgument(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            content: 'Only pro argument',
            argumentType: 'PRO',
            claimId,
          },
        },
      },
    });

    // Verify still unbalanced
    const verifyResponse = await apiContext.post('/graphql', {
      data: {
        query: `
          query GetClaim($id: String!) {
            claim(id: $id) {
              isBalanced
              proArgumentCount
              contraArgumentCount
            }
          }
        `,
        variables: { id: claimId },
      },
    });

    const verifyJson = await verifyResponse.json();
    expect(verifyJson.data.claim.isBalanced).toBe(false);
    expect(verifyJson.data.claim.proArgumentCount).toBe(1);
    expect(verifyJson.data.claim.contraArgumentCount).toBe(0);
  });

  test('should create validation and earn credits', async () => {
    const token = await loginUser('vegard@test.no', 'password123');
    
    const apiContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Get initial credits
    const statusBefore = await apiContext.post('/graphql', {
      data: {
        query: `
          query {
            myStatus {
              validationCredits
              totalValidations
            }
          }
        `,
      },
    });

    const statusBeforeJson = await statusBefore.json();
    const initialCredits = statusBeforeJson.data.myStatus.validationCredits;
    const initialValidations = statusBeforeJson.data.myStatus.totalValidations;

    // Get a claim from seed data to validate
    const claimsResponse = await apiContext.post('/graphql', {
      data: {
        query: `
          query {
            claims(status: ACCEPTED) {
              id
              statement
            }
          }
        `,
      },
    });

    const claimsJson = await claimsResponse.json();
    const claimToValidate = claimsJson.data.claims.find((c: any) => 
      c.statement.includes('Global temperatures')
    );

    // Create validation
    const validationResponse = await apiContext.post('/graphql', {
      data: {
        query: `
          mutation CreateValidation($input: CreateValidationInput!) {
            createValidation(input: $input) {
              id
              validationType
              comment
            }
          }
        `,
        variables: {
          input: {
            claimId: claimToValidate.id,
            validationType: 'CONFIRMED',
            comment: 'This is well supported by scientific evidence',
          },
        },
      },
    });

    expect(validationResponse.ok()).toBeTruthy();
    const validationJson = await validationResponse.json();
    expect(validationJson.data.createValidation.validationType).toBe('CONFIRMED');

    // Verify credits increased
    const statusAfter = await apiContext.post('/graphql', {
      data: {
        query: `
          query {
            myStatus {
              validationCredits
              totalValidations
            }
          }
        `,
      },
    });

    const statusAfterJson = await statusAfter.json();
    expect(statusAfterJson.data.myStatus.validationCredits).toBe(initialCredits + 1);
    expect(statusAfterJson.data.myStatus.totalValidations).toBe(initialValidations + 1);
  });

  test('should reject publishing without enough credits', async () => {
    // Create a new user with 0 credits
    const apiContext = await request.newContext({
      baseURL: API_URL,
    });

    const email = `test-${Date.now()}@test.no`;
    await apiContext.post('/graphql', {
      data: {
        query: `
          mutation Register($email: String!, $password: String!, $displayName: String!) {
            register(email: $email, password: $password, displayName: $displayName) {
              token
            }
          }
        `,
        variables: {
          email,
          password: 'password123',
          displayName: 'Test User',
        },
      },
    });

    const token = await loginUser(email, 'password123');
    
    const authedContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Try to create a claim without validating first
    const claimResponse = await authedContext.post('/graphql', {
      data: {
        query: `
          mutation CreateClaim($input: CreateClaimInput!) {
            createClaim(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            statement: 'Test claim',
            context: 'Test',
            claimType: 'EMPIRICAL',
          },
        },
      },
    });

    const json = await claimResponse.json();
    expect(json.errors).toBeDefined();
    expect(json.errors[0].message).toContain('Insufficient validation credits');
  });

  test('should reject publishing without opposing validations', async () => {
    // Create a new user
    const apiContext = await request.newContext({
      baseURL: API_URL,
    });

    const email = `test-${Date.now()}@test.no`;
    const registerResponse = await apiContext.post('/graphql', {
      data: {
        query: `
          mutation Register($email: String!, $password: String!, $displayName: String!) {
            register(email: $email, password: $password, displayName: $displayName) {
              token
            }
          }
        `,
        variables: {
          email,
          password: 'password123',
          displayName: 'Test User 2',
        },
      },
    });

    const registerJson = await registerResponse.json();
    const token = registerJson.data.register.token;
    
    const authedContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Manually give user credits (simulate having validated to get credits)
    // In real scenario, user would validate 2+ pieces of content
    // For now, try creating claim which should fail on validation count

    const claimResponse = await authedContext.post('/graphql', {
      data: {
        query: `
          mutation CreateClaim($input: CreateClaimInput!) {
            createClaim(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            statement: 'Another test claim',
            context: 'Test',
            claimType: 'EMPIRICAL',
          },
        },
      },
    });

    const json = await claimResponse.json();
    expect(json.errors).toBeDefined();
    expect(json.errors[0].message).toContain('must validate at least');
  });

  test('canPublish query reflects user publishing eligibility', async () => {
    const token = await loginUser('vegard@test.no', 'password123');
    
    const apiContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await apiContext.post('/graphql', {
      data: {
        query: `
          query CanPublish($contentType: String!, $argumentType: String) {
            canPublish(contentType: $contentType, argumentType: $argumentType) {
              allowed
              currentCredits
              requiredCredits
              opposingValidationsCount
              requiredOpposingValidations
              reasons
            }
          }
        `,
        variables: {
          contentType: 'claim',
        },
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data.canPublish).toHaveProperty('allowed');
    expect(json.data.canPublish).toHaveProperty('currentCredits');
    expect(json.data.canPublish).toHaveProperty('requiredCredits');
    expect(json.data.canPublish.requiredCredits).toBe(3); // credits_per_claim rule
  });

  test('should return publishing rules', async () => {
    const apiContext = await request.newContext({
      baseURL: API_URL,
    });

    const response = await apiContext.post('/graphql', {
      data: {
        query: `
          query {
            publishingRules {
              id
              ruleKey
              ruleValue
              description
            }
          }
        `,
      },
    });

    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    expect(json.data.publishingRules).toBeDefined();
    expect(Array.isArray(json.data.publishingRules)).toBeTruthy();
    
    const rules = json.data.publishingRules;
    expect(rules.find((r: any) => r.ruleKey === 'credits_per_claim')).toBeDefined();
    expect(rules.find((r: any) => r.ruleKey === 'credits_per_argument')).toBeDefined();
    expect(rules.find((r: any) => r.ruleKey === 'min_opposing_validations')).toBeDefined();
  });

  test('should reject anonymous validation attempts', async () => {
    const apiContext = await request.newContext({
      baseURL: API_URL,
    });

    const claimsResponse = await apiContext.post('/graphql', {
      data: {
        query: `
          query {
            claims(status: ACCEPTED) {
              id
            }
          }
        `,
      },
    });

    const claimsJson = await claimsResponse.json();
    const claimId = claimsJson.data.claims[0].id;

    const validationResponse = await apiContext.post('/graphql', {
      data: {
        query: `
          mutation CreateValidation($input: CreateValidationInput!) {
            createValidation(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            claimId,
            validationType: 'CONFIRMED',
            comment: 'Test',
          },
        },
      },
    });

    const json = await validationResponse.json();
    expect(json.errors).toBeDefined();
    expect(json.errors[0].message).toContain('Must be authenticated');
  });

  test('validation requires exactly one target', async () => {
    const token = await loginUser('vegard@test.no', 'password123');
    
    const apiContext = await request.newContext({
      baseURL: API_URL,
      extraHTTPHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Try to create validation with no targets
    const response = await apiContext.post('/graphql', {
      data: {
        query: `
          mutation CreateValidation($input: CreateValidationInput!) {
            createValidation(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            validationType: 'CONFIRMED',
            comment: 'Test without target',
          },
        },
      },
    });

    const json = await response.json();
    expect(json.errors).toBeDefined();
    expect(json.errors[0].message).toContain('exactly one target');
  });
});
