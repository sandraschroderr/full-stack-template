import 'reflect-metadata';
import {
  FilterGroup,
  Filter,
  FilterOperator,
  FilterLogicalOperator,
  ValueType,
} from '../types/search';
import {
  validateFilterGroups,
  validateFieldName,
  validatePagination,
} from './validate';

export class MyType {
  id: string;
  creationDate: Date;
  title: string;
  keywords: string[];
  notesCol: string;
  entityName_column: string;
}

describe('validate', () => {
  describe('#validateFieldName', () => {
    it('works ok', async () => {
      validateFieldName('title', ['title', 'colName']);
      validateFieldName('colName', ['title', 'colName']);
      validateFieldName('entityName.column', ['entityName_column']);
      validateFieldName('entityName_column', ['entityName_column']);

      expect(() =>
        validateFieldName('entityName.column', ['entityName_column'], false)
      ).toThrow("Invalid field name: 'entityName.column'");

      expect(() => validateFieldName('column', ['title', 'col_name'])).toThrow(
        "Invalid field name: 'column'"
      );
    });
  });

  describe('#validateFilterGroups', () => {
    it('works ok', async () => {
      const filters1: Filter<MyType>[] = [
        new Filter<MyType>(
          MyType,
          'title',
          FilterOperator.EQ,
          'titlevalue',
          ValueType.TEXT
        ),
        new Filter<MyType>(
          MyType,
          'notesCol',
          FilterOperator.ILIKE,
          'notesvalue',
          ValueType.TEXT
        ),
      ];

      const filters2: Filter<MyType>[] = [
        new Filter<MyType>(
          MyType,
          'title',
          FilterOperator.GT,
          'titlevalue',
          ValueType.TEXT
        ),
        new Filter<MyType>(
          MyType,
          'entityName_column',
          FilterOperator.NEQ,
          'value',
          ValueType.TEXT
        ),
      ];

      const filterGroups: FilterGroup<MyType>[] = [
        new FilterGroup<MyType>(MyType, FilterLogicalOperator.OR, filters1),
        new FilterGroup<MyType>(MyType, FilterLogicalOperator.AND, filters2),
      ];

      validateFilterGroups(filterGroups, [
        'title',
        'notesCol',
        'entityName_column',
      ]);

      expect(() =>
        validateFilterGroups(filterGroups, ['desc', 'notes'])
      ).toThrow('Invalid filter fields: entityName_column, notesCol, title');
    });
  });

  describe('#validatePagination', () => {
    it('checks null', async () => {
      expect(() => validatePagination(null)).toThrow('Pagination not set.');
      validatePagination(null, true);
    });

    it('checks limit', async () => {
      validatePagination({ offset: 0, limit: 100 });
      validatePagination({ offset: 0, limit: 2000 }, false, 2000);
      expect(() => validatePagination({ offset: 0, limit: 2000 })).toThrow(
        'The given pagination limit (2000) exceeds allowed limit (1000).'
      );
      expect(() =>
        validatePagination({ offset: 0, limit: 3000 }, false, 2000)
      ).toThrow(
        'The given pagination limit (3000) exceeds allowed limit (2000).'
      );

      expect(() => validatePagination(null)).toThrow('Pagination not set.');
      validatePagination(null, true);
    });
  });
});
