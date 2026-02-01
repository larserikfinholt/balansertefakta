import { test, expect, request } from '@playwright/test';

const API_URL = 'http://localhost:4000';

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
    const apiContext = await request.newContext({
      baseURL: API_URL,
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
});
