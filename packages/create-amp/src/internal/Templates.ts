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
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, "dist"])
  },
  "backend-fastify": {
    key: "backend-fastify",
    name: "Backend Nodejs w/ Fastify",
    description: "Scaffolds a nodejs server using fastify as the framework, querying your Amp dataset with arrowflight",
    directory: "/templates/backend/fastify",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, "dist"])
  },
  "backend-apollo-graphql": {
    key: "backend-apollo-graphql",
    name: "Backend Nodejs w/ Apollo GraphQL",
    description: "Scaffolds a GraphQL API server using Apollo Server and Fastify, querying your Amp dataset via AMP Gateway",
    directory: "/templates/backend/apollo-graphql",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, "dist"])
  },
  nextjs: {
    key: "nextjs",
    name: "Nextjs Fullstack app",
    description: "Scaffolds a nextjs fullstack web app",
    directory: "/templates/nextjs",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, ".next", "dist"])
  },
  "react-ampsync-electricsql": {
    key: "react-ampsync-electricsql",
    name: "React app with ampsync & electricsql",
    description:
      "Scaffolds a react application using vite as the build framework, ampsync to sync your Amp dataset data to a postgres db, and electricsql to sync data from the postgres tables into your app in realtime",
    directory: "/templates/vite-react/ampsync-electric-sql",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, ".tanstack", "dist"])
  },
  "react-arrowflight-effect-atom": {
    key: "react-arrowflight-effect-atom",
    name: "React app with arrowflight and effect-atom",
    description:
      "Scaffolds a react application using vite as the build framework, using arrowflight to query your Amp Dataset, and effect-atom for hooks to interact with the query results",
    directory: "/templates/vite-react/flight-atom",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, ".tanstack", "dist"])
  },
  "react-jsonlines-effect-atom": {
    key: "react-jsonlines-effect-atom",
    name: "React app with jsonlines and effect-atom",
    description:
      "Scaffolds a react application using vite as the build framework, using jsonlines to query your Amp Dataset, and effect-atom for hooks to interact with the query results",
    directory: "/templates/vite-react/jsonl-atom",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, ".tanstack", "dist"])
  },
  "react-jsonlines-react-query": {
    key: "react-jsonlines-react-query",
    name: "React app with jsonlines and tanstack react-query",
    description:
      "Scaffolds a react application using vite as the build framework, using jsonlines to query your Amp Dataset, and react-query for hooks and caching to interact with the query results",
    directory: "/templates/vite-react/jsonl-atom",
    skip: new Set([...Constants.ALWAYS_SKIP_DIRECTORIES, ".tanstack", "dist"])
  }
} as const satisfies Record<Domain.AvailableTemplFrameworkKey, Domain.AvailableTemplSchema>
