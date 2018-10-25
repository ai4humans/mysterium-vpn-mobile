/*
 * Copyright (C) 2018 The "MysteriumNetwork/mysterion" Authors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { ProposalDTO } from 'mysterium-tequilapi'
import { CONFIG } from '../config'
import { Countries } from './countries'
import { storage } from './favorite-storage'

class Proposal {
  public name: string
  public id: string
  public isFavorite: boolean

  constructor (proposal: ProposalDTO, isFavorite: boolean) {
    this.name = this.getCountryName(proposal)
    this.id = proposal.providerId
    this.isFavorite = isFavorite
  }

  public async toggleFavorite () {
    this.isFavorite = !this.isFavorite
    await storage.setFavorite(this.id, this.isFavorite)
  }

  public compareTo (other: Proposal): number {
    if (this.isFavorite && !other.isFavorite) {
      return -1
    } else if (!this.isFavorite && other.isFavorite) {
      return 1
    } else if (this.name > other.name) {
      return 1
    } else if (this.name < other.name) {
      return -1
    }
    return 0
  }

  private getCountryName (proposal: ProposalDTO) {
    let countryCode = ''

    if (proposal.serviceDefinition && proposal.serviceDefinition.locationOriginate) {
      countryCode = proposal.serviceDefinition.locationOriginate.country.toLocaleLowerCase()
    }

    return Countries[countryCode] || CONFIG.TEXTS.UNKNOWN
  }
}

const sortFunction = (a: Proposal, b: Proposal): number => {
  return a.compareTo(b)
}

async function sortFavorites (proposals: ProposalDTO[]): Promise<Proposal[]> {
  const favorites = await storage.getFavorites()

  return proposals
    .map(p => new Proposal(p, favorites[p.providerId] === true))
    .sort(sortFunction)
}

export { sortFavorites, Proposal }
