import DataLoader from 'dataloader'
import { User, Match } from './connectors'

const batchGet = (model, keys) =>
  model.findAll({ where: { id: keys } }).then(elements => {
    const map = new Map(elements.map(element => [element.id, element]))
    return keys.map(key => map.get(key))
  })

export const userLoader = () => new DataLoader(keys => batchGet(User, keys))
export const matchLoader = () => new DataLoader(keys => batchGet(Match, keys))
