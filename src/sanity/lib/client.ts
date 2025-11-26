import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId, useCdn } from '../env'

export const client = createClient({
    projectId: projectId || 'placeholder-project-id',
    dataset: dataset || 'placeholder-dataset',
    apiVersion,
    useCdn,
    perspective: 'published',
})

