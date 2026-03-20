import { useJoyas } from "../../hooks/useJoyas";
import { Spinner } from "../ui/Spinner";
import { JoyaCard } from "./JoyaCard";

export const JoyaGrid = () => {
  const { joyas, isLoading, errorMessage } = useJoyas();

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <p className="rounded-md border border-red-400 bg-red-50 px-4 py-3 text-center text-base text-red-800 dark:border-red-700 dark:bg-red-900 dark:text-red-200">
        {errorMessage}
      </p>
    );
  }

  if (joyas.length === 0) {
    return (
      <p className="text-center text-base text-metallic-gold-700 dark:text-ocean-mist-400">
        No se encontraron joyas en el catálogo.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {joyas.map((joya) => (
        <JoyaCard key={joya.id} joya={joya} />
      ))}
    </div>
  );
};
