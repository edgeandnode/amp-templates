import * as Constants from "../Constants.ts"
import type * as Domain from "../Domain.ts"

/** @internal */
export const AVAILABLE_TEMPLATES = {
  "backend-express": {
    key: "backend-express",
    name: "Backend Nodejs w/ Express",
    description:
      "Scaffolds a nodejs server using expressjs as the framework, querying your Amp dataset with arrowflight",
    directory: "/templates/backend/express",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, "dist"]),
    type: "build-dataset"
  },
  "backend-fastify": {
    key: "backend-fastify",
    name: "Backend Nodejs w/ Fastify",
    description: "Scaffolds a nodejs server using fastify as the framework, querying your Amp dataset with arrowflight",
    directory: "/templates/backend/fastify",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, "dist"]),
    type: "build-dataset"
  },
  "backend-apollo-graphql": {
    key: "backend-apollo-graphql",
    name: "Backend Nodejs w/ Apollo GraphQL",
    description: "Scaffolds a GraphQL API server using Apollo Server and Fastify, querying local Amp datasets via Arrow Flight",
    directory: "/templates/backend/apollo-graphql",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, "dist"]),
    type: "build-dataset"
  },
  "backend-express-gateway": {
    key: "backend-express-gateway",
    name: "Backend Nodejs w/ Express (Gateway)",
    description: "Scaffolds a REST API server using Express, querying remote Amp datasets via AMP Gateway",
    directory: "/templates/backend/express-gateway",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, "dist"]),
    type: "existing-dataset"
  },
  "backend-fastify-gateway": {
    key: "backend-fastify-gateway",
    name: "Backend Nodejs w/ Fastify (Gateway)",
    description: "Scaffolds a REST API server using Fastify, querying remote Amp datasets via AMP Gateway",
    directory: "/templates/backend/fastify-gateway",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, "dist"]),
    type: "existing-dataset"
  },
  "backend-apollo-graphql-gateway": {
    key: "backend-apollo-graphql-gateway",
    name: "Backend Nodejs w/ Apollo GraphQL (Gateway)",
    description: "Scaffolds a GraphQL API server using Apollo Server and Fastify, querying remote Amp datasets via AMP Gateway",
    directory: "/templates/backend/apollo-graphql-gateway",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, "dist"]),
    type: "existing-dataset"
  },
  nextjs: {
    key: "nextjs",
    name: "Nextjs Fullstack app",
    description: "Scaffolds a nextjs fullstack web app",
    directory: "/templates/nextjs",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, ".next", "dist"]),
    type: "build-dataset"
  },
  "react-ampsync-electricsql": {
    key: "react-ampsync-electricsql",
    name: "React app with ampsync & electricsql",
    description:
      "Scaffolds a react application using vite as the build framework, ampsync to sync your Amp dataset data to a postgres db, and electricsql to sync data from the postgres tables into your app in realtime",
    directory: "/templates/vite-react/ampsync-electric-sql",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, ".tanstack", "dist"]),
    type: "build-dataset"
  },
  "react-arrowflight-effect-atom": {
    key: "react-arrowflight-effect-atom",
    name: "React app with arrowflight and effect-atom",
    description:
      "Scaffolds a react application using vite as the build framework, using arrowflight to query your Amp Dataset, and effect-atom for hooks to interact with the query results",
    directory: "/templates/vite-react/flight-atom",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, ".tanstack", "dist"]),
    type: "build-dataset"
  },
  "react-jsonlines-effect-atom": {
    key: "react-jsonlines-effect-atom",
    name: "React app with jsonlines and effect-atom",
    description:
      "Scaffolds a react application using vite as the build framework, using jsonlines to query your Amp Dataset, and effect-atom for hooks to interact with the query results",
    directory: "/templates/vite-react/jsonl-atom",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, ".tanstack", "dist"]),
    type: "build-dataset"
  },
  "react-jsonlines-react-query": {
    key: "react-jsonlines-react-query",
    name: "React app with jsonlines and tanstack react-query",
    description:
      "Scaffolds a react application using vite as the build framework, using jsonlines to query your Amp Dataset, and react-query for hooks and caching to interact with the query results",
    directory: "/templates/vite-react/jsonl-atom",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, ".tanstack", "dist"]),
    type: "build-dataset"
  },
  "react-jsonlines-transfers": {
    key: "react-jsonlines-transfers",
    name: "React app using jsonlines to query an existing Arbitrum-One RPC transfers",
    description:
      "Scaffolds a react application using vite as the build framework, using jsonlines to query the edgeandnode/arbitrum_one Amp Dataset",
    directory: "/templates/vite-react/jsonl-transfers",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, ".tanstack", "dist"]),
    type: "existing-dataset"
  }
} as const satisfies Record<Domain.AvailableTemplFrameworkKey, Domain.AvailableTemplSchema>
