import "server-only";

export default async function Pokemon({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const server = searchParams.server as string;
  const cache = searchParams.cache as string;

  if (!server) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <p className="mt-8">Please provide a server</p>
      </div>
    );
  }

  let pokemon = [];

  if (cache === "false") {
    // No cache
    pokemon = await fetch(server, {
      cache: "no-store",
    }).then((res) => res.json());
  } else {
    // Five second cache
    pokemon = await fetch(server, {
      next: { revalidate: 5 },
    }).then((res) => res.json());
  }

  const randomPokemon = pokemon[Math.floor(Math.random() * pokemon.length)];

  return (
    <div className="mt-16">
      <p className="w-full text-center text-9xl">{randomPokemon.name}</p>
    </div>
  );
}
