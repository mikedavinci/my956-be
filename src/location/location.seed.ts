// src/seeds/location.seed.ts
import { DataSource } from 'typeorm';
import { Location } from '../location/entities/location.entity';
import { LocationEnum } from '../location/enums/location.enum';

export const seedLocations = async (dataSource: DataSource) => {
  const locationRepository = dataSource.getRepository(Location);

  const locations = [
    {
      id: LocationEnum.MCALLEN,
      name: 'McAllen',
      state: 'Texas',
      country: 'USA',
    },
    {
      id: LocationEnum.MISSION,
      name: 'Mission',
      state: 'Texas',
      country: 'USA',
    },
    {
      id: LocationEnum.EDINBURG,
      name: 'Edinburg',
      state: 'Texas',
      country: 'USA',
    },
    {
      id: LocationEnum.PHARR,
      name: 'Pharr',
      state: 'Texas',
      country: 'USA',
    },
    {
      id: LocationEnum.WESLACO,
      name: 'Weslaco',
      state: 'Texas',
      country: 'USA',
    },
    {
      id: LocationEnum.HARLINGEN,
      name: 'Harlingen',
      state: 'Texas',
      country: 'USA',
    },
    {
      id: LocationEnum.BROWNSVILLE,
      name: 'Brownsville',
      state: 'Texas',
      country: 'USA',
    },
  ];

  await locationRepository.save(locations);
};
