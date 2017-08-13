
import Maybe from 'folktale/maybe';
import {
  compose,
  assoc,
  prop,
  path,
  sortBy,
  groupBy,
  indexBy,
  uniq,
} from 'ramda';

export const getOrElse = (object, key, value) =>
  Maybe.fromNullable(object)
       .map(prop(key))
       .getOrElse(value)

