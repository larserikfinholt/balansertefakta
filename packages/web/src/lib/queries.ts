import { gql } from '@apollo/client';

export const GET_TOPICS = gql`
  query GetTopics {
    topics {
      id
      title
      description
      slug
      subtopics {
        id
        title
        slug
      }
    }
  }
`;

export const GET_TOPIC = gql`
  query GetTopic($slug: String!) {
    topic(slug: $slug) {
      id
      title
      description
      slug
      subtopics {
        id
        title
        description
        slug
        questions {
          id
          title
          slug
          status
          isBalanced
        }
      }
    }
  }
`;

export const GET_QUESTION = gql`
  query GetQuestion($id: String!) {
    question(id: $id) {
      id
      title
      description
      status
      isBalanced
      maturityChecklist {
        hasScope
        hasDisagreementAxis
        hasProArguments
        hasContraArguments
        hasSupportingEvidence
        hasChallengingEvidence
        completenessScore
      }
      scope {
        id
        temporalScope
        geographicScope
        systemBoundary
        assumptions
      }
      disagreements {
        id
        description
        disagreementType
        createdAt
        createdBy {
          id
          displayName
        }
      }
      claims {
        id
        claim {
          id
          statement
          claimType
          status
          isBalanced
          proArgumentCount
          contraArgumentCount
          scope {
            id
            temporalScope
            geographicScope
            systemBoundary
            assumptions
          }
          arguments {
            id
            content
            argumentType
            strength
            scope {
              id
              temporalScope
              geographicScope
              systemBoundary
              assumptions
            }
            counterpositions {
              id
              content
            }
            evidenceLinks {
              id
              linkageStrength
              isChallenged
              challenges {
                id
                challengeType
                description
                status
                responseCount
                createdAt
                createdBy {
                  id
                  displayName
                }
                responses {
                  id
                  content
                  depth
                  createdAt
                  createdBy {
                    id
                    displayName
                  }
                  replies {
                    id
                    content
                    depth
                    createdAt
                    createdBy {
                      id
                      displayName
                    }
                  }
                }
              }
              extract {
                id
                content
                extractType
                pageNumber
                artifact {
                  id
                  title
                  url
                  artifactType
                  publishedAt
                  authors
                  outlet {
                    name
                    domain {
                      name
                      hostname
                      credibilityScore
                    }
                  }
                }
              }
            }
          }
        }
      }
      measures {
        id
        measure {
          id
          title
          description
          rationale
          status
          isBalanced
          proArgumentCount
          contraArgumentCount
          arguments {
            id
            content
            argumentType
            strength
            counterpositions {
              id
              content
            }
            evidenceLinks {
              id
              linkageStrength
              isChallenged
              extract {
                id
                content
                extractType
                pageNumber
                artifact {
                  id
                  title
                  url
                  artifactType
                  publishedAt
                  authors
                  outlet {
                    name
                    domain {
                      name
                      hostname
                      credibilityScore
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const CREATE_TOPIC = gql`
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
      id
      title
      slug
    }
  }
`;

export const CREATE_CLAIM = gql`
  mutation CreateClaim($input: CreateClaimInput!) {
    createClaim(input: $input) {
      id
      statement
      claimType
    }
  }
`;

export const CREATE_ARGUMENT = gql`
  mutation CreateArgument($input: CreateArgumentInput!) {
    createArgument(input: $input) {
      id
      content
      argumentType
      strength
    }
  }
`;

// Auth mutations
export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        displayName
        authLevel
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        displayName
        authLevel
      }
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      email
      displayName
      authLevel
    }
  }
`;

export const CHALLENGE_SOURCE = gql`
  mutation ChallengeSource($input: ChallengeSourceInput!) {
    challengeSource(input: $input) {
      id
      challengeType
      description
      status
    }
  }
`;

// Evidence link query for dedicated page
export const GET_EVIDENCE_LINK = gql`
  query GetEvidenceLink($id: String!) {
    evidenceLink(id: $id) {
      id
      linkageStrength
      isChallenged
      createdBy {
        id
        displayName
      }
      extract {
        id
        content
        extractType
        pageNumber
        timestamp
        paragraph
        artifact {
          id
          title
          url
          artifactType
          publishedAt
          authors
          outlet {
            id
            name
            domain {
              id
              name
              hostname
              credibilityScore
            }
          }
        }
      }
      claim {
        id
        statement
      }
      argument {
        id
        content
        argumentType
        claim {
          id
          statement
        }
      }
      measure {
        id
        title
      }
      challenges {
        id
        challengeType
        description
        status
        responseCount
        createdAt
        createdBy {
          id
          displayName
        }
        responses {
          id
          content
          depth
          createdAt
          createdBy {
            id
            displayName
          }
          evidenceLink {
            id
            extract {
              content
              artifact {
                title
                url
              }
            }
          }
          replies {
            id
            content
            depth
            createdAt
            createdBy {
              id
              displayName
            }
            evidenceLink {
              id
              extract {
                content
                artifact {
                  title
                  url
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Challenge response mutations
export const CREATE_CHALLENGE_RESPONSE = gql`
  mutation CreateChallengeResponse($input: CreateChallengeResponseInput!) {
    createChallengeResponse(input: $input) {
      id
      content
      depth
      createdAt
      createdBy {
        id
        displayName
      }
    }
  }
`;

export const ACKNOWLEDGE_CHALLENGE = gql`
  mutation AcknowledgeChallenge($challengeId: String!) {
    acknowledgeChallenge(challengeId: $challengeId) {
      id
      status
    }
  }
`;

export const RETRACT_EVIDENCE = gql`
  mutation RetractEvidence($evidenceLinkId: String!, $reason: String!) {
    retractEvidence(evidenceLinkId: $evidenceLinkId, reason: $reason) {
      id
      challenges {
        id
        status
      }
    }
  }
`;

export const FLAG_CHALLENGE = gql`
  mutation FlagChallenge($challengeId: String!, $reason: String!) {
    flagChallenge(challengeId: $challengeId, reason: $reason) {
      id
      status
    }
  }
`;

// User Stance queries and mutations
export const GET_USER_STANCE = gql`
  query GetUserStance($questionId: String!) {
    userStance(questionId: $questionId) {
      id
      descriptiveAssessment
      normativePreference
      justifications
      note
    }
  }
`;

export const GET_QUESTION_STANCES = gql`
  query GetQuestionStances($questionId: String!) {
    questionStances(questionId: $questionId) {
      id
      descriptiveAssessment
      normativePreference
      user {
        id
        displayName
      }
    }
  }
`;

export const SET_USER_STANCE = gql`
  mutation SetUserStance($input: SetUserStanceInput!) {
    setUserStance(input: $input) {
      id
      descriptiveAssessment
      normativePreference
      justifications
      note
    }
  }
`;

// Scope mutation
export const SET_SCOPE = gql`
  mutation SetScope($input: SetScopeInput!) {
    setScope(input: $input) {
      id
      temporalScope
      geographicScope
      systemBoundary
      assumptions
    }
  }
`;

// Disagreement mutation
export const CREATE_DISAGREEMENT = gql`
  mutation CreateDisagreement($input: CreateDisagreementInput!) {
    createDisagreement(input: $input) {
      id
      description
      disagreementType
    }
  }
`;

// Navigation creation mutations
export const CREATE_SUBTOPIC = gql`
  mutation CreateSubtopic($input: CreateSubtopicInput!) {
    createSubtopic(input: $input) {
      id
      title
      slug
    }
  }
`;

export const CREATE_QUESTION = gql`
  mutation CreateQuestion($input: CreateQuestionInput!) {
    createQuestion(input: $input) {
      id
      title
      slug
    }
  }
`;

// Content creation mutations
export const ADD_CLAIM_TO_QUESTION = gql`
  mutation AddClaimToQuestion($input: AddClaimToQuestionInput!) {
    addClaimToQuestion(input: $input) {
      id
      claim {
        id
        statement
      }
    }
  }
`;

export const CREATE_COUNTERPOSITION = gql`
  mutation CreateCounterposition($input: CreateCounterpositionInput!) {
    createCounterposition(input: $input) {
      id
      content
    }
  }
`;

// Evidence creation mutations
export const CREATE_ARTIFACT = gql`
  mutation CreateArtifact($input: CreateArtifactInput!) {
    createArtifact(input: $input) {
      id
      url
      title
      artifactType
    }
  }
`;

export const CREATE_EXTRACT = gql`
  mutation CreateExtract($input: CreateExtractInput!) {
    createExtract(input: $input) {
      id
      content
      extractType
      pageNumber
    }
  }
`;

export const LINK_EVIDENCE = gql`
  mutation LinkEvidence($input: LinkEvidenceInput!) {
    linkEvidence(input: $input) {
      id
      linkageStrength
      extract {
        id
        content
      }
    }
  }
`;

// Summary queries and mutations
export const GET_SUMMARIES = gql`
  query GetSummaries($questionId: String!) {
    summaries(questionId: $questionId) {
      id
      version
      proPoints
      contraPoints
      dataDisagreements
      interpretationDisagreements
      valueDisagreements
      openQuestions
      status
      createdAt
      createdBy {
        id
        displayName
      }
    }
  }
`;

export const CREATE_SUMMARY = gql`
  mutation CreateSummary($input: CreateSummaryInput!) {
    createSummary(input: $input) {
      id
      version
      proPoints
      contraPoints
    }
  }
`;
