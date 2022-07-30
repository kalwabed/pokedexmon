import { PokemonClient } from 'pokenode-ts';

const api = new PokemonClient({
  cacheOptions: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
});

export async function getAllPokemons() {
  const listPokemons = await api.listPokemons(0, 10);

  const pokemonsWithDetail = await Promise.all(
    listPokemons.results.map(async pokemon => {
      const detail = await api.getPokemonByName(pokemon.name);
      return { ...pokemon, detail };
    })
  );

  return pokemonsWithDetail.map(p => ({
    name: p.name,
    detail: {
      imageUrl: p.detail.sprites.other.dream_world.front_default ?? p.detail.sprites.other.home.front_default,
      types: p.detail.types.map(t => t.type.name),
    },
  }));
}

export async function getPokemonDetail(name: string) {
  return await Promise.all([api.getPokemonSpeciesByName(name), api.getPokemonByName(name)]);
}
