const findSomething = (): string => `
SELECT *
FROM SomeTable 
where somecolumn = $1`;

const Queries = {
  findSomething
};

export default Queries;
