import { Pokemon, PokemonClient } from 'pokenode-ts';

const api = new PokemonClient({
  cacheOptions: {
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
});

function getPokemonImageUrl(pokemon: Pokemon): string {
  return pokemon.sprites.other.dream_world.front_default ?? (pokemon.sprites.other.home.front_default as string);
}

export async function getAllPokemons() {
  const listPokemons = await api.listPokemons(0, 400);

  const pokemonsWithDetail = await Promise.all(
    listPokemons.results.map(async pokemon => {
      const detail = await api.getPokemonByName(pokemon.name);
      return { ...pokemon, detail };
    })
  );

  return pokemonsWithDetail.map(p => ({
    name: p.name,
    detail: {
      imageUrl: getPokemonImageUrl(p.detail),
      types: p.detail.types.map(t => t.type.name)
    }
  }));
}

export async function getPokemonDetail(name: string) {
  return await Promise.all([api.getPokemonSpeciesByName(name), api.getPokemonByName(name)]);
}

export async function getEvoDetails(evolutionChainUrl: string) {
  const evoChainResult = await fetch(evolutionChainUrl);
  const evoChainJson = await evoChainResult.json();
  let evoData = evoChainJson.chain;
  const evoChains: string[] = [];

  while (evoData?.hasOwnProperty('evolves_to')) {
    evoChains.push(evoData.species.name);

    evoData = evoData.evolves_to[0];
  }

  const pokemons = await Promise.all(evoChains.map(name => api.getPokemonByName(name)));

  return pokemons.map(poke => ({
    name: poke.name,
    imageUrl: getPokemonImageUrl(poke)
  }));
}
