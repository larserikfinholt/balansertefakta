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
          arguments {
            id
            content
            argumentType
            strength
            counterpositions {
              id
              content
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
