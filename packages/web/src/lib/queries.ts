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
      subtopic {
        id
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
          createdBy {
            id
            displayName
          }
          arguments {
            id
            content
            argumentType
            strength
            validationCount
            createdAt
            createdBy {
              id
              displayName
            }
            counterpositions {
              id
              content
              createdBy {
                id
                displayName
              }
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
    }
  }
`;

export const GET_QUESTIONS_BY_SUBTOPIC = gql`
  query GetQuestionsBySubtopic($subtopicId: String!, $excludeId: String) {
    questionsBySubtopic(subtopicId: $subtopicId, excludeId: $excludeId) {
      id
      title
      isBalanced
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
      createdBy {
        id
        displayName
      }
    }
  }
`;

export const GET_UNVALIDATED_OPPOSING_ARGUMENTS = gql`
  query GetUnvalidatedOpposingArguments($questionId: String!, $argumentType: String!) {
    unvalidatedOpposingArguments(questionId: $questionId, argumentType: $argumentType) {
      id
      content
      argumentType
      strength
      createdBy {
        id
        displayName
      }
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

// Validation queries and mutations
export const MY_STATUS = gql`
  query MyStatus {
    myStatus {
      validationCredits
      qualityScore
      totalValidations
      confirmedCount
      challengedCount
      nuancedCount
      publishedClaims
      publishedArguments
    }
  }
`;

export const MY_VALIDATIONS = gql`
  query MyValidations {
    myValidations {
      id
      validationType
      comment
      createdAt
      claim {
        id
        statement
      }
      argument {
        id
        content
        argumentType
      }
      evidenceLink {
        id
      }
    }
  }
`;

export const CAN_PUBLISH = gql`
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
`;

export const PUBLISHING_RULES = gql`
  query PublishingRules {
    publishingRules {
      id
      ruleKey
      ruleValue
      description
      createdAt
    }
  }
`;

export const CREATE_VALIDATION = gql`
  mutation CreateValidation($input: CreateValidationInput!) {
    createValidation(input: $input) {
      id
      validationType
      comment
      createdAt
    }
  }
`;

export const VALIDATIONS_FOR_CLAIM = gql`
  query ValidationsForClaim($claimId: String!) {
    validationsForClaim(claimId: $claimId) {
      id
      validationType
      comment
      createdAt
      user {
        id
        displayName
      }
    }
  }
`;

export const VALIDATIONS_FOR_ARGUMENT = gql`
  query ValidationsForArgument($argumentId: String!) {
    validationsForArgument(argumentId: $argumentId) {
      id
      validationType
      comment
      createdAt
      user {
        id
        displayName
      }
    }
  }
`;
