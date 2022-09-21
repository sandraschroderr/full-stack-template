import Boom from '@hapi/boom';
import { Context } from 'koa';
import { Service } from 'typedi';

import { memoizeAsync } from '../../common/utils/cache';
import { EntityType, Operation } from '../../common/types/entity';
import { getObjectKeysAsFieldNames } from '../../common/utils/format';
import { Pagination, FilterGroup, Order } from '../../common/types/search';
import {
  validateFilterGroups,
  validateFieldName,
  validatePagination,
} from '../../common/utils/validate';

import {
  EntityName,
  EntityNameFilter,
  CreateEntityNameInput,
  UpdateEntityNameInput,
  DeleteEntityNameInput,
} from '../types/entityName';

import { EntityNameDao } from '../daos/EntityNameDao';
import { AuthService } from './AuthService';

const filterableFieldNames = getObjectKeysAsFieldNames(new EntityNameFilter());

@Service()
export class EntityNameService {
  constructor(
    private authService: AuthService,
    private entityNameDao: EntityNameDao
  ) {}

  public async search(
    state: Context['state'],
    search: string | null,
    origFilterGroups: FilterGroup<EntityNameFilter>[],
    order: Order,
    pagination?: Pagination
  ) {
    validateFilterGroups(origFilterGroups, filterableFieldNames);
    validateFieldName(order.field, filterableFieldNames);
    validatePagination(pagination, true);

    // Check permissions
    await this.authService.checkPermission({
      state,
      entityType: EntityType.ENTITY_NAME,
      operation: Operation.LIST,
    });

    // NOTE: Add additional filters according to user permissions

    // Add additional filters
    const filterGroups = origFilterGroups;

    // filterGroups = addFilter({
    //   filterGroups,
    //   field: 'someFilter',
    //   value: someFilter,
    // });

    return this.entityNameDao.search(
      state.tx,
      search,
      filterGroups,
      order,
      pagination
    );
  }

  public read = memoizeAsync<EntityName>(this.readImpl, this);

  private async readImpl(state: Context['state'], id: string) {
    const entityName = await this.entityNameDao.read(state.tx, id);
    if (!entityName) {
      throw Boom.notFound(`EntityName not found with id ${id}`);
    }

    await this.authService.checkPermission({
      state,
      entityType: EntityType.ENTITY_NAME,
      operation: Operation.VIEW,
      entityId: entityName.id,
    });

    return entityName;
  }

  public async create(
    state: Context['state'],
    entityName: CreateEntityNameInput
  ) {
    await this.authService.checkPermission({
      state,
      entityType: EntityType.ENTITY_NAME,
      operation: Operation.ADD,
    });

    return this.entityNameDao.create(state.tx, entityName);
  }

  public async update(
    state: Context['state'],
    entityName: UpdateEntityNameInput
  ) {
    await this.authService.checkPermission({
      state,
      entityType: EntityType.ENTITY_NAME,
      operation: Operation.EDIT,
      entityId: entityName.id,
    });

    return this.entityNameDao.update(state.tx, entityName);
  }

  public async delete(
    state: Context['state'],
    entityName: DeleteEntityNameInput
  ) {
    await this.authService.checkPermission({
      state,
      entityType: EntityType.ENTITY_NAME,
      operation: Operation.DELETE,
      entityId: entityName.id,
    });

    return this.entityNameDao.delete(state.tx, entityName);
  }
}
