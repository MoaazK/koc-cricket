import { type SchemaTypeDefinition } from 'sanity'
import { player } from './player'
import { match } from './match'
import { news } from './news'

export const schema: { types: SchemaTypeDefinition[] } = {
    types: [player, match, news],
}
