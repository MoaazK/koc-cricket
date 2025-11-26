'use client'

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/studio/[[...tool]]/page.tsx` route
 */

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from './src/sanity/env'
import { schema } from './src/sanity/schemaTypes'

export default defineConfig({
    basePath: '/studio',
    projectId: projectId || 'placeholder-project-id',
    dataset: dataset || 'placeholder-dataset',
    // Add and edit the content schema in the './sanity/schemaTypes' folder
    schema,
    plugins: [
        structureTool(),
        // Vision tool temporarily removed due to Next.js 16 compatibility issues
        // visionTool({defaultApiVersion: apiVersion}),
    ],
})
