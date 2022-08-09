import extractFromObject from '../../../src/lib/utilities/extractFromObject';

describe('extractFromObject', () => {
  it.each([
    {
      input: {property: 'one'},
      output: 'one',
      path: 'property',
    },
    {
      input: {property: {child: 'two'}},
      output: 'two',
      path: 'property.child',
    },
    {
      input: {property: {child: {grandchild: 'three'}}},
      output: 'three',
      path: 'property.child.grandchild',
    },
    {
      input: {property: {0: {1: 'four'}}},
      output: 'four',
      path: 'property.0.1',
    },
  ])('extracts from the specified path %s', ({input, output, path}) => {
    expect(extractFromObject(input, path)).toEqual(output);
  });

  it.each([
    {
      input: {property: 'one'},
      output: 'Leaf not found: "prop"',
      path: 'prop',
    },
    {
      input: {property: {sub: 'two'}},
      output: 'Leaf not found: "child"',
      path: 'property.child',
    },
    {
      input: {property: {child: 'two'}},
      output: 'Branch not found: "child"',
      path: 'property.child.grandchild',
    },
  ])('throws errors on unexpected paths %s', ({input, output, path}) => {
    expect(() => extractFromObject(input, path)).toThrowError(output);
  });
});
