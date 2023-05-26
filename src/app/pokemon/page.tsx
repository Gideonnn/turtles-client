import "server-only";

export default async function Pokemon({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const server = searchParams.server as string;
  const cache = searchParams.cache as string;

  let pokemon = [];

  if (cache === "false") {
    // No cache
    pokemon = await fetch(server || "http://localhost:3001", {
      cache: "no-store",
    }).then((res) => res.json());
  } else {
    // Five second cache
    pokemon = await fetch(server || "http://localhost:3001", {
      next: { revalidate: 5 },
    }).then((res) => res.json());
  }

  const randomPokemon = pokemon[Math.floor(Math.random() * pokemon.length)];

  return <pre>{JSON.stringify(randomPokemon.name)}</pre>;
}
