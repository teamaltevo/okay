import { TryAsync } from '../src/result';

export * from '../src/result';

export interface CatFact {
    _id: string
    text: string
    updatedAt: string
    deleted: boolean
    source: string
    sentCount: number
}
  

function localOperation(throws: boolean): CatFact {
    if (throws) {
        throw new Error('Local operation failed');
    }

    return {
        _id: '1234',
        text: 'Local operation succeeded',
        updatedAt: new Date().toISOString(),
        deleted: false,
        source: 'local',
        sentCount: 0
    };
}

async function getFacts(): Promise<CatFact> {
    const res = await fetch('https://cat-fact.herokuapp.com/facts/random')
    if (!res.ok) {
        throw new Error('Failed to fetch cat facts');
    }

    return res.json();
}

console.log('Fetching cat facts...');
const result = await TryAsync(getFacts);
console.log(result.toString());
result.fold(
    (fact) => console.info(fact.text),
    (err) => console.error(err.message)
);
